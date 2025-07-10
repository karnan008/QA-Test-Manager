
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface TestCase {
  id: string;
  testCaseId: string;
  title: string;
  module: string;
  precondition: string;
  steps: string;
  expectedResult: string;
  tags?: string[];
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Draft' | 'Final' | 'Passed' | 'Failed';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  screenshots?: string[];
}

export interface Module {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

interface TestCaseContextType {
  testCases: TestCase[];
  modules: Module[];
  addTestCase: (testCase: Omit<TestCase, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTestCase: (id: string, testCase: Partial<TestCase>) => void;
  deleteTestCase: (id: string) => void;
  addModule: (module: Omit<Module, 'id' | 'createdAt'>) => void;
  updateModule: (id: string, module: Partial<Module>) => void;
  deleteModule: (id: string) => void;
  importTestCases: (cases: Partial<TestCase>[]) => { added: number; skipped: number; duplicates: number };
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedModule: string;
  setSelectedModule: (module: string) => void;
}

const TestCaseContext = createContext<TestCaseContextType | undefined>(undefined);

export const useTestCases = () => {
  const context = useContext(TestCaseContext);
  if (context === undefined) {
    throw new Error('useTestCases must be used within a TestCaseProvider');
  }
  return context;
};

export const TestCaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');

  useEffect(() => {
    // Load from localStorage
    const savedTestCases = localStorage.getItem('testCases');
    const savedModules = localStorage.getItem('modules');
    
    if (savedTestCases) {
      try {
        const parsed = JSON.parse(savedTestCases);
        setTestCases(parsed.map((tc: any) => ({
          ...tc,
          createdAt: new Date(tc.createdAt),
          updatedAt: new Date(tc.updatedAt)
        })));
      } catch (error) {
        console.error('Error loading test cases:', error);
      }
    }
    
    if (savedModules) {
      try {
        const parsed = JSON.parse(savedModules);
        setModules(parsed.map((m: any) => ({
          ...m,
          createdAt: new Date(m.createdAt)
        })));
      } catch (error) {
        console.error('Error loading modules:', error);
      }
    } else {
      // Initialize with default modules
      const defaultModules = [
        { id: '1', name: 'Authentication', description: 'Login and user management', createdAt: new Date() },
        { id: '2', name: 'User Interface', description: 'UI components and interactions', createdAt: new Date() },
        { id: '3', name: 'API', description: 'Backend API testing', createdAt: new Date() }
      ];
      setModules(defaultModules);
      localStorage.setItem('modules', JSON.stringify(defaultModules));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('testCases', JSON.stringify(testCases));
  }, [testCases]);

  useEffect(() => {
    localStorage.setItem('modules', JSON.stringify(modules));
  }, [modules]);

  const addTestCase = (testCaseData: Omit<TestCase, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTestCase: TestCase = {
      ...testCaseData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTestCases(prev => [...prev, newTestCase]);
  };

  const updateTestCase = (id: string, updates: Partial<TestCase>) => {
    setTestCases(prev => prev.map(tc => 
      tc.id === id 
        ? { ...tc, ...updates, updatedAt: new Date() }
        : tc
    ));
  };

  const deleteTestCase = (id: string) => {
    setTestCases(prev => prev.filter(tc => tc.id !== id));
  };

  const addModule = (moduleData: Omit<Module, 'id' | 'createdAt'>) => {
    const newModule: Module = {
      ...moduleData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setModules(prev => [...prev, newModule]);
  };

  const updateModule = (id: string, updates: Partial<Module>) => {
    setModules(prev => prev.map(m => 
      m.id === id ? { ...m, ...updates } : m
    ));
  };

  const deleteModule = (id: string) => {
    setModules(prev => prev.filter(m => m.id !== id));
    // Also remove test cases from this module
    setTestCases(prev => prev.filter(tc => tc.module !== modules.find(m => m.id === id)?.name));
  };

  const importTestCases = (cases: Partial<TestCase>[]): { added: number; skipped: number; duplicates: number } => {
    let added = 0;
    let skipped = 0;
    let duplicates = 0;

    const existingIds = new Set(testCases.map(tc => tc.testCaseId));

    cases.forEach(caseData => {
      if (!caseData.testCaseId || !caseData.title || !caseData.module) {
        skipped++;
        return;
      }

      if (existingIds.has(caseData.testCaseId)) {
        duplicates++;
        return;
      }

      const newTestCase: TestCase = {
        id: Date.now().toString() + Math.random(),
        testCaseId: caseData.testCaseId,
        title: caseData.title,
        module: caseData.module,
        precondition: caseData.precondition || '',
        steps: caseData.steps || '',
        expectedResult: caseData.expectedResult || '',
        tags: caseData.tags || [],
        priority: caseData.priority || 'Medium',
        status: caseData.status || 'Draft',
        createdBy: caseData.createdBy || 'Unknown',
        createdAt: new Date(),
        updatedAt: new Date(),
        screenshots: []
      };

      setTestCases(prev => [...prev, newTestCase]);
      added++;
    });

    return { added, skipped, duplicates };
  };

  const value = {
    testCases,
    modules,
    addTestCase,
    updateTestCase,
    deleteTestCase,
    addModule,
    updateModule,
    deleteModule,
    importTestCases,
    searchTerm,
    setSearchTerm,
    selectedModule,
    setSelectedModule
  };

  return <TestCaseContext.Provider value={value}>{children}</TestCaseContext.Provider>;
};

import React, { useState } from 'react';
import { useTestCases } from '@/contexts/TestCaseContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, Eye, Filter, TestTube } from 'lucide-react';
import TestCaseForm from './TestCaseForm';
import TestCaseDetails from './TestCaseDetails';

const TestCaseList: React.FC = () => {
  const { testCases, modules, searchTerm, setSearchTerm, selectedModule, setSelectedModule, deleteTestCase } = useTestCases();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState(null);
  const [viewingTestCase, setViewingTestCase] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filteredTestCases = testCases.filter(tc => {
    const matchesSearch = !searchTerm || 
      tc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tc.testCaseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tc.steps.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tc.expectedResult.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModule = selectedModule === 'all' || tc.module === selectedModule;
    const matchesStatus = statusFilter === 'all' || tc.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || tc.priority === priorityFilter;
    
    return matchesSearch && matchesModule && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'High': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Passed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'Final': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (showForm) {
    return (
      <TestCaseForm
        testCase={editingTestCase}
        onClose={() => {
          setShowForm(false);
          setEditingTestCase(null);
        }}
      />
    );
  }

  if (viewingTestCase) {
    return (
      <TestCaseDetails
        testCase={viewingTestCase}
        onClose={() => setViewingTestCase(null)}
        onEdit={(tc) => {
          setViewingTestCase(null);
          setEditingTestCase(tc);
          setShowForm(true);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Test Cases</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Test Case
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search test cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedModule} onValueChange={setSelectedModule}>
              <SelectTrigger>
                <SelectValue placeholder="All Modules" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {modules.map(module => (
                  <SelectItem key={module.id} value={module.name}>
                    {module.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Final">Final</SelectItem>
                <SelectItem value="Passed">Passed</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSelectedModule('all');
              setStatusFilter('all');
              setPriorityFilter('all');
            }}>
              <Filter className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Cases Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTestCases.map(testCase => (
          <Card key={testCase.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{testCase.testCaseId}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{testCase.title}</p>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewingTestCase(testCase)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {(user?.role === 'admin' || testCase.createdBy === user?.username) && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingTestCase(testCase);
                          setShowForm(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this test case?')) {
                            deleteTestCase(testCase.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Module:</span>
                  <span className="font-medium">{testCase.module}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Priority:</span>
                  <Badge className={getPriorityColor(testCase.priority)}>
                    {testCase.priority}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge className={getStatusColor(testCase.status)}>
                    {testCase.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Created by {testCase.createdBy} on {testCase.createdAt.toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTestCases.length === 0 && (
        <div className="text-center py-12">
          <TestTube className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No test cases found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm || selectedModule !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first test case'
            }
          </p>
          {!searchTerm && selectedModule === 'all' && statusFilter === 'all' && priorityFilter === 'all' && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Test Case
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default TestCaseList;


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, Table as TableIcon } from 'lucide-react';
import TestCaseTableView from './TestCaseTableView';
import TestCaseCardView from './TestCaseCardView';

const TestCaseList: React.FC = () => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Test Cases</h1>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <TableIcon className="mr-2 h-4 w-4" />
            Table
          </Button>
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('cards')}
          >
            <LayoutGrid className="mr-2 h-4 w-4" />
            Cards
          </Button>
        </div>
      </div>

      {viewMode === 'table' ? <TestCaseTableView /> : <TestCaseCardView />}
    </div>
  );
};

export default TestCaseList;

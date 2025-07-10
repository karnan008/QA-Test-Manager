
import React from 'react';
import { useTestCases } from '@/contexts/TestCaseContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TestTube, CheckCircle, XCircle, Clock, FolderOpen } from 'lucide-react';

const DashboardStats: React.FC = () => {
  const { testCases, modules } = useTestCases();

  const stats = {
    total: testCases.length,
    passed: testCases.filter(tc => tc.status === 'Passed').length,
    failed: testCases.filter(tc => tc.status === 'Failed').length,
    pending: testCases.filter(tc => tc.status === 'Draft').length,
    modules: modules.length
  };

  const cards = [
    {
      title: 'Total Test Cases',
      value: stats.total,
      icon: TestTube,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900'
    },
    {
      title: 'Passed',
      value: stats.passed,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900'
    },
    {
      title: 'Failed',
      value: stats.failed,
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900'
    },
    {
      title: 'Modules',
      value: stats.modules,
      icon: FolderOpen,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={`p-2 rounded-full ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;

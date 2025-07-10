
import React from 'react';
import DashboardStats from '@/components/dashboard/DashboardStats';
import { useTestCases } from '@/contexts/TestCaseContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Activity } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { testCases, modules } = useTestCases();

  const recentTestCases = testCases
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);

  const moduleStats = modules.map(module => {
    const moduleTestCases = testCases.filter(tc => tc.module === module.name);
    const passed = moduleTestCases.filter(tc => tc.status === 'Passed').length;
    const failed = moduleTestCases.filter(tc => tc.status === 'Failed').length;
    const total = moduleTestCases.length;
    
    return {
      ...module,
      total,
      passed,
      failed,
      passRate: total > 0 ? Math.round((passed / total) * 100) : 0
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Passed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'Final': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your test case management system</p>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Recent Test Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTestCases.length > 0 ? (
                recentTestCases.map(testCase => (
                  <div key={testCase.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{testCase.testCaseId}</p>
                      <p className="text-sm text-muted-foreground truncate">{testCase.title}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-muted-foreground">{testCase.module}</span>
                        <Badge className={`text-xs ${getStatusColor(testCase.status)}`}>
                          {testCase.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {testCase.updatedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No test cases yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Module Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {moduleStats.length > 0 ? (
                moduleStats.map(module => (
                  <div key={module.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">{module.name}</p>
                      <span className="text-sm text-muted-foreground">
                        {module.total} test{module.total !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex space-x-2 text-xs">
                      <div className="flex-1 bg-green-100 dark:bg-green-900 rounded px-2 py-1 text-center">
                        <span className="text-green-800 dark:text-green-300">
                          {module.passed} Passed
                        </span>
                      </div>
                      <div className="flex-1 bg-red-100 dark:bg-red-900 rounded px-2 py-1 text-center">
                        <span className="text-red-800 dark:text-red-300">
                          {module.failed} Failed
                        </span>
                      </div>
                      <div className="flex-1 bg-blue-100 dark:bg-blue-900 rounded px-2 py-1 text-center">
                        <span className="text-blue-800 dark:text-blue-300">
                          {module.passRate}% Pass Rate
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No modules yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

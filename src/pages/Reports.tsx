import React, { useState, useMemo } from 'react';
import { useTestCases } from '@/contexts/TestCaseContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, FileText, BarChart3, PieChart as PieChartIcon, Users, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import PDFExport from '@/components/reports/PDFExport';

const Reports: React.FC = () => {
  const { testCases, modules } = useTestCases();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');

  const statusColors = {
    Draft: '#6b7280',
    Final: '#3b82f6',
    Passed: '#10b981',
    Failed: '#ef4444'
  };

  const priorityColors = {
    Low: '#10b981',
    Medium: '#f59e0b',
    High: '#f97316',
    Critical: '#ef4444'
  };

  const filteredTestCases = useMemo(() => {
    return testCases.filter(tc => {
      const moduleMatch = selectedModule === 'all' || tc.module === selectedModule;
      const userMatch = selectedUser === 'all' || tc.createdBy === selectedUser;
      return moduleMatch && userMatch;
    });
  }, [testCases, selectedModule, selectedUser]);

  const summaryStats = useMemo(() => {
    const total = filteredTestCases.length;
    const byStatus = filteredTestCases.reduce((acc, tc) => {
      acc[tc.status] = (acc[tc.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byPriority = filteredTestCases.reduce((acc, tc) => {
      acc[tc.priority] = (acc[tc.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byModule = filteredTestCases.reduce((acc, tc) => {
      acc[tc.module] = (acc[tc.module] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, byStatus, byPriority, byModule };
  }, [filteredTestCases]);

  const chartData = {
    status: Object.entries(summaryStats.byStatus).map(([status, count]) => ({
      name: status,
      value: count,
      color: statusColors[status]
    })),
    priority: Object.entries(summaryStats.byPriority).map(([priority, count]) => ({
      name: priority,
      value: count,
      color: priorityColors[priority]
    })),
    module: Object.entries(summaryStats.byModule).map(([module, count]) => ({
      name: module,
      value: count
    }))
  };

  const uniqueUsers = useMemo(() => {
    const users = [...new Set(testCases.map(tc => tc.createdBy))];
    return users.filter(Boolean);
  }, [testCases]);

  const exportToExcel = () => {
    const exportData = filteredTestCases.map(tc => ({
      'Test Case ID': tc.testCaseId,
      'Title': tc.title,
      'Module': tc.module,
      'Priority': tc.priority,
      'Status': tc.status,
      'Created By': tc.createdBy,
      'Created Date': tc.createdAt.toLocaleDateString(),
      'Updated Date': tc.updatedAt.toLocaleDateString(),
      'Precondition': tc.precondition,
      'Steps': tc.steps,
      'Expected Result': tc.expectedResult,
      'Tags': tc.tags?.join(', ') || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Test Cases Report');
    
    const fileName = `test-cases-report-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    toast({
      title: "Success",
      description: "Report exported successfully"
    });
  };

  const exportSummaryToExcel = () => {
    const summaryData = [
      { Metric: 'Total Test Cases', Value: summaryStats.total },
      { Metric: 'Draft', Value: summaryStats.byStatus.Draft || 0 },
      { Metric: 'Final', Value: summaryStats.byStatus.Final || 0 },
      { Metric: 'Passed', Value: summaryStats.byStatus.Passed || 0 },
      { Metric: 'Failed', Value: summaryStats.byStatus.Failed || 0 },
      ...Object.entries(summaryStats.byModule).map(([module, count]) => ({
        Metric: `Module: ${module}`,
        Value: count
      }))
    ];

    const ws = XLSX.utils.json_to_sheet(summaryData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Summary Report');
    
    const fileName = `summary-report-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    toast({
      title: "Success",
      description: "Summary report exported successfully"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <div className="flex space-x-2">
          <Button onClick={exportSummaryToExcel} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Summary
          </Button>
          <Button onClick={exportToExcel}>
            <Download className="mr-2 h-4 w-4" />
            Export Detailed Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Filter by Module</label>
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
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Filter by User</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {uniqueUsers.map(user => (
                    <SelectItem key={user} value={user}>
                      {user}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Test Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <div className="h-3 w-3 rounded-full bg-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.byStatus.Draft || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Final</CardTitle>
            <div className="h-3 w-3 rounded-full bg-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.byStatus.Final || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passed</CardTitle>
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.byStatus.Passed || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <div className="h-3 w-3 rounded-full bg-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.byStatus.Failed || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <Tabs defaultValue="charts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="detailed">Detailed View</TabsTrigger>
          <TabsTrigger value="pdf-export">PDF Export</TabsTrigger>
        </TabsList>
        
        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <PieChartIcon className="h-5 w-5" />
                  <CardTitle>Status Distribution</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.status}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.status.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Priority Distribution */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <CardTitle>Priority Distribution</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.priority}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8">
                      {chartData.priority.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Module Distribution */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <CardTitle>Test Cases by Module</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData.module} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Test Case Report</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Case ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Created Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTestCases.map(tc => (
                    <TableRow key={tc.id}>
                      <TableCell className="font-medium">{tc.testCaseId}</TableCell>
                      <TableCell className="max-w-xs truncate">{tc.title}</TableCell>
                      <TableCell>{tc.module}</TableCell>
                      <TableCell>
                        <Badge className={`${
                          tc.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                          tc.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                          tc.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {tc.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${
                          tc.status === 'Passed' ? 'bg-green-100 text-green-800' :
                          tc.status === 'Failed' ? 'bg-red-100 text-red-800' :
                          tc.status === 'Final' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {tc.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{tc.createdBy}</TableCell>
                      <TableCell>{tc.createdAt.toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pdf-export">
          <PDFExport 
            summaryStats={summaryStats}
            chartData={chartData}
            selectedModule={selectedModule}
            selectedUser={selectedUser}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;

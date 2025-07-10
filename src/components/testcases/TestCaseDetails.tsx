
import React from 'react';
import { TestCase } from '@/contexts/TestCaseContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Calendar, User, Image } from 'lucide-react';

interface TestCaseDetailsProps {
  testCase: TestCase;
  onClose: () => void;
  onEdit: (testCase: TestCase) => void;
}

const TestCaseDetails: React.FC<TestCaseDetailsProps> = ({ testCase, onClose, onEdit }) => {
  const { user } = useAuth();

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onClose}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Test Cases
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{testCase.testCaseId}</h1>
            <p className="text-muted-foreground">{testCase.title}</p>
          </div>
        </div>
        {(user?.role === 'admin' || testCase.createdBy === user?.username) && (
          <Button onClick={() => onEdit(testCase)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Case Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Module</p>
                  <p className="mt-1">{testCase.module}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Priority</p>
                  <Badge className={`mt-1 ${getPriorityColor(testCase.priority)}`}>
                    {testCase.priority}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className={`mt-1 ${getStatusColor(testCase.status)}`}>
                    {testCase.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Test Case ID</p>
                  <p className="mt-1 font-mono">{testCase.testCaseId}</p>
                </div>
              </div>

              {testCase.tags && testCase.tags.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {testCase.tags.map(tag => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Precondition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap">
                {testCase.precondition || 'No precondition specified'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap">{testCase.steps}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expected Result</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap">{testCase.expectedResult}</div>
            </CardContent>
          </Card>

          {testCase.screenshots && testCase.screenshots.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Image className="mr-2 h-5 w-5" />
                  Screenshots
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {testCase.screenshots.map((screenshot, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <img
                        src={screenshot}
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(screenshot, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created by</p>
                  <p className="text-sm text-muted-foreground">{testCase.createdBy}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created on</p>
                  <p className="text-sm text-muted-foreground">
                    {testCase.createdAt.toLocaleDateString()} at {testCase.createdAt.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last updated</p>
                  <p className="text-sm text-muted-foreground">
                    {testCase.updatedAt.toLocaleDateString()} at {testCase.updatedAt.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TestCaseDetails;


import React, { useState, useEffect } from 'react';
import { useTestCases, TestCase } from '@/contexts/TestCaseContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, X, Upload, ImageIcon } from 'lucide-react';

interface TestCaseFormProps {
  testCase?: TestCase | null;
  onClose: () => void;
}

const TestCaseForm: React.FC<TestCaseFormProps> = ({ testCase, onClose }) => {
  const { addTestCase, updateTestCase, modules } = useTestCases();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    testCaseId: '',
    title: '',
    module: '',
    precondition: '',
    steps: '',
    expectedResult: '',
    priority: 'Medium' as const,
    status: 'Draft' as const,
    tags: [] as string[],
    screenshots: [] as string[]
  });
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (testCase) {
      setFormData({
        testCaseId: testCase.testCaseId,
        title: testCase.title,
        module: testCase.module,
        precondition: testCase.precondition,
        steps: testCase.steps,
        expectedResult: testCase.expectedResult,
        priority: testCase.priority,
        status: testCase.status,
        tags: testCase.tags || [],
        screenshots: testCase.screenshots || []
      });
    }
  }, [testCase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const testCaseData = {
        ...formData,
        createdBy: user?.username || 'Unknown'
      };

      if (testCase) {
        updateTestCase(testCase.id, testCaseData);
      } else {
        addTestCase(testCaseData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving test case:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Simulate screenshot upload - in real app, upload to cloud storage
      const newScreenshots = Array.from(files).map(file => URL.createObjectURL(file));
      setFormData(prev => ({
        ...prev,
        screenshots: [...prev.screenshots, ...newScreenshots]
      }));
    }
  };

  const removeScreenshot = (screenshotToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter(s => s !== screenshotToRemove)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onClose}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Test Cases
        </Button>
        <h1 className="text-2xl font-bold">
          {testCase ? 'Edit Test Case' : 'New Test Case'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Case Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="testCaseId">Test Case ID *</Label>
                <Input
                  id="testCaseId"
                  value={formData.testCaseId}
                  onChange={(e) => handleInputChange('testCaseId', e.target.value)}
                  placeholder="TC001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="module">Module *</Label>
                <Select
                  value={formData.module}
                  onValueChange={(value) => handleInputChange('module', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map(module => (
                      <SelectItem key={module.id} value={module.name}>
                        {module.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter test case title"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleInputChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Final">Final</SelectItem>
                    <SelectItem value="Passed">Passed</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="precondition">Precondition</Label>
              <Textarea
                id="precondition"
                rows={3}
                value={formData.precondition}
                onChange={(e) => handleInputChange('precondition', e.target.value)}
                placeholder="Enter preconditions for this test case"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="steps">Test Steps *</Label>
              <Textarea
                id="steps"
                rows={5}
                value={formData.steps}
                onChange={(e) => handleInputChange('steps', e.target.value)}
                placeholder="1. Step one&#10;2. Step two&#10;3. Step three"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedResult">Expected Result *</Label>
              <Textarea
                id="expectedResult"
                rows={3}
                value={formData.expectedResult}
                onChange={(e) => handleInputChange('expectedResult', e.target.value)}
                placeholder="Describe the expected result"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex space-x-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Screenshots</Label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="screenshot-upload"
                />
                <label htmlFor="screenshot-upload" className="cursor-pointer">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click to upload screenshots or drag and drop
                    </p>
                  </div>
                </label>
              </div>
              {formData.screenshots.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {formData.screenshots.map((screenshot, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={screenshot}
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeScreenshot(screenshot)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? 'Saving...' : 'Save Test Case'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestCaseForm;

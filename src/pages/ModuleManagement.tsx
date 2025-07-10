
import React, { useState } from 'react';
import { useTestCases } from '@/contexts/TestCaseContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, FolderOpen, TestTube, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ModuleManagement: React.FC = () => {
  const { modules, testCases, addModule, updateModule, deleteModule } = useTestCases();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Module name is required",
        variant: "destructive"
      });
      return;
    }

    if (editingModule) {
      updateModule(editingModule.id, formData);
      toast({
        title: "Success",
        description: "Module updated successfully"
      });
    } else {
      addModule(formData);
      toast({
        title: "Success",
        description: "Module created successfully"
      });
    }

    setFormData({ name: '', description: '' });
    setEditingModule(null);
    setShowForm(false);
  };

  const handleEdit = (module) => {
    setEditingModule(module);
    setFormData({
      name: module.name,
      description: module.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = (module) => {
    const testCaseCount = testCases.filter(tc => tc.module === module.name).length;
    
    if (testCaseCount > 0) {
      if (!confirm(`This module contains ${testCaseCount} test case(s). Deleting it will also remove all associated test cases. Are you sure?`)) {
        return;
      }
    }

    deleteModule(module.id);
    toast({
      title: "Success",
      description: "Module deleted successfully"
    });
  };

  const getModuleStats = (moduleName: string) => {
    const moduleTestCases = testCases.filter(tc => tc.module === moduleName);
    return {
      total: moduleTestCases.length,
      draft: moduleTestCases.filter(tc => tc.status === 'Draft').length,
      final: moduleTestCases.filter(tc => tc.status === 'Final').length,
      passed: moduleTestCases.filter(tc => tc.status === 'Passed').length,
      failed: moduleTestCases.filter(tc => tc.status === 'Failed').length
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Module Management</h1>
        {user?.role === 'admin' && (
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingModule(null);
                setFormData({ name: '', description: '' });
              }}>
                <Plus className="mr-2 h-4 w-4" />
                New Module
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingModule ? 'Edit Module' : 'Create New Module'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Module Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter module name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter module description"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingModule ? 'Update' : 'Create'} Module
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map(module => {
          const stats = getModuleStats(module.name);
          return (
            <Card key={module.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <FolderOpen className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">{module.name}</CardTitle>
                  </div>
                  {user?.role === 'admin' && (
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(module)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(module)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                {module.description && (
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TestTube className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Test Cases</span>
                    </div>
                    <Badge variant="secondary">{stats.total}</Badge>
                  </div>
                  
                  {stats.total > 0 && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span>Draft:</span>
                        <Badge variant="outline" className="bg-gray-100 text-gray-800">{stats.draft}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Final:</span>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">{stats.final}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Passed:</span>
                        <Badge variant="outline" className="bg-green-100 text-green-800">{stats.passed}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Failed:</span>
                        <Badge variant="outline" className="bg-red-100 text-red-800">{stats.failed}</Badge>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Created {module.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {modules.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No modules found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Get started by creating your first module
          </p>
          {user?.role === 'admin' && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Module
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ModuleManagement;

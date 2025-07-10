
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTestCases } from '@/contexts/TestCaseContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, UserPlus, Edit, Trash2, Shield, ShieldCheck, Calendar, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TeamUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'member';
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

const TeamManagement: React.FC = () => {
  const { user, register } = useAuth();
  const { testCases } = useTestCases();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<TeamUser | null>(null);
  const [teamUsers, setTeamUsers] = useState<TeamUser[]>([]);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'member' as 'admin' | 'member'
  });

  // Initialize with demo users and load from localStorage
  useEffect(() => {
    const savedUsers = localStorage.getItem('teamUsers');
    if (savedUsers) {
      try {
        const parsed = JSON.parse(savedUsers);
        setTeamUsers(parsed.map((u: any) => ({
          ...u,
          createdAt: new Date(u.createdAt),
          lastLogin: u.lastLogin ? new Date(u.lastLogin) : undefined
        })));
      } catch (error) {
        console.error('Error loading team users:', error);
      }
    } else {
      // Initialize with demo users
      const demoUsers: TeamUser[] = [
        {
          id: '1',
          username: 'admin',
          email: 'admin@qa.com',
          role: 'admin',
          isActive: true,
          createdAt: new Date('2024-01-01'),
          lastLogin: new Date()
        },
        {
          id: '2',
          username: 'tester',
          email: 'tester@qa.com',
          role: 'member',
          isActive: true,
          createdAt: new Date('2024-01-15'),
          lastLogin: new Date()
        }
      ];
      setTeamUsers(demoUsers);
      localStorage.setItem('teamUsers', JSON.stringify(demoUsers));
    }
  }, []);

  // Save to localStorage whenever teamUsers changes
  useEffect(() => {
    if (teamUsers.length > 0) {
      localStorage.setItem('teamUsers', JSON.stringify(teamUsers));
    }
  }, [teamUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.email.trim() || (!editingUser && !formData.password.trim())) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive"
      });
      return;
    }

    // Check if email already exists
    const emailExists = teamUsers.some(u => 
      u.email === formData.email && u.id !== editingUser?.id
    );
    
    if (emailExists) {
      toast({
        title: "Error",
        description: "Email already exists",
        variant: "destructive"
      });
      return;
    }

    if (editingUser) {
      // Update existing user
      setTeamUsers(prev => prev.map(u => 
        u.id === editingUser.id 
          ? { ...u, username: formData.username, email: formData.email, role: formData.role }
          : u
      ));
      toast({
        title: "Success",
        description: "User updated successfully"
      });
    } else {
      // Create new user
      const success = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      if (success) {
        const newUser: TeamUser = {
          id: Date.now().toString(),
          username: formData.username,
          email: formData.email,
          role: formData.role,
          isActive: true,
          createdAt: new Date()
        };
        
        setTeamUsers(prev => [...prev, newUser]);
        toast({
          title: "Success",
          description: "User created successfully"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create user",
          variant: "destructive"
        });
        return;
      }
    }

    setFormData({ username: '', email: '', password: '', role: 'member' });
    setEditingUser(null);
    setShowForm(false);
  };

  const handleEdit = (teamUser: TeamUser) => {
    setEditingUser(teamUser);
    setFormData({
      username: teamUser.username,
      email: teamUser.email,
      password: '',
      role: teamUser.role
    });
    setShowForm(true);
  };

  const handleToggleActive = (userId: string) => {
    setTeamUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, isActive: !u.isActive } : u
    ));
    toast({
      title: "Success",
      description: "User status updated"
    });
  };

  const handleDelete = (userId: string) => {
    const userToDelete = teamUsers.find(u => u.id === userId);
    if (!userToDelete) return;

    const userTestCases = testCases.filter(tc => tc.createdBy === userToDelete.username);
    
    if (userTestCases.length > 0) {
      if (!confirm(`This user has ${userTestCases.length} test case(s). Deleting the user will keep the test cases but they won't be editable by the user anymore. Are you sure?`)) {
        return;
      }
    }

    setTeamUsers(prev => prev.filter(u => u.id !== userId));
    toast({
      title: "Success",
      description: "User deleted successfully"
    });
  };

  const getUserStats = (username: string) => {
    const userTestCases = testCases.filter(tc => tc.createdBy === username);
    return {
      total: userTestCases.length,
      draft: userTestCases.filter(tc => tc.status === 'Draft').length,
      final: userTestCases.filter(tc => tc.status === 'Final').length,
      passed: userTestCases.filter(tc => tc.status === 'Passed').length,
      failed: userTestCases.filter(tc => tc.status === 'Failed').length
    };
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Access Restricted
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Only administrators can access team management
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Team Management</h1>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingUser(null);
              setFormData({ username: '', email: '', password: '', role: 'member' });
            }}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Edit User' : 'Add New User'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter username"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                  required
                />
              </div>
              {!editingUser && (
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                    required={!editingUser}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.role} onValueChange={(value: 'admin' | 'member') => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingUser ? 'Update' : 'Create'} User
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamUsers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamUsers.filter(u => u.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamUsers.filter(u => u.role === 'admin').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamUsers.filter(u => u.role === 'member').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* User Cards View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamUsers.map(teamUser => {
          const stats = getUserStats(teamUser.username);
          return (
            <Card key={teamUser.id} className={`hover:shadow-lg transition-shadow ${!teamUser.isActive ? 'opacity-60' : ''}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <span>{teamUser.username}</span>
                      {teamUser.role === 'admin' && <Shield className="h-4 w-4 text-blue-600" />}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{teamUser.email}</p>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(teamUser)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(teamUser.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Role:</span>
                    <Badge variant={teamUser.role === 'admin' ? 'default' : 'secondary'}>
                      {teamUser.role}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Status:</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant={teamUser.isActive ? 'default' : 'destructive'}>
                        {teamUser.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(teamUser.id)}
                      >
                        {teamUser.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TestTube className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Test Cases</span>
                    </div>
                    <Badge variant="outline">{stats.total}</Badge>
                  </div>

                  {stats.total > 0 && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
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
                    <span>Joined {teamUser.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {teamUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No team members found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Get started by adding your first team member
          </p>
          <Button onClick={() => setShowForm(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;

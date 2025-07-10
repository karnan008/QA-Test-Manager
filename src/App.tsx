
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { TestCaseProvider } from "@/contexts/TestCaseContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Dashboard from "@/pages/Dashboard";
import TestCaseList from "@/components/testcases/TestCaseList";
import ExcelImport from "@/components/import/ExcelImport";
import ModuleManagement from "@/pages/ModuleManagement";
import Reports from "@/pages/Reports";
import TeamManagement from "@/pages/TeamManagement";
import { useState } from "react";

const queryClient = new QueryClient();

const AuthWrapper = () => {
  const { user, isLoading } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return isRegisterMode ? (
      <RegisterForm onToggleMode={() => setIsRegisterMode(false)} />
    ) : (
      <LoginForm onToggleMode={() => setIsRegisterMode(true)} />
    );
  }

  return (
    <TestCaseProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/test-cases" element={<TestCaseList />} />
              <Route path="/import" element={<ExcelImport />} />
              <Route path="/modules" element={<ModuleManagement />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/team" element={<TeamManagement />} />
            </Routes>
          </main>
        </div>
      </div>
    </TestCaseProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AuthWrapper />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

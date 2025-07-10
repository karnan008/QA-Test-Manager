
import React, { useState } from 'react';
import { useTestCases } from '@/contexts/TestCaseContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from 'lucide-react';
import * as XLSX from 'xlsx';

const ExcelImport: React.FC = () => {
  const { importTestCases } = useTestCases();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    added: number;
    skipped: number;
    duplicates: number;
  } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const requiredColumns = ['Test Case ID', 'Title', 'Module', 'Precondition', 'Steps', 'Expected Result'];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrors([]);
    setUploadResult(null);
    setProgress(0);

    try {
      const fileData = await file.arrayBuffer();
      const workbook = XLSX.read(fileData, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length === 0) {
        setErrors(['The Excel file is empty']);
        setIsUploading(false);
        return;
      }

      const headers = jsonData[0] as string[];
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));

      if (missingColumns.length > 0) {
        setErrors([`Missing required columns: ${missingColumns.join(', ')}`]);
        setIsUploading(false);
        return;
      }

      setProgress(25);

      const rows = jsonData.slice(1) as any[][];
      const testCases = rows.map(row => {
        const testCase: any = {};
        headers.forEach((header, index) => {
          testCase[header] = row[index];
        });
        
        return {
          testCaseId: testCase['Test Case ID']?.toString(),
          title: testCase['Title']?.toString(),
          module: testCase['Module']?.toString(),
          precondition: testCase['Precondition']?.toString() || '',
          steps: testCase['Steps']?.toString() || '',
          expectedResult: testCase['Expected Result']?.toString() || '',
          priority: testCase['Priority'] || 'Medium',
          status: testCase['Status'] || 'Draft',
          tags: testCase['Tags'] ? testCase['Tags'].split(',').map((t: string) => t.trim()) : [],
          createdBy: 'Excel Import'
        };
      });

      setProgress(50);

      // Validate data
      const validationErrors: string[] = [];
      testCases.forEach((tc, index) => {
        if (!tc.testCaseId) {
          validationErrors.push(`Row ${index + 2}: Missing Test Case ID`);
        }
        if (!tc.title) {
          validationErrors.push(`Row ${index + 2}: Missing Title`);
        }
        if (!tc.module) {
          validationErrors.push(`Row ${index + 2}: Missing Module`);
        }
      });

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setIsUploading(false);
        return;
      }

      setProgress(75);

      // Import test cases
      const result = importTestCases(testCases);
      setUploadResult(result);
      setProgress(100);

    } catch (error) {
      console.error('Error processing Excel file:', error);
      setErrors(['Error processing Excel file. Please check the format and try again.']);
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Import Test Cases</h1>
        <p className="text-muted-foreground mt-2">
          Upload an Excel file to import multiple test cases at once
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileSpreadsheet className="mr-2 h-5 w-5" />
            Excel File Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Required Columns (case-sensitive):</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {requiredColumns.map(column => (
                  <div key={column} className="bg-muted px-3 py-1 rounded text-sm font-mono">
                    {column}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Optional Columns:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['Priority', 'Status', 'Tags'].map(column => (
                  <div key={column} className="bg-muted px-3 py-1 rounded text-sm font-mono">
                    {column}
                  </div>
                ))}
              </div>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Test Case IDs must be unique. Duplicate IDs will be skipped during import.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload Excel File</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="excel-upload"
              />
              <label htmlFor="excel-upload" className="cursor-pointer">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium mb-2">
                    {isUploading ? 'Processing...' : 'Upload Excel File'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click to select or drag and drop your .xlsx file here
                  </p>
                </div>
              </label>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing file...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Import failed:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {errors.map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {uploadResult && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Import completed successfully!</p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                        <div className="font-bold text-green-600 dark:text-green-400">
                          {uploadResult.added}
                        </div>
                        <div className="text-green-600 dark:text-green-400">Added</div>
                      </div>
                      <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                        <div className="font-bold text-yellow-600 dark:text-yellow-400">
                          {uploadResult.duplicates}
                        </div>
                        <div className="text-yellow-600 dark:text-yellow-400">Duplicates</div>
                      </div>
                      <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                        <div className="font-bold text-red-600 dark:text-red-400">
                          {uploadResult.skipped}
                        </div>
                        <div className="text-red-600 dark:text-red-400">Skipped</div>
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sample Excel Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Download a sample template to get started quickly:
            </p>
            <Button
              variant="outline"
              onClick={() => {
                // Create sample Excel data
                const sampleData = [
                  requiredColumns.concat(['Priority', 'Status', 'Tags']),
                  [
                    'TC001',
                    'Login with valid credentials',
                    'Authentication',
                    'User account exists',
                    '1. Navigate to login page\n2. Enter valid email\n3. Enter valid password\n4. Click login button',
                    'User should be logged in successfully',
                    'High',
                    'Draft',
                    'login, authentication'
                  ],
                  [
                    'TC002',
                    'Login with invalid credentials',
                    'Authentication',
                    'User account exists',
                    '1. Navigate to login page\n2. Enter invalid email\n3. Enter invalid password\n4. Click login button',
                    'Error message should be displayed',
                    'Medium',
                    'Draft',
                    'login, negative'
                  ]
                ];
                
                const worksheet = XLSX.utils.aoa_to_sheet(sampleData);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Test Cases');
                XLSX.writeFile(workbook, 'test_cases_template.xlsx');
              }}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExcelImport;

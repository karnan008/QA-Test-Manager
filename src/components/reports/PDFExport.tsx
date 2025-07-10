
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFExportProps {
  summaryStats: {
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    byModule: Record<string, number>;
  };
  chartData: {
    status: Array<{ name: string; value: number; color: string }>;
    priority: Array<{ name: string; value: number; color: string }>;
    module: Array<{ name: string; value: number }>;
  };
  selectedModule: string;
  selectedUser: string;
}

const PDFExport: React.FC<PDFExportProps> = ({ summaryStats, chartData, selectedModule, selectedUser }) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const exportToPDF = async () => {
    if (!reportRef.current) return;

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const fileName = `test-cases-summary-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Export Summary Report</h2>
        <Button onClick={exportToPDF}>
          <Download className="mr-2 h-4 w-4" />
          Export as PDF
        </Button>
      </div>

      <div ref={reportRef} className="bg-white p-8 space-y-8" style={{ minHeight: '800px' }}>
        {/* Header */}
        <div className="text-center border-b pb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Test Case Summary Report</h1>
          <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
          {selectedModule !== 'all' && (
            <p className="text-gray-600">Module: {selectedModule}</p>
          )}
          {selectedUser !== 'all' && (
            <p className="text-gray-600">User: {selectedUser}</p>
          )}
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-blue-800">Total Test Cases</h3>
            <p className="text-3xl font-bold text-blue-900">{summaryStats.total}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-green-800">Passed</h3>
            <p className="text-3xl font-bold text-green-900">{summaryStats.byStatus.Passed || 0}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-red-800">Failed</h3>
            <p className="text-3xl font-bold text-red-900">{summaryStats.byStatus.Failed || 0}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-gray-800">Draft</h3>
            <p className="text-3xl font-bold text-gray-900">{summaryStats.byStatus.Draft || 0}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status Distribution Pie Chart */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Status Distribution</h3>
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
          </div>

          {/* Priority Distribution Bar Chart */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Priority Distribution</h3>
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
          </div>
        </div>

        {/* Module Breakdown */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Test Cases by Module</h3>
          <div className="space-y-3">
            {Object.entries(summaryStats.byModule).map(([module, count]) => (
              <div key={module} className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">{module}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">Total: {count}</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(count / summaryStats.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm border-t pt-4">
          <p>Report generated by Test Case Management System</p>
          <p>For internal use only</p>
        </div>
      </div>
    </div>
  );
};

export default PDFExport;

import React, { useState } from 'react';
import { 
  Activity, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  User,
  Filter,
  Search,
  Clock,
  Download,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { usePasswordStore, ActivityLog } from '@/store/passwordStore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useToast } from '@/hooks/use-toast';

const ActivityLogPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  
  const { activityLogs, loadActivityLogs, isLoading, error } = usePasswordStore();
  const { toast } = useToast();

  // Load activity logs when component mounts
  React.useEffect(() => {
    loadActivityLogs();
  }, [loadActivityLogs]);

  // Get unique admins for filter
  const uniqueAdmins = [...new Set(activityLogs.map(log => log.adminName))];
  const actions = ['add', 'edit', 'delete', 'view'];

  // Filter logs
  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.entryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.adminName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAdmin = !selectedAdmin || log.adminName === selectedAdmin;
    const matchesAction = !selectedAction || log.action === selectedAction;
    
    return matchesSearch && matchesAdmin && matchesAction;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'add': return <Plus className="w-4 h-4 text-green-400" />;
      case 'edit': return <Edit className="w-4 h-4 text-blue-400" />;
      case 'delete': return <Trash2 className="w-4 h-4 text-red-400" />;
      case 'view': return <Eye className="w-4 h-4 text-gray-400" />;
      default: return <Activity className="w-4 h-4 text-primary" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'add': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'edit': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'delete': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'view': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default: return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedAdmin('');
    setSelectedAction('');
  };

  // Export to CSV
  const exportToCSV = () => {
    try {
      const headers = ['Date', 'Time', 'Admin', 'Action', 'Entry Name', 'Details'];
      const csvData = filteredLogs.map(log => {
        const date = new Date(log.timestamp);
        return [
          date.toLocaleDateString(),
          date.toLocaleTimeString(),
          log.adminName,
          log.action,
          log.entryName,
          log.details
        ];
      });

      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `activity-logs-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast({
        title: "Export successful",
        description: "Activity logs exported to CSV file",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export CSV file",
        variant: "destructive",
      });
    }
  };

  // Export to PDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('Activity Log Report', 14, 22);
      
      // Add generated date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 32);
      
      // Add summary
      doc.text(`Total Activities: ${filteredLogs.length}`, 14, 40);
      
      // Prepare table data
      const tableData = filteredLogs.map(log => {
        const date = new Date(log.timestamp);
        return [
          date.toLocaleDateString(),
          date.toLocaleTimeString(),
          log.adminName,
          log.action.toUpperCase(),
          log.entryName,
          log.details.length > 50 ? log.details.substring(0, 50) + '...' : log.details
        ];
      });

      // Add table
      (doc as any).autoTable({
        head: [['Date', 'Time', 'Admin', 'Action', 'Entry', 'Details']],
        body: tableData,
        startY: 50,
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        headStyles: {
          fillColor: [71, 85, 105],
          textColor: 255
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 25 }, // Date
          1: { cellWidth: 25 }, // Time
          2: { cellWidth: 25 }, // Admin
          3: { cellWidth: 20 }, // Action
          4: { cellWidth: 30 }, // Entry
          5: { cellWidth: 'auto' } // Details
        }
      });
      
      // Save the PDF
      doc.save(`activity-logs-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Export successful",
        description: "Activity logs exported to PDF file",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export PDF file",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Activity Log</h1>
        <p className="text-muted-foreground">
          Track all password management activities across your team
        </p>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Filters</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input pl-10"
            />
          </div>

          {/* Admin Filter */}
          <select
            value={selectedAdmin}
            onChange={(e) => setSelectedAdmin(e.target.value)}
            className="glass-input bg-transparent"
          >
            <option value="">All admins</option>
            {uniqueAdmins.map(admin => (
              <option key={admin} value={admin} className="bg-background">
                {admin}
              </option>
            ))}
          </select>

          {/* Action Filter */}
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="glass-input bg-transparent"
          >
            <option value="">All actions</option>
            {actions.map(action => (
              <option key={action} value={action} className="bg-background capitalize">
                {action}
              </option>
            ))}
          </select>
        </div>

        {/* Active Filters */}
        {(searchTerm || selectedAdmin || selectedAction) && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  Search: {searchTerm}
                </Badge>
              )}
              {selectedAdmin && (
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  Admin: {selectedAdmin}
                </Badge>
              )}
              {selectedAction && (
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  Action: {selectedAction}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map(action => {
          const count = activityLogs.filter(log => log.action === action).length;
          return (
            <div key={action} className="glass-card p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                {getActionIcon(action)}
              </div>
              <div className="text-2xl font-bold text-foreground">{count}</div>
              <div className="text-sm text-muted-foreground capitalize">{action}s</div>
            </div>
          );
        })}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredLogs.length} of {activityLogs.length} activities
        </p>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 glass-card mx-auto mb-4 flex items-center justify-center">
              <Activity className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No activities found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedAdmin || selectedAction 
                ? "Try adjusting your filters"
                : "Activity logs will appear here as actions are performed"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log, index) => (
              <div key={log.id} className="glass-card p-4 glow-hover transition-all duration-300">
                <div className="flex items-start space-x-4">
                  {/* Action Icon */}
                  <div className="flex-shrink-0 w-10 h-10 glass-card flex items-center justify-center">
                    {getActionIcon(log.action)}
                  </div>

                  {/* Activity Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-foreground">{log.adminName}</span>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getActionColor(log.action)}`}
                      >
                        {log.action}
                      </Badge>
                      <span className="text-sm font-medium text-foreground">{log.entryName}</span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {log.details}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(log.timestamp)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline connector */}
                  {index < filteredLogs.length - 1 && (
                    <div className="absolute left-9 mt-10 w-px h-6 bg-border"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export Options */}
      {filteredLogs.length > 0 && (
        <div className="glass-card p-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Export activity logs for compliance and reporting
          </span>
          <div className="flex space-x-2">
            <Button 
              variant="glassSecondary" 
              size="sm" 
              onClick={exportToCSV}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </Button>
            <Button 
              variant="glassSecondary" 
              size="sm" 
              onClick={exportToPDF}
              className="flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Export PDF</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogPage;

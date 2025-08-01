import React, { useState } from 'react';
import { 
  Settings, 
  Shield, 
  Users, 
  Database, 
  Download, 
  Upload, 
  Trash2,
  Bell,
  Lock,
  Eye,
  Save,
  AlertTriangle,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/store/authStore';
import { usePasswordStore } from '@/store/passwordStore';
import { useToast } from '@/hooks/use-toast';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    autoSave: true,
    emailNotifications: true,
    passwordExpiry: false,
    twoFactorAuth: false,
    sessionTimeout: 30,
    exportFormat: 'csv',
    backupFrequency: 'daily',
  });

  const [savedSettings, setSavedSettings] = useState(false);
  const { user } = useAuth();
  const { entries, activityLogs } = usePasswordStore();
  const { toast } = useToast();

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    localStorage.setItem('trivault-settings', JSON.stringify(settings));
    setSavedSettings(true);
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully",
    });
    setTimeout(() => setSavedSettings(false), 2000);
  };

  const exportData = (format: string) => {
    const data = {
      entries,
      activityLogs,
      exportedAt: new Date().toISOString(),
      exportedBy: user?.name,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trivault-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Data exported",
      description: "Your vault data has been downloaded successfully",
    });
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to delete ALL password data? This action cannot be undone.')) {
      if (confirm('This will permanently delete all passwords and activity logs. Type "DELETE" to confirm:')) {
        localStorage.removeItem('trivault-passwords');
        localStorage.removeItem('trivault-activity');
        localStorage.removeItem('trivault-settings');
        toast({
          title: "Data cleared",
          description: "All vault data has been permanently deleted",
          variant: "destructive",
        });
        window.location.reload();
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Vault Settings</h1>
        <p className="text-muted-foreground">
          Manage your TriVault preferences and security settings
        </p>
      </div>

      {/* Security Settings */}
      <div className="glass-card p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Security & Privacy</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
            </div>
            <Switch
              checked={settings.twoFactorAuth}
              onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Password Expiry Notifications</h3>
              <p className="text-sm text-muted-foreground">Get notified when passwords need updating</p>
            </div>
            <Switch
              checked={settings.passwordExpiry}
              onCheckedChange={(checked) => handleSettingChange('passwordExpiry', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Session Timeout</h3>
              <p className="text-sm text-muted-foreground">Automatically log out after inactivity</p>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                className="glass-input w-20"
                min="5"
                max="120"
              />
              <span className="text-sm text-muted-foreground">minutes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Application Settings */}
      <div className="glass-card p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Application Settings</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Auto-Save Drafts</h3>
              <p className="text-sm text-muted-foreground">Automatically save form data as you type</p>
            </div>
            <Switch
              checked={settings.autoSave}
              onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Email Notifications</h3>
              <p className="text-sm text-muted-foreground">Receive notifications about vault activities</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Backup Frequency</h3>
              <p className="text-sm text-muted-foreground">How often to create automatic backups</p>
            </div>
            <select
              value={settings.backupFrequency}
              onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
              className="glass-input bg-transparent"
            >
              <option value="daily" className="bg-background">Daily</option>
              <option value="weekly" className="bg-background">Weekly</option>
              <option value="monthly" className="bg-background">Monthly</option>
              <option value="never" className="bg-background">Never</option>
            </select>
          </div>
        </div>
      </div>

      {/* Team Management */}
      <div className="glass-card p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Team Management</h2>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 glass-card">
              <div className="text-2xl font-bold text-primary">3</div>
              <div className="text-sm text-muted-foreground">Active Admins</div>
            </div>
            <div className="text-center p-4 glass-card">
              <div className="text-2xl font-bold text-primary">{entries.length}</div>
              <div className="text-sm text-muted-foreground">Total Passwords</div>
            </div>
            <div className="text-center p-4 glass-card">
              <div className="text-2xl font-bold text-primary">{activityLogs.length}</div>
              <div className="text-sm text-muted-foreground">Activity Logs</div>
            </div>
          </div>

          <div className="p-4 glass-card bg-primary/10">
            <div className="flex items-start space-x-2">
              <Bell className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-primary">Team Access</h4>
                <p className="text-sm text-muted-foreground">
                  Current team members: Sarah Johnson, Mike Chen, Alex Rivera. 
                  Contact your system administrator to modify team access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="glass-card p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Database className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Data Management</h2>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="glassSecondary"
              onClick={() => exportData('json')}
              className="h-auto p-4 flex flex-col items-center space-y-2"
            >
              <Download className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Export Vault Data</div>
                <div className="text-xs text-muted-foreground">Download all passwords and logs</div>
              </div>
            </Button>

            <Button
              variant="glassSecondary"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              disabled
            >
              <Upload className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Import Data</div>
                <div className="text-xs text-muted-foreground">Upload vault backup file</div>
              </div>
            </Button>
          </div>

          <div className="p-4 glass-card bg-destructive/10 border border-destructive/20">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-destructive">Danger Zone</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Permanently delete all vault data. This action cannot be undone.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={clearAllData}
                  className="bg-destructive/20 hover:bg-destructive/30"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Data
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Settings */}
      <div className="glass-card p-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Settings are automatically saved to your browser's local storage
        </span>
        <Button
          variant="glass"
          onClick={saveSettings}
          className={savedSettings ? 'bg-green-500/20 border-green-500/30' : ''}
        >
          {savedSettings ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;

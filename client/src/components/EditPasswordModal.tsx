import React, { useState, useEffect } from 'react';
import { 
  Save, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  X, 
  Plus,
  Zap,
  Building2,
  Globe,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PasswordEntry } from '@/store/passwordStore';
import { useToast } from '@/hooks/use-toast';

interface EditPasswordModalProps {
  entry: PasswordEntry;
  onClose: () => void;
  onSave: (updatedEntry: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void;
}

const EditPasswordModal: React.FC<EditPasswordModalProps> = ({ entry, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    websiteName: entry.websiteName,
    clientName: entry.clientName,
    email: entry.email,
    password: entry.password,
    notes: entry.notes,
    tags: [...entry.tags],
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { toast } = useToast();

  const commonTags = ['Marketing', 'Social Media', 'Email Marketing', 'Advertising', 'Finance', 'Development', 'Analytics', 'Design', 'Client'];

  // Password strength calculation
  useEffect(() => {
    const calculateStrength = (password: string) => {
      let strength = 0;
      if (password.length >= 8) strength += 20;
      if (password.length >= 12) strength += 10;
      if (/[a-z]/.test(password)) strength += 15;
      if (/[A-Z]/.test(password)) strength += 15;
      if (/[0-9]/.test(password)) strength += 15;
      if (/[^A-Za-z0-9]/.test(password)) strength += 25;
      return Math.min(strength, 100);
    };
    
    setPasswordStrength(calculateStrength(formData.password));
  }, [formData.password]);

  const generatePassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    let password = '';
    
    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < 16; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    password = password.split('').sort(() => 0.5 - Math.random()).join('');
    
    setFormData(prev => ({ ...prev, password }));
    toast({
      title: "Password generated",
      description: "Strong password has been generated",
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addCommonTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.websiteName || !formData.clientName || !formData.email || !formData.password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    onSave(formData);
  };

  const getStrengthColor = () => {
    if (passwordStrength < 30) return 'bg-red-500';
    if (passwordStrength < 60) return 'bg-yellow-500';
    if (passwordStrength < 80) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength < 30) return 'Weak';
    if (passwordStrength < 60) return 'Fair';
    if (passwordStrength < 80) return 'Good';
    return 'Strong';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Edit Password</h2>
            <p className="text-sm text-muted-foreground">
              Update password entry for {entry.websiteName}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Website/App Name */}
          <div className="space-y-2">
            <label htmlFor="edit-websiteName" className="text-sm font-medium text-foreground flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span>Website/App Name *</span>
            </label>
            <Input
              id="edit-websiteName"
              type="text"
              value={formData.websiteName}
              onChange={(e) => setFormData(prev => ({ ...prev, websiteName: e.target.value }))}
              className="glass-input"
              placeholder="e.g., Google Ads, Facebook Business Manager"
              required
            />
          </div>

          {/* Client Name */}
          <div className="space-y-2">
            <label htmlFor="edit-clientName" className="text-sm font-medium text-foreground flex items-center space-x-2">
              <Building2 className="w-4 h-4" />
              <span>Client Name *</span>
            </label>
            <Input
              id="edit-clientName"
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
              className="glass-input"
              placeholder="e.g., TechCorp Solutions, Local Restaurant Group"
              required
            />
          </div>

          {/* Email/Username */}
          <div className="space-y-2">
            <label htmlFor="edit-email" className="text-sm font-medium text-foreground flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>Email/Username *</span>
            </label>
            <Input
              id="edit-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="glass-input"
              placeholder="user@company.com"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="edit-password" className="text-sm font-medium text-foreground flex items-center justify-between">
              <span>Password *</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={generatePassword}
                className="h-6 px-2 text-xs"
              >
                <Zap className="w-3 h-3 mr-1" />
                Generate
              </Button>
            </label>
            <div className="relative">
              <Input
                id="edit-password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="glass-input pr-10"
                placeholder="Enter or generate a strong password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Password Strength</span>
                  <span className={`text-xs font-medium ${
                    passwordStrength < 60 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {getStrengthText()}
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${getStrengthColor()}`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tags</label>
            
            {/* Common Tags */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Quick add:</p>
              <div className="flex flex-wrap gap-2">
                {commonTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addCommonTag(tag)}
                    className={`px-2 py-1 rounded-md text-xs border transition-all duration-200 ${
                      formData.tags.includes(tag)
                        ? 'bg-primary/20 text-primary border-primary/30'
                        : 'bg-secondary/50 text-muted-foreground border-border hover:bg-secondary'
                    }`}
                    disabled={formData.tags.includes(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Tag Input */}
            <div className="flex space-x-2">
              <Input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="glass-input flex-1"
                placeholder="Add custom tag"
              />
              <Button type="button" variant="glassSecondary" onClick={addTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Selected Tags */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-primary/20 text-primary border-primary/30 pr-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label htmlFor="edit-notes" className="text-sm font-medium text-foreground">
              Notes
            </label>
            <Textarea
              id="edit-notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="glass-input min-h-[100px]"
              placeholder="Additional notes about this account (access level, usage instructions, etc.)"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              variant="glass"
              size="lg"
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Update Password
            </Button>
            
            <Button
              type="button"
              variant="glassSecondary"
              size="lg"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPasswordModal;

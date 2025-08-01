import React, { useState, useEffect } from 'react';
import { 
  Save, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  X, 
  Plus,
  Zap,
  Shield,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { usePasswordStore } from '@/store/passwordStore';
import { useAuth } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';

interface AddPasswordPageProps {
  onSuccess: () => void;
}

const AddPasswordPage: React.FC<AddPasswordPageProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    websiteName: '',
    clientName: '',
    email: '',
    password: '',
    notes: '',
    tags: [] as string[],
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isDraft, setIsDraft] = useState(false);
  
  const { addEntry } = usePasswordStore();
  const { user } = useAuth();
  const { toast } = useToast();

  const DRAFT_KEY = 'trivault-draft';
  const commonTags = ['Marketing', 'Social Media', 'Email Marketing', 'Advertising', 'Finance', 'Development', 'Analytics', 'Design', 'Client'];

  // Auto-save draft functionality
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      setFormData(draft);
      setIsDraft(true);
      toast({
        title: "Draft restored",
        description: "Your previous draft has been restored",
      });
    }
  }, []);

  useEffect(() => {
    if (formData.websiteName || formData.clientName || formData.email || formData.password || formData.notes) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    }
  }, [formData]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add passwords",
        variant: "destructive",
      });
      return;
    }

    if (!formData.websiteName || !formData.clientName || !formData.email || !formData.password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await addEntry({
        ...formData,
        createdBy: user.name,
      });
      localStorage.removeItem(DRAFT_KEY);
      setFormData({
        websiteName: '',
        clientName: '',
        email: '',
        password: '',
        notes: '',
        tags: [],
      });

      toast({
        title: "Password added",
        description: `Password for ${formData.websiteName} has been saved securely`,
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add password",
        variant: "destructive",
      });
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setFormData({
      websiteName: '',
      clientName: '',
      email: '',
      password: '',
      notes: '',
      tags: [],
    });
    setIsDraft(false);
    toast({
      title: "Draft cleared",
      description: "Form has been reset",
    });
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Add New Password</h1>
        <p className="text-muted-foreground">
          Securely store a new password entry for your digital marketing tools
        </p>
        {isDraft && (
          <div className="mt-4 p-3 glass-card bg-primary/10 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-primary" />
              <span className="text-sm">Draft restored from previous session</span>
            </div>
            <Button variant="ghost" size="sm" onClick={clearDraft}>
              Clear Draft
            </Button>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Website/App Name */}
        <div className="space-y-2">
          <label htmlFor="websiteName" className="text-sm font-medium text-foreground">
            Website/App Name *
          </label>
          <Input
            id="websiteName"
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
          <label htmlFor="clientName" className="text-sm font-medium text-foreground">
            Client Name *
          </label>
          <Input
            id="clientName"
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
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email/Username *
          </label>
          <Input
            id="email"
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
          <label htmlFor="password" className="text-sm font-medium text-foreground flex items-center justify-between">
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
              id="password"
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
          <label htmlFor="notes" className="text-sm font-medium text-foreground">
            Notes
          </label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="glass-input min-h-[100px]"
            placeholder="Additional notes about this account (access level, usage instructions, etc.)"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="submit"
            variant="glass"
            size="lg"
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Password
          </Button>
          
          <Button
            type="button"
            variant="glassSecondary"
            size="lg"
            onClick={clearDraft}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset Form
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddPasswordPage;

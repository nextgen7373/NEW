import React, { useState } from 'react';
import { 
  Search, 
  Eye, 
  EyeOff, 
  Copy, 
  Edit, 
  Trash2, 
  Filter,
  Tag,
  MoreVertical,
  Globe,
  Mail,
  FileText,
  Check,
  X,
  Building2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { usePasswordStore, PasswordEntry } from '@/store/passwordStore';
import { useAuth } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import EditPasswordModal from './EditPasswordModal';

const VaultPage = () => {
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<PasswordEntry | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PasswordEntry | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const { 
    entries, 
    searchTerm, 
    selectedTags,
    isLoading,
    error,
    loadEntries,
    setSearchTerm, 
    setSelectedTags, 
    deleteEntry,
    updateEntry,
    getAllTags,
    getFilteredEntries 
  } = usePasswordStore();
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Load entries when component mounts
  React.useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const filteredEntries = getFilteredEntries();
  const allTags = getAllTags();

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = async (text: string, type: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (entry: PasswordEntry) => {
    if (confirm(`Are you sure you want to delete the password for ${entry.websiteName}?`)) {
      try {
        await deleteEntry(entry.id);
        toast({
          title: "Password deleted",
          description: `Password for ${entry.websiteName} has been removed`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete password entry",
          variant: "destructive",
        });
      }
    }
  };

  const handleEdit = (entry: PasswordEntry) => {
    setEditingEntry(entry);
    setShowEditModal(true);
  };

  const toggleTagFilter = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
  };

  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  const getTagColor = (tag: string) => {
    const colors = {
      'Marketing': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'Social Media': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      'Email Marketing': 'bg-green-500/20 text-green-300 border-green-500/30',
      'Advertising': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'Finance': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'Development': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    };
    return colors[tag as keyof typeof colors] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search passwords, clients, emails, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input pl-10"
            />
          </div>
          
          <Button 
            variant="glassSecondary" 
            className="flex items-center space-x-2"
            onClick={toggleAdvancedFilters}
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
            {showAdvancedFilters ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="glass-card p-4 space-y-4 border border-border/50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Advanced Filters</h3>
              {(searchTerm || selectedTags.length > 0) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllFilters}
                  className="text-xs"
                >
                  Clear All
                </Button>
              )}
            </div>
            
            {/* Active Filters Summary */}
            {(searchTerm || selectedTags.length > 0) && (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground">Active filters:</span>
                {searchTerm && (
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded border border-primary/30">
                    Search: "{searchTerm}"
                  </span>
                )}
                {selectedTags.map(tag => (
                  <span 
                    key={tag} 
                    className={`px-2 py-1 text-xs rounded border ${getTagColor(tag)}`}
                  >
                    Tag: {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground flex items-center">
              <Tag className="w-4 h-4 mr-1" />
              Filter by tags:
            </span>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTagFilter(tag)}
                className={`px-2 py-1 rounded-md text-xs border transition-all duration-200 ${
                  selectedTags.includes(tag)
                    ? getTagColor(tag) + ' scale-105'
                    : 'bg-secondary/50 text-muted-foreground border-border hover:bg-secondary'
                }`}
              >
                {tag}
              </button>
            ))}
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="px-2 py-1 rounded-md text-xs bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30"
              >
                Clear tag filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredEntries.length} of {entries.length} passwords
          </p>
          {(searchTerm || selectedTags.length > 0) && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-xs text-primary font-medium">
                Filters active
              </span>
            </div>
          )}
        </div>
        {(searchTerm || selectedTags.length > 0) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllFilters}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all filters
          </Button>
        )}
      </div>

      {/* Password Entries Grid */}
      <div className="grid gap-4">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 glass-card mx-auto mb-4 flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No passwords found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedTags.length > 0 
                ? "Try adjusting your search or filters"
                : "Start by adding your first password entry"
              }
            </p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div key={entry.id} className="glass-card p-4 glow-hover transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Website Name */}
                  <div className="flex items-center space-x-2 mb-2">
                    <Globe className="w-4 h-4 text-primary flex-shrink-0" />
                    <h3 className="font-semibold text-foreground truncate">{entry.websiteName}</h3>
                  </div>

                  {/* Client Name */}
                  <div className="flex items-center space-x-2 mb-2">
                    <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-muted-foreground truncate font-medium">{entry.clientName}</span>
                  </div>

                  {/* Email */}
                  <div className="flex items-center space-x-2 mb-2">
                    <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-muted-foreground truncate">{entry.email}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(entry.email, 'Email', entry.id)}
                      className="h-6 w-6 p-0 hover:bg-secondary/50"
                    >
                      {copiedId === entry.id ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>

                  {/* Password */}
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <Input
                        type={showPasswords[entry.id] ? 'text' : 'password'}
                        value={entry.password}
                        readOnly
                        className="glass-input text-xs"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePasswordVisibility(entry.id)}
                      className="h-8 w-8 p-0 hover:bg-secondary/50"
                    >
                      {showPasswords[entry.id] ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(entry.password, 'Password', entry.id)}
                      className="h-8 w-8 p-0 hover:bg-secondary/50"
                    >
                      {copiedId === entry.id ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {/* Tags */}
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {entry.tags.map(tag => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className={`text-xs ${getTagColor(tag)}`}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Notes */}
                  {entry.notes && (
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <button
                        onClick={() => {
                          setSelectedEntry(entry);
                          setShowNotesModal(true);
                        }}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors truncate"
                      >
                        {entry.notes.length > 50 ? `${entry.notes.substring(0, 50)}...` : entry.notes}
                      </button>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-1 ml-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEdit(entry)}
                    className="h-8 w-8 p-0 hover:bg-secondary/50"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(entry)}
                    className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex justify-between text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                <span>Created by {entry.createdBy}</span>
                <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notes Modal */}
      {showNotesModal && selectedEntry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Notes</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotesModal(false)}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">{selectedEntry.websiteName}</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {selectedEntry.notes}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Password Modal */}
      {showEditModal && editingEntry && (
        <EditPasswordModal
          entry={editingEntry}
          onClose={() => {
            setShowEditModal(false);
            setEditingEntry(null);
          }}
          onSave={async (updatedEntry) => {
            try {
              await updateEntry(editingEntry.id, {
                ...updatedEntry,
                createdBy: user?.name || editingEntry.createdBy
              });
              setShowEditModal(false);
              setEditingEntry(null);
              toast({
                title: "Password updated",
                description: `Password for ${updatedEntry.websiteName} has been updated`,
              });
            } catch (error) {
              toast({
                title: "Error",
                description: "Failed to update password entry",
                variant: "destructive",
              });
            }
          }}
        />
      )}
    </div>
  );
};

export default VaultPage;

import * as React from 'react';
import { passwordService, type PasswordEntry as APIPasswordEntry } from '../services/password';
import { activityService, type ActivityLog as APIActivityLog } from '../services/activity';

export interface PasswordEntry {
  id: string;
  websiteName: string;
  clientName: string;
  email: string;
  password: string;
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ActivityLog {
  id: string;
  adminName: string;
  action: 'add' | 'edit' | 'delete' | 'view';
  entryName: string;
  timestamp: string;
  details: string;
}

interface PasswordState {
  entries: PasswordEntry[];
  activityLogs: ActivityLog[];
  searchTerm: string;
  selectedTags: string[];
  isLoading: boolean;
  error: string | null;
  loadEntries: () => Promise<void>;
  loadActivityLogs: () => Promise<void>;
  addEntry: (entry: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEntry: (id: string, entry: Partial<PasswordEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  setSearchTerm: (term: string) => void;
  setSelectedTags: (tags: string[]) => void;
  getAllTags: () => string[];
  getFilteredEntries: () => PasswordEntry[];
}

// Helper function to convert API response to local format
const convertAPIPasswordEntry = (apiEntry: APIPasswordEntry): PasswordEntry => ({
  id: apiEntry.id,
  websiteName: apiEntry.websiteName,
  clientName: apiEntry.clientName,
  email: apiEntry.email,
  password: apiEntry.password,
  notes: apiEntry.notes || '',
  tags: apiEntry.tags || [],
  createdAt: new Date(apiEntry.createdAt).toISOString(),
  updatedAt: new Date(apiEntry.updatedAt).toISOString(),
  createdBy: apiEntry.createdBy,
});

const convertAPIActivityLog = (apiLog: APIActivityLog): ActivityLog => ({
  id: apiLog.id,
  adminName: apiLog.adminName,
  action: apiLog.action,
  entryName: apiLog.entryName,
  timestamp: new Date(apiLog.createdAt).toISOString(),
  details: apiLog.details,
});

class PasswordStore {
  private state: PasswordState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = {
      entries: [],
      activityLogs: [],
      searchTerm: '',
      selectedTags: [],
      isLoading: false,
      error: null,
      loadEntries: this.loadEntries.bind(this),
      loadActivityLogs: this.loadActivityLogs.bind(this),
      addEntry: this.addEntry.bind(this),
      updateEntry: this.updateEntry.bind(this),
      deleteEntry: this.deleteEntry.bind(this),
      setSearchTerm: this.setSearchTerm.bind(this),
      setSelectedTags: this.setSelectedTags.bind(this),
      getAllTags: this.getAllTags.bind(this),
      getFilteredEntries: this.getFilteredEntries.bind(this),
    };
  }

  private async loadEntries(): Promise<void> {
    try {
      this.state.isLoading = true;
      this.state.error = null;
      this.notifyListeners();

      const apiEntries = await passwordService.getAllPasswords();
      this.state.entries = apiEntries.map(convertAPIPasswordEntry);
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Failed to load entries';
    } finally {
      this.state.isLoading = false;
      this.notifyListeners();
    }
  }

  private async loadActivityLogs(): Promise<void> {
    try {
      this.state.isLoading = true;
      this.state.error = null;
      this.notifyListeners();

      const response = await activityService.getActivityLogs();
      this.state.activityLogs = response.logs.map(convertAPIActivityLog);
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Failed to load activity logs';
    } finally {
      this.state.isLoading = false;
      this.notifyListeners();
    }
  }

  private async addEntry(entryData: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      this.state.isLoading = true;
      this.state.error = null;
      this.notifyListeners();

      const apiEntry = await passwordService.createPassword({
        websiteName: entryData.websiteName,
        clientName: entryData.clientName,
        email: entryData.email,
        password: entryData.password,
        notes: entryData.notes,
        tags: entryData.tags,
        createdBy: entryData.createdBy,
      });

      const newEntry = convertAPIPasswordEntry(apiEntry);
      this.state.entries.unshift(newEntry);
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Failed to add entry';
    } finally {
      this.state.isLoading = false;
      this.notifyListeners();
    }
  }

private async updateEntry(id: string, updates: Partial<PasswordEntry>): Promise<void> {
    try {
      this.state.isLoading = true;
      this.state.error = null;
      this.notifyListeners();

      const updatedEntry = await passwordService.updatePassword(id, updates);

      const index = this.state.entries.findIndex(entry => entry.id === id);
      if (index !== -1) {
        this.state.entries[index] = convertAPIPasswordEntry(updatedEntry);
      }
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Failed to update entry';
    } finally {
      this.state.isLoading = false;
      this.notifyListeners();
    }
  }

private async deleteEntry(id: string): Promise<void> {
    try {
      this.state.isLoading = true;
      this.state.error = null;
      this.notifyListeners();

      await passwordService.deletePassword(id);

      const entryIndex = this.state.entries.findIndex(entry => entry.id === id);
      if (entryIndex !== -1) {
        this.state.entries.splice(entryIndex, 1);
      }
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Failed to delete entry';
    } finally {
      this.state.isLoading = false;
      this.notifyListeners();
    }
  }

  private setSearchTerm(term: string): void {
    this.state.searchTerm = term;
    this.notifyListeners();
  }

  private setSelectedTags(tags: string[]): void {
    this.state.selectedTags = tags;
    this.notifyListeners();
  }


  private getAllTags(): string[] {
    const allTags = this.state.entries.flatMap(entry => entry.tags);
    return [...new Set(allTags)].sort();
  }

  private getFilteredEntries(): PasswordEntry[] {
    let filtered = this.state.entries;
    
    // Debug logging
    console.log('Filtering entries:', {
      totalEntries: this.state.entries.length,
      searchTerm: this.state.searchTerm,
      selectedTags: this.state.selectedTags
    });

    if (this.state.searchTerm && this.state.searchTerm.trim()) {
      const term = this.state.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(entry => {
        const matches = 
          entry.websiteName.toLowerCase().includes(term) ||
          entry.clientName.toLowerCase().includes(term) ||
          entry.email.toLowerCase().includes(term) ||
          (entry.notes && entry.notes.toLowerCase().includes(term)) ||
          entry.tags.some(tag => tag.toLowerCase().includes(term));
        return matches;
      });
      console.log('After search filter:', filtered.length);
    }

    if (this.state.selectedTags.length > 0) {
      filtered = filtered.filter(entry =>
        this.state.selectedTags.some(tag => entry.tags.includes(tag))
      );
      console.log('After tag filter:', filtered.length);
    }

    console.log('Final filtered count:', filtered.length);
    return filtered;
  }


  public getState(): PasswordState {
    return { ...this.state };
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

export const passwordStore = new PasswordStore();

export function usePasswordStore(): PasswordState {
  const [state, setState] = React.useState(passwordStore.getState());
  
  React.useEffect(() => {
    const unsubscribe = passwordStore.subscribe(() => {
      setState(passwordStore.getState());
    });
    return unsubscribe;
  }, []);

  return state;
}

import { Request, Response } from 'express';
import PasswordEntry from '../models/PasswordEntry';
import ActivityLog from '../models/ActivityLog';

export const getAllPasswords = async (req: Request, res: Response) => {
  try {
    const { search, tags } = req.query;
    let query: any = {};

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { websiteName: searchRegex },
        { clientName: searchRegex },
        { email: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }

    if (tags && typeof tags === 'string') {
      const tagArray = tags.split(',');
      query.tags = { $in: tagArray };
    }

    const passwords = await PasswordEntry.find(query).sort({ createdAt: -1 });

    // Log activity
    await ActivityLog.create({
      adminName: req.user.name,
      action: 'view',
      entryName: 'Password entries',
      details: `Viewed password entries list`
    });

    res.json(passwords);
  } catch (error) {
    console.error('Get passwords error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPasswordById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const password = await PasswordEntry.findById(id);

    if (!password) {
      return res.status(404).json({ error: 'Password entry not found' });
    }

    // Log activity
    await ActivityLog.create({
      adminName: req.user.name,
      action: 'view',
      entryName: password.websiteName,
      details: `Viewed password entry for ${password.websiteName}`
    });

    res.json(password);
  } catch (error) {
    console.error('Get password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPassword = async (req: Request, res: Response) => {
  try {
    const { websiteName, clientName, email, password, notes, tags } = req.body;

    if (!websiteName || !clientName || !email || !password) {
      return res.status(400).json({ 
        error: 'Website name, client name, email, and password are required' 
      });
    }

    const newPassword = new PasswordEntry({
      websiteName,
      clientName,
      email,
      password,
      notes: notes || '',
      tags: tags || [],
      createdBy: req.user.name
    });

    const savedPassword = await newPassword.save();

    // Log activity
    await ActivityLog.create({
      adminName: req.user.name,
      action: 'add',
      entryName: websiteName,
      details: `Added new password entry for ${websiteName}`
    });

    res.status(201).json(savedPassword);
  } catch (error) {
    console.error('Create password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const password = await PasswordEntry.findById(id);
    if (!password) {
      return res.status(404).json({ error: 'Password entry not found' });
    }

    const updatedPassword = await PasswordEntry.findByIdAndUpdate(
      id,
      { ...updates, updatedBy: req.user.name },
      { new: true, runValidators: true }
    );

    // Log activity
    await ActivityLog.create({
      adminName: req.user.name,
      action: 'edit',
      entryName: password.websiteName,
      details: `Updated password entry for ${password.websiteName}`
    });

    res.json(updatedPassword);
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const password = await PasswordEntry.findById(id);
    if (!password) {
      return res.status(404).json({ error: 'Password entry not found' });
    }

    await PasswordEntry.findByIdAndDelete(id);

    // Log activity
    await ActivityLog.create({
      adminName: req.user.name,
      action: 'delete',
      entryName: password.websiteName,
      details: `Deleted password entry for ${password.websiteName}`
    });

    res.json({ message: 'Password entry deleted successfully' });
  } catch (error) {
    console.error('Delete password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllTags = async (req: Request, res: Response) => {
  try {
    const passwords = await PasswordEntry.find({}, 'tags');
    const allTags = passwords.flatMap(p => p.tags || []);
    const uniqueTags = [...new Set(allTags)].sort();

    res.json(uniqueTags);
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

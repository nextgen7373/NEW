import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import PasswordEntry from '../models/PasswordEntry';
import ActivityLog from '../models/ActivityLog';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trivault');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await PasswordEntry.deleteMany({});
    await ActivityLog.deleteMany({});
    console.log('Cleared existing data');

    // Create admin users
    const users = [
      {
        name: 'Sarah Johnson',
        email: 'sarah@agency.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        name: 'Mike Chen',
        email: 'mike@agency.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        name: 'Alex Rivera',
        email: 'alex@agency.com',
        password: 'admin123',
        role: 'admin'
      }
    ];

    const createdUsers = await User.create(users);
    console.log('Created admin users');

    // Create sample password entries
    const passwordEntries = [
      {
        websiteName: 'Google Ads Manager',
        clientName: 'TechCorp Solutions',
        email: 'agency@trimarketing.com',
        password: 'SecurePass123!',
        notes: 'Main account for all client campaigns',
        tags: ['Marketing', 'Advertising'],
        createdBy: 'Sarah Johnson'
      },
      {
        websiteName: 'Facebook Business Manager',
        clientName: 'FreshBrand Co.',
        email: 'social@trimarketing.com',
        password: 'FBManager2024$',
        notes: 'Access to all client Facebook pages and ad accounts',
        tags: ['Social Media', 'Marketing'],
        createdBy: 'Mike Chen'
      },
      {
        websiteName: 'Mailchimp',
        clientName: 'Local Restaurant Group',
        email: 'email@trimarketing.com',
        password: 'EmailCamp2024!',
        notes: 'Email marketing campaigns for all clients',
        tags: ['Email Marketing', 'Marketing'],
        createdBy: 'Alex Rivera'
      },
      {
        websiteName: 'LinkedIn Ads',
        clientName: 'B2B Solutions Inc',
        email: 'linkedin@trimarketing.com',
        password: 'LinkedInAds2024!',
        notes: 'B2B advertising campaigns',
        tags: ['B2B', 'LinkedIn', 'Marketing'],
        createdBy: 'Sarah Johnson'
      },
      {
        websiteName: 'Instagram Business',
        clientName: 'Fashion Boutique',
        email: 'instagram@trimarketing.com',
        password: 'InstaFashion2024$',
        notes: 'Instagram business account for fashion client',
        tags: ['Social Media', 'Instagram', 'Fashion'],
        createdBy: 'Mike Chen'
      }
    ];

    await PasswordEntry.create(passwordEntries);
    console.log('Created sample password entries');

    // Create initial activity logs
    const activityLogs = [
      {
        adminName: 'Sarah Johnson',
        action: 'add' as const,
        entryName: 'Google Ads Manager',
        details: 'Added new password entry for Google Ads Manager'
      },
      {
        adminName: 'Mike Chen',
        action: 'add' as const,
        entryName: 'Facebook Business Manager',
        details: 'Added new password entry for Facebook Business Manager'
      },
      {
        adminName: 'Alex Rivera',
        action: 'add' as const,
        entryName: 'Mailchimp',
        details: 'Added new password entry for Mailchimp'
      }
    ];

    await ActivityLog.create(activityLogs);
    console.log('Created initial activity logs');

    console.log('Database seeded successfully!');
    console.log('Admin users created:');
    console.log('- sarah@agency.com (password: admin123)');
    console.log('- mike@agency.com (password: admin123)');
    console.log('- alex@agency.com (password: admin123)');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();

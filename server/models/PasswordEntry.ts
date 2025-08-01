import mongoose, { Document, Schema } from 'mongoose';

export interface IPasswordEntry extends Document {
  _id: string;
  websiteName: string;
  clientName: string;
  email: string;
  password: string;
  notes?: string;
  tags?: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const passwordEntrySchema = new Schema<IPasswordEntry>({
  websiteName: {
    type: String,
    required: [true, 'Website name is required'],
    trim: true
  },
  clientName: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  tags: {
    type: [String],
    default: []
  },
  createdBy: {
    type: String,
    required: [true, 'Created by is required']
  }
}, {
  timestamps: true
});

export default mongoose.model<IPasswordEntry>('PasswordEntry', passwordEntrySchema);

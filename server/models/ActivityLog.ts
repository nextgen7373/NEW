import mongoose, { Document, Schema } from 'mongoose';

export interface IActivityLog extends Document {
  _id: string;
  adminName: string;
  action: 'add' | 'edit' | 'delete' | 'view';
  entryName: string;
  details: string;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>({
  adminName: {
    type: String,
    required: [true, 'Admin name is required'],
    trim: true
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: ['add', 'edit', 'delete', 'view']
  },
  entryName: {
    type: String,
    required: [true, 'Entry name is required'],
    trim: true
  },
  details: {
    type: String,
    required: [true, 'Details are required'],
    trim: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export default mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);

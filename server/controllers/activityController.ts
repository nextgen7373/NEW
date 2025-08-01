import { Request, Response } from 'express';
import ActivityLog from '../models/ActivityLog';

export const getAllActivityLogs = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const logs = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await ActivityLog.countDocuments();
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      logs,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalLogs: total,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getActivityLogsByUser = async (req: Request, res: Response) => {
  try {
    const { adminName } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const logs = await ActivityLog.find({ adminName })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await ActivityLog.countDocuments({ adminName });
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      logs,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalLogs: total,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get user activity logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getActivityStats = async (req: Request, res: Response) => {
  try {
    const stats = await ActivityLog.aggregate([
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalActivities = await ActivityLog.countDocuments();
    const recentActivities = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      stats,
      totalActivities,
      recentActivities
    });
  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

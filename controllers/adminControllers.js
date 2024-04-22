// controllers/adminControllers.js
import User from "../models/User";
import ActivityLog from "../models/ActivityLog";

const getFarmersCount = async (req, res, next) => {
  try {
    const farmersCount = await User.countDocuments({ role: "farmer" });
    return res.json({ farmersCount });
  } catch (error) {
    next(error);
  }
};

const getRecentActivities = async (req, res, next) => {
  try {
    const recentActivities = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(10);
    return res.json(recentActivities);
  } catch (error) {
    next(error);
  }
};

export { getFarmersCount, getRecentActivities };

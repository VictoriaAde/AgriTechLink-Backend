import { verify } from "jsonwebtoken";
import User from "../models/User";

export const authGuard = async (req, res, next) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      const token = req.headers.authorization.split(" ")[1];
      const { id } = verify(token, process.env.JWT_SECRET);
      const user = await User.findById(id).select("-password");
      if (!user) {
        throw new Error("User not found");
      }
      req.user = user;
      next();
    } else {
      throw new Error("Not authorized, No token");
    }
  } catch (error) {
    let statusCode = 401;
    if (error.name === "JsonWebTokenError") {
      statusCode = 403;
    }
    next({ message: error.message, statusCode });
  }
};

export const adminGuard = (req, res, next) => {
  if (req.user && req.user.admin) {
    next();
  } else {
    const error = new Error("Not authorized as an admin");
    error.statusCode = 403;
    next(error);
  }
};

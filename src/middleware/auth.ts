import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";

export interface JwtPayload {
  id: number;
  name: string;
  email: string;
  role: "contributor" | "maintainer";
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers["authorization"];

  if (!authorization) {
    res.status(401).json({
      success: false,
      message: "Unauthorized: No token provided",
      errors: null,
    });
    return;
  }

  try {
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length)
      : authorization;

    const decoded = jwt.verify(token, config.secret as string) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
      errors: error.message,
    });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Forbidden: Insufficient permissions",
        errors: null,
      });
      return;
    }
    next();
  };
};

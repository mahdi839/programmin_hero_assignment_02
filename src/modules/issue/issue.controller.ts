import type { Request, Response } from "express";
import { issueService } from "./issue.service";
import type { IssueStatus, IssueType, SortOrder } from "./issue.interface";
 
const createIssue = async (req: Request, res: Response) => {
  try {
    const reporterId = req.user!.id;
    const result = await issueService.createIssue(req.body, reporterId);
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      errors: error,
    });
  }
};

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const sort = (req.query.sort as SortOrder) || "newest";
    const type = req.query.type as IssueType | undefined;
    const status = req.query.status as IssueStatus | undefined;
 
    // Validate query params
    const validSorts = ["newest", "oldest"];
    const validTypes = ["bug", "feature_request"];
    const validStatuses = ["open", "in_progress", "resolved"];
 
    if (sort && !validSorts.includes(sort)) {
      res.status(400).json({ success: false, message: "Invalid sort value", errors: null });
      return;
    }
    if (type && !validTypes.includes(type)) {
      res.status(400).json({ success: false, message: "Invalid type value", errors: null });
      return;
    }
    if (status && !validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: "Invalid status value", errors: null });
      return;
    }
 
    const result = await issueService.getAllIssues({ sort, type, status });
    res.status(200).json({
      success: true,
      message: "Issues retrived successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      errors: error,
    });
  }
};

export const issueController = {
  createIssue,
  getAllIssues,
//   getSingleIssue,
//   updateIssue,
//   updateIssueStatus,
//   deleteIssue,
};
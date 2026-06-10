import type { Request, Response } from "express";
import { issueService } from "./issue.service";
import { StatusCodes } from "http-status-codes";
import type { IssueStatus, IssueType, SortOrder } from "./issue.interface";
 
const createIssue = async (req: Request, res: Response) => {
  try {
    const { title, description, type } = req.body;
    const validTypes: IssueType[] = ["bug", "feature_request"];

    if (
      typeof title !== "string" ||
      title.trim().length === 0 ||
      title.length > 150
    ) {
      res.status(400).json({
        success: false,
        message: "Title is required and must be 150 characters or less",
        errors: null,
      });
      return;
    }

    if (typeof description !== "string" || description.length < 20) {
      res.status(400).json({
        success: false,
        message: "Description is required and must be at least 20 characters",
        errors: null,
      });
      return;
    }

    if (!validTypes.includes(type)) {
      res.status(400).json({
        success: false,
        message: "Type must be either bug or feature_request",
        errors: null,
      });
      return;
    }

    const reporter_id = req.user!.id;
    const issueType = type as IssueType;
    const result = await issueService.createIssue(
      { title: title.trim(), description, type: issueType,reporter_id},
    );
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
 
    const filters: {
      sort: SortOrder;
      type?: IssueType;
      status?: IssueStatus;
    } = { sort };

    if (type) {
      filters.type = type;
    }

    if (status) {
      filters.status = status;
    }

    const result = await issueService.getAllIssues(filters);
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

export const getSingleIssue = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Invalid issue ID." });
      return;
    }

    const issue = await issueService.getIssueById(id);
    if (!issue) {
      res.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Issue not found." });
      return;
    }

    res.status(StatusCodes.OK).json({ success: true, message: "Issue retrived successfully", data: issue });
  } catch {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Something went wrong." });
  }
};

export const issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
//   updateIssue,
//   updateIssueStatus,
//   deleteIssue,
};

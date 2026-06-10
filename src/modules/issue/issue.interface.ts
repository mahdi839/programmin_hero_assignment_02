export interface IIssue {
  title: string;
  description: string;
  reporter_id: number;
  type: "bug" | "feature_request";
}

export interface IIssueUpdate {
  title?: string;
  description?: string;
  type?: "bug" | "feature_request";
}

export interface IIssueStatusUpdate {
  status: "open" | "in_progress" | "resolved";
}

export type IssueStatus = "open" | "in_progress" | "resolved";
export type IssueType = "bug" | "feature_request";
export type SortOrder = "newest" | "oldest";
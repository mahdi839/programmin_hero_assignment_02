import { pool } from "../../db";
import type { IIssue, IIssueUpdate, IssueStatus, IssueType, SortOrder } from "./issue.interface";


const fetchReporters = async (reporterIds: number[]) => {
  if (reporterIds.length === 0) return {};
  const uniqueIds = [...new Set(reporterIds)];
  const result = await pool.query(
    `SELECT id, name, role FROM users WHERE id = ANY($1::int[])`,
    [uniqueIds]
  );
  const map: Record<number, { id: number; name: string; role: string }> = {};
  for (const row of result.rows) {
    map[row.id] = { id: row.id, name: row.name, role: row.role };
  }
  return map;
};

const createIssue = async (payload: IIssue, reporterId: number) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `INSERT INTO issues(title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, description, type, status, reporter_id, created_at, updated_at`,
    [title, description, type, reporterId]
  );
  return result.rows[0];
};

const getAllIssues = async (filters: {
  sort?: SortOrder;
  type?: IssueType;
  status?: IssueStatus;
}) => {
  const { sort = "newest", type, status } = filters;
 
  const conditions: string[] = [];
  const values: any[] = [];
  let idx = 1;
 
  if (type) {
    conditions.push(`type = $${idx++}`);
    values.push(type);
  }
  if (status) {
    conditions.push(`status = $${idx++}`);
    values.push(status);
  }
 
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderClause = sort === "oldest" ? "ORDER BY created_at ASC" : "ORDER BY created_at DESC";
 
  const result = await pool.query(
    `SELECT id, title, description, type, status, reporter_id, created_at, updated_at
     FROM issues ${whereClause} ${orderClause}`,
    values
  );
 
  const issues = result.rows;
  const reporterIds = issues.map((i: any) => i.reporter_id);
  const reporterMap = await fetchReporters(reporterIds);
 
  return issues.map((issue: any) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: reporterMap[issue.reporter_id] || null,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  }));
};
 

export const issueService = {
  createIssue,
  getAllIssues,
//   getSingleIssue,
//   updateIssue,
//   updateIssueStatus,
//   deleteIssue,
//   getIssueById,
};
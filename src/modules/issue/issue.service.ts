import { pool } from "../../db";
import type { IUser } from "../user/user.interface";
import type { IIssue, IIssueUpdate, IssueStatus, IssueType, SortOrder } from "./issue.interface";


// Helper to attach reporter info to issues without SQL JOIN
const attachReporters = async (issues: IIssue[]) => {
  if (issues.length === 0) return [];

  // Collect unique reporter IDs
  const reporterIds = [...new Set(issues.map((i) => i.reporter_id))];

  // Fetch all those users in one query using IN (...)
  const usersResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = ANY($1::int[])`,
    [reporterIds]
  );

  // Build a quick lookup map: { userId: userObj }
  const userMap: Record<number, Partial<IUser>> = {};
  usersResult.rows.forEach((u) => {
    userMap[u.id] = u;
  });

  // Attach reporter to each issue, remove raw reporter_id
  return issues.map(({ reporter_id, ...issue }) => ({
    ...issue,
    reporter: userMap[reporter_id] || null,
  }));
};

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

const createIssue = async (payload: IIssue) => {
  const { title, description, type,reporter_id } = payload;
  const result = await pool.query(
    `INSERT INTO issues(title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, description, type, status, reporter_id, created_at, updated_at`,
    [title, description, type, reporter_id]
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

export const getIssueById = async (id: number) => {
  const result = await pool.query("SELECT * FROM issues WHERE id = $1", [id]);
  if (result.rows.length === 0) return null;

  const [issueWithReporter] = await attachReporters(result.rows);
  return issueWithReporter;
};

export const updateIssue = async (
  id: number,
  fields: Partial<Pick<IIssue, "title" | "description" | "type">>
): Promise<IIssue | null> => {
  // Dynamically build SET clause for only provided fields
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (fields.title !== undefined) {
    setClauses.push(`title = $${paramIndex++}`);
    values.push(fields.title);
  }
  if (fields.description !== undefined) {
    setClauses.push(`description = $${paramIndex++}`);
    values.push(fields.description);
  }
  if (fields.type !== undefined) {
    setClauses.push(`type = $${paramIndex++}`);
    values.push(fields.type);
  }

  // Always update the updated_at timestamp
  setClauses.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query(
    `UPDATE issues SET ${setClauses.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  return result.rows[0] || null;
};

export const deleteIssue = async (id: number): Promise<boolean> => {
  const result = await pool.query("DELETE FROM issues WHERE id = $1 RETURNING id", [id]);
  return (result.rowCount ?? 0) > 0;
};
 

export const issueService = {
  createIssue,
  getAllIssues,
  // getSingleIssue,
  updateIssue,
  // updateIssueStatus,
  deleteIssue,
  getIssueById,
};
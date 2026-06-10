import { Router } from "express";
import { getSingleIssue, issueController } from "./issue.controller";
import { authenticate } from "../../middleware/auth";

 
const router = Router();
router.get("/", issueController.getAllIssues);
router.get("/:id", getSingleIssue);
router.post("/", authenticate, issueController.createIssue);
export const issueRoute = router;
import { Router } from "express";
import { getSingleIssue, issueController } from "./issue.controller";
import { authenticate, authorize } from "../../middleware/auth";


 
const router = Router();
router.get("/", issueController.getAllIssues);
router.get("/:id", getSingleIssue);
router.post("/", authenticate, issueController.createIssue);
router.patch("/:id", authenticate,issueController.updateIssue);

// Maintainer only
router.delete("/:id", authenticate, authorize("maintainer"), issueController.deleteIssue);
export const issueRoute = router;
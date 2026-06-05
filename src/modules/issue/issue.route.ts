import { Router } from "express";
import { issueController } from "./issue.controller";
import { authenticate } from "../../middleware/auth";

 
const router = Router();
router.get("/", issueController.getAllIssues);

router.post("/", authenticate, issueController.createIssue);
export const issueRoute = router;
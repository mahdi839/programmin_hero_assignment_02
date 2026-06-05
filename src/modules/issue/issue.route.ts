import { Router } from "express";
import { issueController } from "./issue.controller";
import { authenticate, authorizeRoles } from "../../middlewares/auth.middleware";
 
const router = Router();
router.get("/", issueController.getAllIssues);

router.post("/", authenticate, issueController.createIssue);
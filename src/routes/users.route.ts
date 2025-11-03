import { Router } from "express";
import { getUserById, createUser, getCacheStatus, clearCache } from "../controllers/users.controller";

const router = Router();

router.get("/cache/status", getCacheStatus);
router.delete("/cache", clearCache);
router.get("/:id", getUserById);
router.post("/", createUser);

export default router;

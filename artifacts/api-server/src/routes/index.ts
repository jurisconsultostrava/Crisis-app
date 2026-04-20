import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import accountsRouter from "./accounts.js";
import tasksRouter from "./tasks.js";
import syncRouter from "./sync.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(accountsRouter);
router.use(tasksRouter);
router.use(syncRouter);

export default router;

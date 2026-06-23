import { Router, type IRouter } from "express";
import healthRouter from "./health";
import serverRouter from "./server";
import proxyRouter from "./proxy";
import compilerRouter from "./compiler";

const router: IRouter = Router();

router.use(healthRouter);
router.use(serverRouter);
router.use(proxyRouter);
router.use(compilerRouter);

export default router;
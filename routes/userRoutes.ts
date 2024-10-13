import { Router } from "express";
import * as userController from "../controller/userController";

const router = Router();

router.get("/user/:address", userController.getUser);

export default router;

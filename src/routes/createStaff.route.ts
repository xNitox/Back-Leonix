import { createStaffController } from "../controllers/createStaffController.js";
import { Router } from "express";






const createStaffRoute = Router();

createStaffRoute.post('/CreateStaff',createStaffController);
export default createStaffRoute;
import { createStaffController } from "../controllers/createStaff.controller.js";
import { Router } from "express";






const createStaffRoute = Router();

createStaffRoute.post('/CreateStaff', createStaffController);
export default createStaffRoute;
import { Router } from "express";
import { roleController } from "../controllers/role.controller.js";


const routerRole = Router();

routerRole.get('/role', roleController);

export default routerRole;
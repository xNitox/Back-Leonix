import { Router } from "express";
import { roleController } from "../controllers/roleController.js";


const routerRole = Router();

routerRole.get('/role', roleController);

export default routerRole;
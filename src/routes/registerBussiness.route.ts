import { Router } from "express";
import { registerBusinessController } from "../controllers/registerBusinessController.js";


const rutaRegisterCommerce = Router();

rutaRegisterCommerce.post('/registerCommerce', registerBusinessController);
export default rutaRegisterCommerce;
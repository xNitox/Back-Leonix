import { Router } from "express";
import { registerBusinessController } from "../controllers/registerBusiness.controller.js";
import { verifyTokenToRegisterBusiness } from "../middleware/verifyToken.js";


const rutaRegisterCommerce = Router();

rutaRegisterCommerce.post('/registerCommerce', verifyTokenToRegisterBusiness, registerBusinessController);
export default rutaRegisterCommerce;
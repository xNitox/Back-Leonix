import { Router } from "express";
import { verifyTokenToRegisterBusiness } from "../middleware/verifyToken.js";
import { checkCommerceId } from "../controllers/checkCommerceId.controller.js";


const checkCommerce = Router();

checkCommerce.get(`/checkCommerceId`,verifyTokenToRegisterBusiness,checkCommerceId);
export default checkCommerce;
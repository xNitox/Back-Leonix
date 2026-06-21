import { Router } from "express";
import { getProductsSale } from "../controllers/product.sale.api.js";
import { handleLogin } from "../controllers/authControllers.js";



const router = Router();
router.post('/auth/login', handleLogin);
router.get('/products', getProductsSale);
export default router;
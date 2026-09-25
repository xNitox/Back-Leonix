import { Router } from "express";
import { generateCodeCashier } from "../controllers/createStaff.controller.js";



const codeCashier = Router();

codeCashier.post(`/codeCashier`, generateCodeCashier);
export default codeCashier;
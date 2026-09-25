import { Router } from "express";
import { verifyTokenToRegisterBusiness } from "../middleware/verifyToken.js";

const verifyToken = Router();

verifyToken.get(`/verify-token`,verifyTokenToRegisterBusiness,(req,res) =>{
    //si llego aqui, el midleware ya verifico el token
    res.status(200).json({valido:true});

});

export default verifyToken;



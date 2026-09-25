import type { Request, Response } from "express";


export const roleController = (_req:Request,res:Response ) => {
    const role =[
        {name: "Cajero"},
        {name: "Gerente"},
        {name: "Vendedor en terreno"},
        {name: "Jefe de Área"},
        


    ];
    return res.status(200).json(role);
    }
    


import type { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
// Verifica el token del front y expone el id del dueño en req
// (así el backend no confía en el owner_id que manda el frontend)

declare global{//para no tener error de tipado se agrega useId como variable global
    namespace Express{
        interface Request{
            userId?: string;
        }
    }
}

export const verifyTokenToRegisterBusiness = async (req: Request, res: Response, next: NextFunction) => {
    const secret = process.env.JWT_SECRET;
    const tokenFront = req.headers.authorization;
    if(!secret){
        throw new Error ('JWT_SECRET no está definido en el entorno');
    }
    if (!tokenFront) {
        return res.status(401).json({ message: 'No autorizado' });
    }
    const token = tokenFront.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: 'No autorizado' });
    }
    const decoded = jwt.verify(token,secret);
    if(typeof decoded === 'string' || !('id' in decoded)){
        return res.status(401).json({ message: 'No autorizado' })
    }
    const id = decoded.id;
    req.userId= id;
    next();

    
}
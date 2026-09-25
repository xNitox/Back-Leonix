import type { Request, Response } from 'express';
import { supabaseAdmin } from '../supabaseClient.js';
//Controlador para registrar el comercio nuevo en la bd, datos recibidos desde el frontend

// interfaz para que typescript sepa que datos deban recibirse y de que tipo
interface registerBusinessProps {
  name_commerce: string,
  owner_name: string,
  owner_last_name: string,
  rut_commerce: string,
  phone: string,
  email: string,
  city: string,
}
interface registerMoreOwnerId extends registerBusinessProps{
  owner_id: string
}

// funcion para que recibe los datos , los limpia con trim y los envia a la bd , además de responder el estado de la peticion al frontend
export const registerBusinessController = async (req: Request, res: Response) => {
  const body: registerMoreOwnerId = {...req.body, owner_id:req.userId}
  const campos: (keyof registerBusinessProps)[] = ['name_commerce','owner_name', 'owner_last_name', 'rut_commerce', 'phone', 'email',
    'city',
  ]
  const hasEmptyField = campos.some(field => {
    const value = req.body[field]
    return typeof value !== "string" || value.trim() === "";
  })
  try {
    if (!hasEmptyField) {
      campos.forEach(field => {
        const value = body[field];
        if (typeof value === "string") {
          body[field] = value.trim();
        }
      })
      const { data, error } = await supabaseAdmin
        .from('commerce')
        .insert(
          [body]
        )
      if (error) {
        console.log('Error RLS/Supabase',
          {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          }
        )
        return res.status(500).json({ message: "Error al crear comercio", error:{
          code: error.code,
          message:error.message,
          details: error.details,
          hint: error.hint
        } });
      }
      console.log("Esto paso:", data);
      return res.status(200).json({ message: "Comercio registrado con exito" });


    }
    else {
      return res.status(400).json({ message: "Todos los campos son obligatorios" })
    }
  } catch (error) {

    console.error("Ups lo siento:", error);
    return res.status(500).json({ message: "Error interno del servidor" })

  }
}


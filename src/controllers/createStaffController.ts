import type { Request, Response } from "express";
import { supabaseAdmin } from "../supabaseClient.js";

type StaffFormData = {
    commerce_id: string,
    role: string,
    name: string,
    last_name: string,
    email: string,
    phone: string,
    rut: string,
    pin: string
}
export const createStaffController = async (req: Request, res: Response) => {
    const body: StaffFormData = req.body;
    const campos: (keyof StaffFormData)[] = ['role', 'name', 'last_name', 'email', 'phone', 'rut', 'pin',"commerce_id"];
    const hasEmptyField = campos.some((campo) => !req.body[campo]?.trim())
    try {
        if (!hasEmptyField) {
            const { data, error } = await supabaseAdmin
                .from('staff')
                .insert(
                    [
                        body
                    ]
                )
                console.log("Esto paso:", data)
               return res.status(200).json({message: "Staff creado con exito"})
        }else{
            console.log("Campos vacíos:", req.body);
            return res.status(400).json({message: "Todos los campos son obligatorios"})
        }

    } catch(error) {
        return res.status(500).json(error)
    }

}

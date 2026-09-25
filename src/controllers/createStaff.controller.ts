import type { Request, Response } from "express";
import { supabaseAdmin } from "../supabaseClient.js";
import bcrypt from 'bcrypt';

type StaffFormData = {
    commerce_id: string,
    role: string,
    name: string,
    last_name: string,
    email: string,
    phone: string,
    rut: string,
    code_cashier: string,
    pin: string
}
export const createStaffController = async (req: Request, res: Response) => {
    const body: StaffFormData = req.body;
    //acceder a pin
    const { pin, role, name, last_name, email, phone, rut, code_cashier, commerce_id } = body;
    const campos: (keyof StaffFormData)[] = ['role', 'name', 'last_name', 'email', 'phone', 'rut', 'pin', 'code_cashier', "commerce_id"];
    const hasEmptyField = campos.some((campo) => !req.body[campo]?.trim());


    try {
        if (!hasEmptyField) {
            const saltRounds = 10; //vueltas de encriptacion para el pin
            const pinEncriptado = await bcrypt.hash(pin, saltRounds);
            const { data, error: errorSupabase } = await supabaseAdmin
                .from('staff')
                .insert([

                    {
                        role,
                        name,
                        last_name,
                        email,
                        phone,
                        rut,
                        pin: pinEncriptado,
                        code_cashier,
                        commerce_id
                    }
                ]);
            if (errorSupabase) {
                console.error("❌ ERROR DETALLADO DE SUPABASE:", errorSupabase);
                return res.status(400).json({
                    message: "Error al registrar en la base de datos",
                    detail: errorSupabase.message
                });
            }

            return res.status(200).json({ message: "Staff creado con exito" })
        } else {
            console.log("Campos vacíos:", req.body);
            return res.status(400).json({ message: "Todos los campos son obligatorios" })
        }


    } catch (error) {
        console.error("ERROR REAL DE POSTGRES:", error);
        return res.status(500).json(error)
    }

}

//funcion para enviar codigo de cajero al front
export const generateCodeCashier = async (req: Request, res: Response) => {
    const { p_commerce_id } = req.body;
    try {
        const { data: codigo, error: errorRPC } = await supabaseAdmin
            .rpc('gen_code_cashier_random', { p_commerce_id })
        if (errorRPC) {
            return res.status(400).json({ message: `Error RPC ${errorRPC.message}` })
        }
        return res.status(200).json(codigo);

    } catch (error) {
        if (error instanceof Error) {

            res.status(500).json({ message: `Error interno ${error.message}` })
        }
        return res.status(500).json({ message: "Error desconocido" })
    }
}
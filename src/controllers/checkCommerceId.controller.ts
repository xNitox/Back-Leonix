import type { Request, Response } from "express"
import { supabaseAdmin } from "../supabaseClient.js"
//comprueba que el usuario dueño tenga un comercio registrado
export const checkCommerceId = async (req: Request, res: Response) => {
    if (!req.userId) {
        return res.status(401).json({
            message: `No autorizado`
        })
    }
    const { data, error, } = await supabaseAdmin
        .from('commerce')
        .select('owner_id')
        .eq('owner_id', req.userId)
        .single()
    console.log('CHECKCOMMERCEID',data)

    if (error) {
        if (error.code === 'PGRST116') { //codigo que arroja supabase si no encuentra nada
            return res.status(200).json({
                tieneComercio: false

            })
        } else {
            return res.status(500).json({
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint
            })
        }
    } else if (data) { // siempre supabase devuelve la data al hacer la consulta, si devuelve es por que existe
        return res.status(200).json({
            tieneComercio: true
        })
    }
}
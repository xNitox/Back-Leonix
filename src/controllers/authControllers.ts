import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../supabaseClient.js';

//trae user y password de la respuesta del formulario del front "Login"
export const handleLogin = async (req: Request, res: Response) => {
    const { user, password, rutCommerce } = req.body;
    //validamos si user y password enviado desde front es igual al de supabase

    if (!user || !password) {
        return res.status(400).json({ message: 'usuario y contraseña son requeridos' });
    }
    try {
        //verificar si es un email (login dueños email + contraseña)
        if (user.includes('@')) {
            const { data, error } = await supabaseAdmin.auth.signInWithPassword({
                email: user,
                password: password,
                
            });
            console.log('LOGIN SUPABASE ERROR', error);
            console.log('LOGIN SUPABASE DATA', data);


            if (error) return res.status(401).json({ message: 'Credenciales incorrectas' });
            const payloadAdmin = {
                email: data.session
            };

            const {data: commerce, error: commerceError} = await supabaseAdmin
            .from('commerce')
            .select('id')
            .eq('id', data.user.id)
            .single();

            const token = jwt.sign(
                payloadAdmin,
                process.env.JWT_SECRET || '1',
                { expiresIn: '12h' }
            );
            // Retornamos los datos del usuario dueño y su sesión
            return res.status(200).json({
                id: data.user.id,
                role: 'owner',
                token: token,
                user: data.user,
                session: data.session,
                commerce_id: commerce?.id
            });

        }
        // verificamos si es con rut (login de staff: cajero etc..)
        else {
            if (!rutCommerce) {
                return res.status(400).json({ message: 'El RUT del comercio es requerido para el personal' });
            }
            //Limpiamos los rut
            const cleanRutCommerce = rutCommerce.replace(/[\.-]/g, '').trim();
            const cleanStaffRut = user.replace(/[\.-]/g, '').trim();
            // PASO A: Buscamos el ID (UUID) real de la empresa usando el RUT comercial recibido
            const { data: commerce, error: commerceError } = await supabaseAdmin
                .from('commerce')
                .select('id')
                .eq('rut', cleanRutCommerce)
                .single()
            if (commerceError || !commerce) {
                return res.status(401).json({ message: 'El comercio ingresado no existe' });
            }
            const { data: staffMember, error: staffError } = await supabaseAdmin
                .from('staff')
                .select('id,name,last_name,role,commerce_id,rut,pin')
                .eq('commerce_id', commerce.id)
                .eq('rut', cleanStaffRut)
                .eq('pin', password)
                .single()
            if (staffError || !staffMember) {
                return res.status(401).json({ message: 'RUT de personal incorrecto o PIN para este comercio' })
            }
            const payload = {
                id: staffMember.id,
                role: staffMember.role,
                commerce_id: commerce.id
            }
            // Creamos el token usando nuestra clave secreta y le damos validez por 12 horas (un turno de trabajo)
            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET || 'secreto local de emergencia',
                { expiresIn: '12' }
            );

            // Retornamos los datos del staff logueado de forma exitosa

            return res.status(200).json({
                role: staffMember.role,//ex: casher,ap,gerente
                token: token,
                user: {
                    id: staffMember.id,
                    name: `${staffMember.name} ${staffMember.last_name}`,
                    commerce_id: staffMember.commerce_id,
                    rut: staffMember.rut,
                }
            });

        }
    } catch (error) {
        console.error('Error en el controllador del login', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

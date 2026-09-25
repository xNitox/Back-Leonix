import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { supabaseAdmin, supabasePublish } from '../supabaseClient.js';
import bcrypt from 'bcrypt';

//Login user
//trae user y password de la respuesta del formulario del front "Login"
export const handleLogin = async (req: Request, res: Response) => {
    const secret = process.env.JWT_SECRET;
    //validacion de jwt
    const { user, password, rutCommerce } = req.body;
    if (!secret) {
        throw new Error('JWT_SECRET no está definido')
    }
    //validamos si user y password enviado desde front es igual al de supabase

    if (!user || !password) {
        return res.status(400).json({ message: 'usuario y contraseña son requeridos' });
    }
    try {
        //verificar si es un email (login dueños email + contraseña)
        if (user.includes('@')) {
            const { data, error } = await supabasePublish.auth.signInWithPassword({
                email: user,
                password: password,

            });
            console.log('LOGIN SUPABASE ERROR', error);
            console.log('LOGIN SUPABASE DATA', data);


            if (error) return res.status(401).json({ message: 'Credenciales incorrectas' });
            const payloadAdmin = {
                id: data.user.id,
                role: 'owner'
            };

            const { data: commerce, error: commerceError } = await supabaseAdmin
                .from('commerce')
                .select('id,name_commerce,owner_name,owner_last_name')
                .eq('owner_id', data.user.id)
                .maybeSingle();
            console.log('nombre', commerce?.name_commerce, commerce?.owner_name);
            console.log('ID que viene del login:', data.user.id);
            console.log('COMMERCE CONSULTA NOMBRES:', commerce);       // ¿{ id: '...' } o null?
            console.log('COMMERCE ERROR:', commerceError);  // ¿algún error?



            const token = jwt.sign(
                payloadAdmin,
                secret,
                { expiresIn: '12h' }
            );
            // Retornamos los datos del usuario dueño y su sesión
            return res.status(200).json({
                id: data.user.id,
                role: 'owner',
                token: token,
                user: {
                    id: data.user.id,
                    email: data.user.email,
                },
                commerce_id: commerce?.id,
                name_commerce: commerce?.name_commerce,
                owner_name: commerce?.owner_name,
                owner_last_name: commerce?.owner_last_name
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
                .eq('rut_commerce', cleanRutCommerce)
                .maybeSingle()
            if (commerceError || !commerce) {
                return res.status(401).json({ message: 'El comercio ingresado no existe' });
            }

            const { data: staffMember, error: staffError } = await supabaseAdmin
                .from('staff')
                .select('id,name,last_name,role,commerce_id,rut,pin,commerce!inner(rut_commerce),code_cashier')
                .eq('commerce_id', commerce.id)
                .eq('commerce.rut_commerce', cleanRutCommerce)
                .eq('code_cashier',user)
                .maybeSingle()
            if (staffError || !staffMember) {
                return res.status(401).json({ message: 'RUT de personal incorrecto o PIN para este comercio' })
            }
            //comienza bcrypt para comparar contraseña ingresada vs la de la tabla pin
            const pinValido = await bcrypt.compare(password, staffMember.pin);
            if (!pinValido) {
                // Si no coinciden, cortas la ejecución y devuelves un error de credenciales
                return res.status(401).json({ message: "El código o el PIN son incorrectos" });
            }  //termina bcrypt
            const payload = {
                id: staffMember.id,
                role: staffMember.role,
                commerce_id: commerce.id
            }
            // Creamos el token usando nuestra clave secreta y le damos validez por 12 horas (un turno de trabajo)
            const token = jwt.sign(
                payload,
                secret,
                { expiresIn: '12h' }
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

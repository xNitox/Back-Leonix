# Middleware `verifyTokenToRegisterBusiness`

## Ubicación

```
Back-Leonix/src/middleware/verifyToken.ts
```

## ¿Qué es un middleware?

Un **middleware** es una función que se ejecuta **antes** de llegar al controlador (controller). Actúa como un "puesto de control" en el camino de la petición:

```
Petición del front → [Middleware] → [Controller] → Respuesta
```

En Express, un middleware recibe 3 parámetros:

- `req` → la petición (la "mochila" que viaja).
- `res` → la respuesta (para responder si hay que rechazar).
- `next` → la función que "deja pasar" al siguiente paso.

**Regla de oro:** o llamas `next()` (para continuar) o usas `res` (para responder y terminar). **Nunca ambos.**

## ¿Cuál es el propósito de este middleware?

Verificar que el token JWT enviado por el frontend sea **válido** y, si lo es, **exponer el id del dueño** en `req.userId` para que el controlador lo use.

Esto resuelve un problema de **seguridad**: el frontend **no debe decidir** quién es el dueño del comercio. El dueño se identifica por el **token firmado** (que no se puede falsificar), no por un campo que el frontend pueda manipular.

## ¿Dónde se usa?

Se encadena en la ruta de registro de comercio, **antes** del controlador:

```ts
// Back-Leonix/src/routes/registerBussiness.route.ts
rutaRegisterCommerce.post(
  '/registerCommerce',
  verifyTokenToRegisterBusiness,   // ← middleware (primero)
  registerBusinessController       // ← controller (después)
);
```

Express ejecuta el middleware primero; si llama a `next()`, pasa el **mismo** `req` (ya modificado) al controlador.

## El flujo paso a paso

```
1. El frontend envía el token en el header:  Authorization: Bearer <token>
2. El middleware lee el header.
3. Verifica que exista la clave secreta (JWT_SECRET).
4. Verifica que el header no esté vacío.
5. Extrae el token (quita el prefijo "Bearer ").
6. Verifica que el token extraído exista.
7. Verifica el token con jwt.verify (firma + expiración).
8. Verifica que el payload tenga la propiedad "id".
9. Guarda el id en req.userId.
10. Llama a next() para pasar al controlador.
```

## Explicación del código

### 1. Ampliación del tipo `Request` (declaration merging)

```ts
declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}
```

El tipo `Request` de Express **no tiene** una propiedad `userId` por defecto. Para poder hacer `req.userId = id` sin error de TypeScript, se **amplía** el tipo usando `declare global` + `namespace Express`. Esto "funde" nuestra declaración con la de Express (no se toca `node_modules`).

> **Nota:** Esto es solo tipado. No agrega lógica en tiempo de ejecución — solo le dice a TypeScript que `req.userId` es válido.

### 2. Verificación de la clave secreta (fail fast)

```ts
const secret = process.env.JWT_SECRET;
if (!secret) {
    throw new Error('JWT_SECRET no está definido en el entorno');
}
```

Si `JWT_SECRET` no está en el `.env`, se lanza un error para **detener la app** en vez de usar una clave débil de respaldo. Esto es el principio **fail fast**: fallar rápido y claro ante una configuración incorrecta.

### 3. Lectura del header

```ts
const tokenFront = req.headers.authorization;
if (!tokenFront) {
    return res.status(401).json({ message: 'No autorizado' });
}
```

Se lee el header `Authorization`. Si no viene, se responde **401** (no autorizado).

### 4. Extracción del token

```ts
const token = tokenFront.split(" ")[1];
if (!token) {
    return res.status(401).json({ message: 'No autorizado' });
}
```

El header viene como `"Bearer <token>"`. Con `split(" ")` se divide en `["Bearer", "<token>"]`, y `[1]` toma el token. Si no existe, se responde 401.

### 5. Verificación del token

```ts
const decoded = jwt.verify(token, secret);
if (typeof decoded === 'string' || !('id' in decoded)) {
    return res.status(401).json({ message: 'No autorizado' });
}
const id = decoded.id;
```

`jwt.verify` comprueba la **firma** y la **expiración**. Devuelve el payload (el `{ id, role }` que se firmó en el login).

Se verifica en tiempo de ejecución que `decoded` **no sea un string** y que **tenga la propiedad `id`** (type narrowing). Esto es más seguro que forzar el tipo con `as`, porque comprueba el dato real.

### 6. Exponer el id y continuar

```ts
req.userId = id;
next();
```

Se guarda el id en `req.userId` (para que el controlador lo lea) y se llama `next()` para pasar el control al controlador.

## ¿Por qué `req.userId` funciona en el controlador sin importar el middleware?

Porque **Express pasa el mismo objeto `req`** por toda la cadena:

```
[Middleware]  req.userId = id  →  next()
[Controller]  lee req.userId (ya está puesto)
```

El controlador **no importa** el middleware. Solo **lee** `req.userId`, que el middleware ya dejó listo. Es como una mochila que viaja: el middleware le agrega la identificación, y el controlador la lee al abrir la misma mochila.

## Código completo

```ts
import type { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

export const verifyTokenToRegisterBusiness = async (req: Request, res: Response, next: NextFunction) => {
    const secret = process.env.JWT_SECRET;
    const tokenFront = req.headers.authorization;

    if (!secret) {
        throw new Error('JWT_SECRET no está definido en el entorno');
    }
    if (!tokenFront) {
        return res.status(401).json({ message: 'No autorizado' });
    }

    const token = tokenFront.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: 'No autorizado' });
    }

    const decoded = jwt.verify(token, secret);
    if (typeof decoded === 'string' || !('id' in decoded)) {
        return res.status(401).json({ message: 'No autorizado' });
    }

    const id = decoded.id;
    req.userId = id;
    next();
};
```

## Requisitos

- Tener `JWT_SECRET` definido en el archivo `.env` del backend.
- El frontend debe enviar el token en el header `Authorization: Bearer <token>`.
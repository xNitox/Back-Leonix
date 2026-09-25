# Flujo de Autenticación y Autorización

## Ubicación del código

- **Backend:** `Back-Leonix/src/controllers/authControllers.ts` (login)
- **Backend:** `Back-Leonix/src/middleware/verifyToken.ts` (verificación de token)
- **Frontend:** `Front-Leonix/src/services/auth.services.ts` (login API)
- **Frontend:** `Front-Leonix/src/services/useAuth.ts` (hook de login)

---

## 1. Flujo de Login (Dueño)

El flujo completo cuando un dueño inicia sesión con **correo y contraseña**:

```
1. Usuario se loguea (frontend)
        ↓
2. Frontend consulta al backend (POST /api/auth/login)
        ↓
3. Backend consulta a Supabase (verifica credenciales)
        ↓
4. Backend busca el comercio del dueño (por owner_id)
        ↓
5. Backend responde al frontend (role, commerce_id, token)
        ↓
6. Frontend decide a dónde redirigir según la respuesta
```

### Paso a paso en el backend (`authControllers.ts`)

1. **Recibe** `user`, `password`, `rutCommerce` del body.
2. **Valida** que `user` y `password` no estén vacíos.
3. **Verifica** que `JWT_SECRET` exista (fail fast).
4. **Detecta** si es un dueño (el `user` contiene `@` → es email).
5. **Consulta** a Supabase: `signInWithPassword({ email, password })`.
6. Si las credenciales son incorrectas → responde **401**.
7. **Busca el comercio** del dueño:
   ```ts
   .from('commerce')
   .select('id')
   .eq('owner_id', data.user.id)   // ← busca por owner_id (no por id)
   .single();
   ```
8. **Firma el token** con `jwt.sign(payloadAdmin, secret, { expiresIn: '12h' })`.
   - `payloadAdmin = { id: data.user.id, role: 'owner' }`.
9. **Responde** al frontend:
   ```ts
   {
     id: data.user.id,
     role: 'owner',
     token: token,            // ← JWT del backend (HS256)
     user: data.user,
     commerce_id: commerce?.id  // ← null si el dueño NO tiene comercio
   }
   ```

### Paso a paso en el frontend (`useAuth.ts`)

1. Llama a `loginApi(user, password, rutCommerce)`.
2. Recibe la respuesta del backend.
3. Según `data.role`:
   - **`owner`** → decide a dónde ir según `commerce_id`.
   - **`cashier`** → va al panel de cajero.

---

## 2. Regla de negocio: Dueño sin comercio

### Requerimiento

- Si el dueño **NO tiene** un comercio registrado → debe ir a `/registrar-comercio` **forzosamente**.
- Si el dueño **SÍ tiene** un comercio → **no puede ver** `/registrar-comercio`.

### ¿Cómo sabe el frontend si el dueño tiene comercio?

El backend devuelve `commerce_id` en la respuesta del login:

- `commerce_id` **existe** → el dueño tiene comercio → ir al dashboard.
- `commerce_id` es **`null`** → el dueño no tiene comercio → ir a `/registrar-comercio`.

### Los dos momentos de control

#### Momento 1: Al loguearse (redirección)

```
Login → backend responde commerce_id → frontend redirige
  - Si commerce_id existe → /admin-dashboard
  - Si commerce_id es null → /registrar-comercio
```

#### Momento 2: Al navegar (guard de rutas)

```
Usuario escribe /admin-dashboard manualmente
  → guard verifica si tiene comercio
  → si no tiene → redirige a /registrar-comercio
```

---

## 3. Seguridad: Frontend vs Backend

### La regla de oro

> **El frontend NO es seguro.** La seguridad real está en el backend.

| Capa | Función | ¿Se puede saltar? |
|------|---------|-------------------|
| **Frontend** (redirección) | Buena experiencia de usuario (UX) | Sí (modificando localStorage) |
| **Backend** (verificación) | Seguridad real | No |

### La analogía

- **Frontend** = el letrero que te guía a la entrada correcta (UX).
- **Backend** = el guardia que verifica tu pase antes de dejarte entrar (seguridad).

El letrero puede engañarse, pero el guardia no.

### Conclusión

- La **redirección en el frontend** es para UX (que el usuario vaya al lugar correcto).
- La **verificación en el backend** es para seguridad (que nadie acceda sin permiso).

Para un SaaS serio, se necesitan **ambas capas**.

---

## 4. Los dos tokens (importante)

En el login, hay **dos tokens** distintos:

| Token | ¿Quién lo firma? | Algoritmo | ¿Para qué? |
|-------|------------------|-----------|------------|
| `data.token` | El backend (`jwt.sign`) | HS256 | Verificar al usuario en el middleware |
| `data.session.access_token` | Supabase | ES256 | Hablar con Supabase (NO se devuelve al front) |

### Regla

- El frontend guarda **`data.token`** (el JWT del backend) en `localStorage`.
- El frontend **NO** necesita el token de Supabase (todo pasa por el backend).
- El middleware `verifyToken` verifica `data.token` con `jwt.verify`.

---

## 5. Resumen del flujo completo

```
[Frontend] Login
    ↓ POST /api/auth/login
[Backend] authControllers
    ↓ signInWithPassword
[Supabase] verifica credenciales
    ↓ devuelve data.user
[Backend] busca commerce por owner_id
    ↓ firma token (jwt.sign)
[Backend] responde { role, token, commerce_id }
    ↓
[Frontend] decide a dónde ir según commerce_id
    ↓
[Frontend] navega a /admin-dashboard o /registrar-comercio
```

## Requisitos

- `JWT_SECRET` definido en el `.env` del backend.
- El frontend envía el token en el header `Authorization: Bearer <token>`.
- El middleware `verifyToken` se aplica a las rutas protegidas.
La logica que envuelve Routes de Leonix.tsx

1. ¿Hay token en localStorage?
   ├── NO → navigate('/login')   ← no hay sesión
   └── SÍ → verificar con el backend
              ├── válido → mostrar las rutas (children)
              └── inválido → navigate('/login')
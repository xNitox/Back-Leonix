# Registro del sistema

## Registro del owner
- Estado: registro creado
- Relevante para: login y creación del negocio/owner
- Archivo principal del backend: [Back/src/controllers/authControllers.ts](../src/controllers/authControllers.ts)
- Archivo relacionado: [Back/src/controllers/createStaffController.ts](../src/controllers/createStaffController.ts)

## Registro del staff
- Estado: registro para staff creado
- Relevante para: creación de personal asociado a un comercio
- Archivo principal del backend: [Back/src/controllers/createStaffController.ts](../src/controllers/createStaffController.ts)
- Ruta del backend: [Back/src/routes/createStaff.route.ts](../src/routes/createStaff.route.ts)

## Crear la interfaz para registrar el comercio desde el owner 
-Listo
##  Agregar al formulario de registro de comercio el code_cashier LISTO
- Listo
## Encriptar codigos de cajero con bcrypt
-Listo
## editar el loguin para que pueda loguear el staff con rut comercio,codigo 3 digitos , pin 4 digitos, rut comercio
-Listo
## Próximo paso
#### En progreso
## Buscador de productos en tabla maestra /Agregar inventario
-Agregar busqueda y respuesta del backend hacia el front
-
-Implementar usar la tabla global productos y iventory_commerce , flujo:
    A[Escanear Código de Barras] --> B{¿Existe en global_products?}
    B -- SÍ ✅ --> C[Retornar datos al Front e Iniciar venta/inventario]
    B -- NO ❌ --> D{Ingresar Manualmente}
    --> G[Retornar formulario vacío para creación manual]
    D -- SÍ ✅ --> E[Guardar en global_products automáticamente]
    E --> F[Retornar datos sugeridos al Front para confirmar]
global_products (tabla maestra)     commerce_inventory (inventario por comercio)
├── barcode (único)                 ├── commerce_id
├── name                            ├── product_global_id → global_products.id
├── category                        ├── current_stock
└── img_url                         ├── price_sell
                                    └── purchase_cost

 Frontend llama UNA vez → el backend decide todo
  → Devuelve un resultado estructurado:
    { estado: "en-inventario" | "en-maestra" | "no-existe", datos: {...} }                                   

    
## Buscador de productos en inventario
-Implementar Ruta para el cajero
-implementar la persistencia del rut del comercio
-al registrar el comercio debe enviarse limpio sin puntos y guion.
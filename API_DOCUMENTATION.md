# 📚 Documentación de APIs - Sistema UDID

## 🎯 **Resumen del Sistema**

Sistema de gestión de UDIDs (Unique Device Identifier) que proporciona:
- **Autenticación JWT** con refresh automático
- **Gestión de suscriptores** con paginación
- **Asociación/Desasociación** de UDIDs
- **Validación** de operadores
- **API REST** con autenticación Bearer

---

## 🔧 **Configuración Base**

### **URL Base de la API**
```
https://tu-api-backend.com/api
```

### **Headers Requeridos**
```
Content-Type: application/json
Authorization: Bearer {access_token}  # Para endpoints protegidos
```

### **Timeout y Configuración**
```
Timeout: 30 segundos
Método de autenticación: JWT Bearer Token
Refresh automático: Sí
```

---

## 🏗️ **Arquitectura de la API**

### **📋 Endpoints Principales**
```
AUTENTICACIÓN:
├── POST /auth/login/          # Login de usuario
├── POST /auth/register/       # Registro de usuario
├── POST /auth/logout/         # Logout de usuario
└── POST /auth/refresh/        # Refresh de token

DATOS:
├── GET  /subscriberinfo/      # Lista de suscriptores (paginada)
├── POST /validate-and-associate-udid/  # Asociar UDID
└── POST /disassociate-udid/    # Desasociar UDID
```

---

## 🔐 **APIs de Autenticación**

### **1. Login de Usuario**
```
POST /auth/login/
```

**📋 Request Body:**
```json
{
  "username": "usuario",
  "password": "contraseña"
}
```

**📤 Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**📋 Códigos de Error:**
- `400`: Credenciales inválidas
- `401`: Usuario no encontrado
- `500`: Error interno del servidor

### **2. Registro de Usuario**
```
POST /auth/register/
```

**📋 Request Body:**
```json
{
  "username": "usuario",
  "email": "usuario@email.com",
  "password": "contraseña",
  "operador": "OPERADOR123",
  "first_name": "Juan",
  "last_name": "Pérez"
  "documento": 12345,
}
```

**📤 Response (201 Created):**
```json
{
  "message": "Usuario registrado exitosamente",
  "user_id": 123
}
```

**📋 Validaciones del Backend:**
- `username`: Único, mínimo 3 caracteres
- `password`: Mínimo 6 caracteres
- `email`: Formato válido, único
- `operador`: Código válido en sistema
- `documento`: Número único
- `first_name`, `last_name`: Obligatorios

### **3. Logout de Usuario**
```
POST /auth/logout/
```

**📋 Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**📤 Response (200 OK):**
```json
{
  "message": "Logout exitoso"
}
```

### **4. Refresh Token**
```
POST /auth/refresh/
```

**📋 Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**📤 Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**📋 Comportamiento:**
- El `access` token expira (típicamente 15-30 minutos)
- El `refresh` token tiene mayor duración (7-30 días)
- Cuando el `access` expira, usar `refresh` para obtener uno nuevo
- Si `refresh` expira, el usuario debe hacer login nuevamente

---

## 📊 **APIs de Datos**

### **1. Obtener Lista de Suscriptores**
```
GET /subscriberinfo/?page={page}
```

**📋 Headers Requeridos:**
```
Authorization: Bearer {access_token}
```

**📋 Query Parameters:**
- `page` (integer): Número de página (default: 1)
- `limit` (integer, opcional): Elementos por página (default: 20)

**📤 Response (200 OK):**
```json
{
  "count": 2000,
  "current_page": 1,
  "total_pages": 100,
  "results": [
    {
      "subscriber_code": "SUB001",
      "first_name": "Juan",
      "last_name": "Pérez",
      "sn": "SN123456789",
      "activated": true,
      "udid": "abc123def456ghi789",
      "udid_status": "active",
      "packageNames": ["Package A", "Package B"],
      "products": ["Product 1", "Product 2"],
      "app_type": "iOS",
      "app_version": "1.0.0",
      "lastActivation": "2024-01-15T10:30:00Z",
      "validated_by_operator": "OPERADOR123"
    }
  ]
}
```

**📋 Códigos de Error:**
- `401`: Token expirado o inválido
- `403`: Sin permisos para acceder
- `500`: Error interno del servidor

### **2. Asociar UDID a Suscriptor**
```
POST /validate-and-associate-udid/
```

**📋 Headers Requeridos:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**📋 Request Body:**
```json
{
  "subscriber_code": "SUB001",
  "udid": "abc123def456ghi789",
  "sn": "SN123456789",
  "operator_id": "OPERADOR123",
  "method": "manual"
}
```

**📤 Response (200 OK):**
```json
{
  "message": "UDID asociado exitosamente",
  "udid": "abc123def456ghi789",
  "subscriber_code": "SUB001",
  "status": "active"
}
```

**📋 Validaciones del Backend:**
- `subscriber_code`: Debe existir en el sistema
- `udid`: Formato válido, único en el sistema
- `sn`: Debe coincidir con el suscriptor
- `operator_id`: Debe ser válido y tener permisos
- `method`: Solo acepta "manual" o "automatic"

**📋 Códigos de Error:**
- `400`: Datos inválidos o UDID ya existe
- `401`: Token expirado
- `403`: Operador sin permisos
- `404`: Suscriptor no encontrado
- `409`: UDID ya asociado a otro suscriptor

### **3. Desasociar UDID**
```
POST /disassociate-udid/
```

**📋 Headers Requeridos:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**📋 Request Body:**
```json
{
  "udid": "abc123def456ghi789",
  "operador": "OPERADOR123"
}
```

**📤 Response (200 OK):**
```json
{
  "message": "UDID desasociado exitosamente",
  "udid": "abc123def456ghi789",
  "status": "disassociated"
}
```

**📋 Validaciones del Backend:**
- `udid`: Debe existir y estar asociado
- `operador`: Debe tener permisos para desasociar
- Verificar que el UDID pertenece al operador

**📋 Códigos de Error:**
- `400`: UDID no encontrado o ya desasociado
- `401`: Token expirado
- `403`: Operador sin permisos
- `404`: UDID no existe en el sistema

---

## ⚙️ **Manejo de Autenticación**

### **Flujo de Autenticación JWT**
```
1. CLIENTE → POST /auth/login/ → SERVIDOR
2. SERVIDOR → Valida credenciales → CLIENTE
3. SERVIDOR → Genera access + refresh tokens → CLIENTE
4. CLIENTE → Almacena tokens localmente
5. CLIENTE → Incluye Bearer token en requests protegidos
6. SERVIDOR → Valida token en cada request
7. Si token expira → CLIENTE usa refresh token
8. Si refresh expira → CLIENTE debe hacer login nuevamente
```

### **Headers de Autenticación**
```
# Para endpoints protegidos
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...

# Para endpoints públicos (login, register, refresh)
# No requiere Authorization header
```

### **Manejo de Errores de Autenticación**
```
401 Unauthorized:
- Token expirado o inválido
- Usuario no autenticado
- Solución: Usar refresh token o hacer login

403 Forbidden:
- Token válido pero sin permisos
- Operador sin autorización
- Solución: Verificar permisos del usuario

400 Bad Request:
- Datos de request inválidos
- Validaciones fallidas
- Solución: Revisar formato de datos enviados
```

---

## 🔄 **Flujo de Datos**

### **1. Flujo de Login**
```
CLIENTE                    SERVIDOR
   |                          |
   |-- POST /auth/login/ ---->|
   |   {username, password}   |
   |                          |-- Validar credenciales
   |                          |-- Generar JWT tokens
   |<-- {access, refresh} ----|
   |                          |
   |-- Almacenar tokens       |
   |-- Redirigir a dashboard  |
```

### **2. Flujo de Obtener Suscriptores**
```
CLIENTE                    SERVIDOR
   |                          |
   |-- GET /subscriberinfo/ ->|
   |   Authorization: Bearer  |
   |                          |-- Validar token
   |                          |-- Consultar base de datos
   |                          |-- Aplicar paginación
   |<-- {count, results, ...} |
   |                          |
   |-- Mostrar datos          |
```

### **3. Flujo de Asociar UDID**
```
CLIENTE                    SERVIDOR
   |                          |
   |-- POST /validate-and- -->|
   |   associate-udid/        |
   |   Authorization: Bearer  |
   |   {subscriber_code,     |
   |    udid, sn, operator_id}|
   |                          |-- Validar token
   |                          |-- Validar datos
   |                          |-- Verificar permisos
   |                          |-- Asociar UDID
   |<-- {message, status} ---|
   |                          |
   |-- Mostrar confirmación   |
```

### **4. Flujo de Refresh Token**
```
CLIENTE                    SERVIDOR
   |                          |
   |-- POST /auth/refresh/ -->|
   |   {refresh_token}        |
   |                          |-- Validar refresh token
   |                          |-- Generar nuevo access
   |<-- {new_access_token} --|
   |                          |
   |-- Actualizar token       |
   |-- Reintentar request     |
```

---

## 📊 **Estructura de Datos**

### **Modelo de Suscriptor**
```json
{
  "subscriber_code": "string",      // Código único del suscriptor
  "first_name": "string",           // Nombre
  "last_name": "string",            // Apellido
  "sn": "string",                   // Número de serie
  "activated": "boolean",           // Estado de activación
  "udid": "string",                 // UDID asociado (si existe)
  "udid_status": "string",          // Estado del UDID (active/pending/inactive)
  "packageNames": ["string"],       // Nombres de paquetes
  "products": ["string"],            // Productos asociados
  "app_type": "string",             // Tipo de aplicación (iOS/Android)
  "app_version": "string",          // Versión de la aplicación
  "lastActivation": "datetime",     // Última activación
  "validated_by_operator": "string" // Operador que validó
}
```

### **Modelo de Usuario**
```json
{
  "username": "string",             // Nombre de usuario único
  "email": "string",                // Email único
  "operador": "string",             // Código de operador
  "documento": "integer",           // Número de legajo
  "first_name": "string",           // Nombre
  "last_name": "string",            // Apellido
  "is_active": "boolean",           // Estado del usuario
  "date_joined": "datetime",        // Fecha de registro
  "last_login": "datetime"          // Último login
}
```

### **Modelo de UDID**
```json
{
  "udid": "string",                 // Identificador único del dispositivo
  "subscriber_code": "string",      // Código del suscriptor asociado
  "operator_id": "string",         // ID del operador
  "status": "string",               // Estado (active/pending/inactive)
  "method": "string",               // Método de asociación (manual/automatic)
  "created_at": "datetime",         // Fecha de creación
  "updated_at": "datetime"          // Fecha de última actualización
}
```

---

## 🛡️ **Seguridad y Validaciones**

### **Validaciones del Backend**
```
AUTENTICACIÓN:
- Username único en el sistema
- Password mínimo 6 caracteres
- Email formato válido y único
- Operador debe existir en sistema

UDID:
- Formato válido (alfanumérico)
- Único en el sistema
- Longitud mínima 8 caracteres
- Conversión automática a minúsculas

SUSCRIPTOR:
- subscriber_code debe existir
- sn debe coincidir con suscriptor
- operator_id debe tener permisos
```

### **Permisos por Operador**
```
OPERADOR_ADMIN:
- Ver todos los suscriptores
- Asociar/desasociar cualquier UDID
- Gestionar otros operadores

OPERADOR_STANDARD:
- Ver suscriptores de su operador
- Asociar/desasociar UDIDs de su operador
- No puede gestionar otros operadores

OPERADOR_READONLY:
- Solo lectura de datos
- No puede modificar UDIDs
```

---

## 📱 **Implementación Multi-Lenguaje**

### **JavaScript/TypeScript**
```javascript
// Ejemplo con fetch API
const response = await fetch('/api/subscriberinfo/?page=1', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```

### **Swift (iOS)**
```swift
// Ejemplo con URLSession
let url = URL(string: "https://api.example.com/subscriberinfo/?page=1")!
var request = URLRequest(url: url)
request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")

URLSession.shared.dataTask(with: request) { data, response, error in
    // Manejar respuesta
}.resume()
```

### **Java (Android)**
```java
// Ejemplo con OkHttp
OkHttpClient client = new OkHttpClient();
Request request = new Request.Builder()
    .url("https://api.example.com/subscriberinfo/?page=1")
    .addHeader("Authorization", "Bearer " + accessToken)
    .build();

client.newCall(request).enqueue(new Callback() {
    @Override
    public void onResponse(Call call, Response response) {
        // Manejar respuesta
    }
});
```

### **C# (.NET)**
```csharp
// Ejemplo con HttpClient
using var client = new HttpClient();
client.DefaultRequestHeaders.Authorization = 
    new AuthenticationHeaderValue("Bearer", accessToken);

var response = await client.GetAsync("/api/subscriberinfo/?page=1");
var content = await response.Content.ReadAsStringAsync();
```

### **Python**
```python
# Ejemplo con requests
import requests

headers = {
    'Authorization': f'Bearer {access_token}',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://api.example.com/subscriberinfo/?page=1',
    headers=headers
)
data = response.json()
```

---

## 🚀 **Resumen de Endpoints**

| Método | Endpoint | Autenticación | Descripción |
|--------|----------|---------------|-------------|
| `POST` | `/auth/login/` | ❌ No | Login de usuario |
| `POST` | `/auth/register/` | ❌ No | Registro de usuario |
| `POST` | `/auth/logout/` | ❌ No | Logout de usuario |
| `POST` | `/auth/refresh/` | ❌ No | Refresh de token |
| `GET` | `/subscriberinfo/` | ✅ Sí | Lista de suscriptores |
| `POST` | `/validate-and-associate-udid/` | ✅ Sí | Asociar UDID |
| `POST` | `/disassociate-udid/` | ✅ Sí | Desasociar UDID |

---

## 🔧 **Características Técnicas del Sistema**

### **✅ Funcionalidades del Backend**
- ✅ **Autenticación JWT** con access y refresh tokens
- ✅ **Paginación** automática de resultados
- ✅ **Validación** de datos en servidor
- ✅ **Conversión automática** de UDID a minúsculas
- ✅ **Manejo de errores** estructurado
- ✅ **Permisos por operador** (admin/standard/readonly)
- ✅ **Logs de auditoría** para cambios
- ✅ **Rate limiting** para prevenir abuso

### **🎯 Puntos Clave para Implementación**
1. **Configurar JWT** con expiración adecuada
2. **Implementar validaciones** del lado servidor
3. **Manejar permisos** por tipo de operador
4. **Configurar paginación** eficiente
5. **Implementar logs** de auditoría
6. **Validar formato** de UDID
7. **Manejar errores** de manera consistente

---

## 📋 **Checklist de Implementación**

### **Backend (Servidor)**
- [ ] Configurar JWT con access/refresh tokens
- [ ] Implementar endpoints de autenticación
- [ ] Crear endpoints de gestión de suscriptores
- [ ] Implementar validaciones de datos
- [ ] Configurar permisos por operador
- [ ] Implementar paginación
- [ ] Configurar logs de auditoría
- [ ] Implementar rate limiting

### **Frontend (Cliente)**
- [ ] Implementar almacenamiento de tokens
- [ ] Configurar interceptores de autenticación
- [ ] Manejar refresh automático de tokens
- [ ] Implementar manejo de errores
- [ ] Configurar estados de carga
- [ ] Implementar validaciones de formulario
- [ ] Configurar notificaciones de usuario

---

## 🎯 **Casos de Uso Principales**

### **1. Login de Usuario**
```
Usuario ingresa credenciales → 
Sistema valida → 
Genera tokens → 
Cliente almacena tokens → 
Redirige a dashboard
```

### **2. Ver Lista de Suscriptores**
```
Cliente solicita datos → 
Sistema valida token → 
Consulta base de datos → 
Aplica paginación → 
Retorna datos paginados
```

### **3. Asociar UDID**
```
Usuario ingresa UDID → 
Sistema valida datos → 
Verifica permisos → 
Asocia UDID → 
Actualiza base de datos → 
Retorna confirmación
```

### **4. Desasociar UDID**
```
Usuario selecciona UDID → 
Sistema valida permisos → 
Desasocia UDID → 
Actualiza base de datos → 
Retorna confirmación
```

---

## 🔍 **Debugging y Troubleshooting**

### **Errores Comunes**
```
401 Unauthorized:
- Token expirado → Usar refresh token
- Token inválido → Hacer login nuevamente
- Usuario no autenticado → Verificar credenciales

403 Forbidden:
- Sin permisos → Verificar rol de operador
- Operador incorrecto → Verificar operator_id

400 Bad Request:
- Datos inválidos → Revisar formato de request
- Validaciones fallidas → Verificar campos requeridos

409 Conflict:
- UDID ya existe → Verificar unicidad
- Suscriptor ya asociado → Verificar estado actual
```

### **Logs de Debug**
```
# Para desarrollo
- Habilitar logs detallados de requests
- Registrar headers de autenticación
- Logear validaciones de datos
- Registrar tiempos de respuesta
```

---

## 📞 **Soporte y Mantenimiento**

### **Para Implementar en Otro Proyecto:**
1. **Configurar backend** con endpoints documentados
2. **Implementar autenticación JWT** 
3. **Configurar base de datos** con modelos especificados
4. **Implementar validaciones** del lado servidor
5. **Configurar permisos** por operador
6. **Implementar cliente** en el lenguaje deseado
7. **Configurar manejo de errores** y notificaciones

### **Consideraciones de Seguridad:**
- **HTTPS obligatorio** en producción
- **Tokens con expiración** adecuada
- **Validación de entrada** en servidor
- **Logs de auditoría** para cambios
- **Rate limiting** para prevenir abuso
- **Permisos granulares** por operador

¡El sistema está documentado para implementación en cualquier tecnología! 🚀

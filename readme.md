# Rimac Appointments – Backend Serverless (Reto Técnico)

Este proyecto implementa un backend **100% serverless** en AWS para la gestión de agendamientos de citas.  
Fue desarrollado como parte de un reto técnico de Rimac, aplicando buenas prácticas de arquitectura limpia, desacoplada, event-driven y multi–base de datos.

---

## 1. Arquitectura General – Flujo Principal

### **POST /appointments**
- Inserta una cita en DynamoDB con estado `pending`.
- Publica un evento en SNS con el campo `countryISO`.
- SNS enruta el evento a la cola correspondiente mediante filtros:
  - `SqsPe` para **Perú**
  - `SqsCl` para **Chile**

### **Procesamiento por país**
- Cada SQS activa una Lambda específica:
  - **appointmentPe** → inserta en MySQL (`mysql_pe`)
  - **appointmentCl** → inserta en MySQL (`mysql_cl`)
- Cada Lambda emite un evento en EventBridge informando que la cita fue procesada.

### **Callback**
- EventBridge envía el evento a `CallbackQueue`.
- La Lambda `appointmentCallback` actualiza la cita a `completed` en DynamoDB.

### **GET /appointments/{insuredId}**
- Devuelve todas las citas del asegurado usando DynamoDB.

---

## 2. Arquitectura Serverless (Diagrama)

```mermaid
flowchart TD

A[API Gateway HTTP API] --> B[Lambda: appointmentHttp]
B --> C[DynamoDB: pending]
B --> D[SNS Topic]

D --> E[SQS PE Queue]
D --> F[SQS CL Queue]

E --> G[Lambda: appointmentPe]
F --> H[Lambda: appointmentCl]

G --> I[(MySQL Schema: mysql_pe)]
H --> J[(MySQL Schema: mysql_cl)]

G --> K[EventBridge Event]
H --> K

K --> L[CallbackQueue (SQS)]
L --> M[Lambda: appointmentCallback]
M --> N[DynamoDB: completed]
```

---

## 3. Bases de Datos

Se usa **una sola instancia RDS MySQL**, pero con dos bases internas:

| País | Base de datos | Tabla |
|------|---------------|--------|
| Perú | `mysql_pe`    | `appointments` |
| Chile | `mysql_cl`   | `appointments` |

---

## 4. Tecnologías Utilizadas

- AWS Lambda (Node.js 20)
- API Gateway HTTP API
- DynamoDB (On-Demand)
- SNS con filtros por atributo
- SQS por país (PE / CL)
- EventBridge
- RDS MySQL multi-schema
- AWS SSM Parameter Store
- Serverless Framework + esbuild
- Node.js + TypeScript
- Arquitectura Limpia

---

## 5. Estructura del Proyecto

```bash
rimac-appointments/
├── src/
│   ├── domain/
│   │   └── entities/
│   ├── application/
│   ├── infrastructure/
│   │   ├── aws/
│   │   │   ├── dynamodb/
│   │   │   ├── rds/
│   │   │   ├── eventbridge/
│   │   │   └── config/
│   └── interfaces/
│       ├── lambdas/
│       └── http/
├── serverless.yml
└── README.md
```

---

## 6. Parámetros en AWS SSM Parameter Store

Los parámetros de conexión de las bases MySQL se almacenan como **SecureString**.

### Parámetros – Perú (PE)
```
/rimac/db/pe/host
/rimac/db/pe/user
/rimac/db/pe/password
/rimac/db/pe/name  -> mysql_pe
```

### Parámetros – Chile (CL)
```
/rimac/db/cl/host
/rimac/db/cl/user
/rimac/db/cl/password
/rimac/db/cl/name  -> mysql_cl
```

### Comandos para crearlos
```bash
aws ssm put-parameter --name /rimac/db/pe/name --value "mysql_pe" --type SecureString --overwrite
aws ssm put-parameter --name /rimac/db/cl/name --value "mysql_cl" --type SecureString --overwrite
```

---

## 7. Cómo Ejecutar Localmente

```bash
npm install
npm run build
npm test
```

---

## 8. Deploy

```bash
npx serverless deploy --stage dev
```

---

## 9. Testing Manual

### Crear cita (PE)
```json
POST /appointments
{
  "insuredId": "PE001",
  "scheduleId": 1,
  "countryISO": "PE"
}
```

### Crear cita (CL)
```json
POST /appointments
{
  "insuredId": "CL001",
  "scheduleId": 1,
  "countryISO": "CL"
}
```

### Consultar citas
```
GET /appointments/PE001
GET /appointments/CL001
```

---

## 10. Buenas Prácticas Aplicadas

- Arquitectura Clean / hexagonal
- Separación de responsabilidades por capa
- Diseño event-driven
- SQS como mecanismo de resiliencia
- RDS multi-schema para aislar países
- Secrets almacenados en SSM
- Lambdas pequeñas y orientadas a un único propósito
- Uso de Node.js + TypeScript + Serverless Framework

---

## 11. Mejoras Futuras

- Añadir DLQs por cada SQS
- Trazabilidad con AWS X-Ray
- CI/CD con GitHub Actions
- Autenticación/API-Key
- Tests de integración con LocalStack

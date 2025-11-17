🚀 Rimac Appointments – Backend Serverless (Reto Técnico)

Este proyecto implementa un backend 100% serverless en AWS para la gestión de agendamientos de citas.
Fue desarrollado como respuesta a un reto técnico de Rimac, aplicando buenas prácticas de arquitectura limpia, desacoplada, event-driven y multi–base de datos.

🧩 Arquitectura General
👉 Flujo principal

POST /appointments

Crea una cita en DynamoDB con estado pending.

Publica un evento en SNS con el campo countryISO.

SNS enruta el evento a la cola correcta mediante filtros:

SqsPe para Perú

SqsCl para Chile

Procesamiento por país

Cada SQS dispara una Lambda distinta:

appointmentPe → inserta en MySQL (mysql_pe)

appointmentCl → inserta en MySQL (mysql_cl)

Cada Lambda publica un evento en EventBridge indicando que la cita fue procesada.

Callback

EventBridge redirige el evento a CallbackQueue.

La Lambda appointmentCallback actualiza la cita a completed en DynamoDB.

GET /appointments/{insuredId}

Retorna todas las citas de un asegurado, leyendo desde DynamoDB.

🏗️ Arquitectura Serverless
API Gateway HTTP API
        │
        ▼
Lambda (appointmentHttp)
        │
        ├── DynamoDB (pending)
        └── SNS Topic ─────────────┐
                                   │
                    ┌──────────────┴───────────────┐
                    ▼                              ▼
              SQS PE Queue                  SQS CL Queue
                    │                              │
                    ▼                              ▼
        Lambda appointmentPe        Lambda appointmentCl
                    │                              │
    MySQL (DB: mysql_pe)           MySQL (DB: mysql_cl)
                    │                              │
                    └───────────────┬──────────────┘
                                    ▼
                           EventBridge Rule
                                    ▼
                               CallbackQueue
                                    ▼
                       Lambda appointmentCallback
                                    ▼
                         DynamoDB (completed)

🗄️ Bases de Datos

Este proyecto utiliza una sola instancia RDS MySQL, pero con dos bases internas (esquemas), una por país:

País	Base de datos	Tabla
Perú	mysql_pe	appointments
Chile	mysql_cl	appointments

Se separan los datos por país sin duplicar infraestructura innecesaria.

🧱 Tecnologías Utilizadas

AWS Lambda (Node.js 20)

API Gateway HTTP API

DynamoDB (On-Demand)

SNS → SQS con filtro por país

EventBridge (Callback)

RDS MySQL (instancia única, multi-schema)

AWS Systems Manager Parameter Store

Serverless Framework (v3) + esbuild

Node.js + TypeScript

Arquitectura Limpia (Domain → Application → Infrastructure → Interface)

📁 Estructura del Proyecto
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

🔐 Parámetros en AWS Systems Manager (SSM)

Para evitar credenciales hardcodeadas y permitir rotación segura, este proyecto utiliza SecureString Parameters en AWS SSM.

Debes crear los siguientes:

🇵🇪 Perú
Nombre	Ejemplo de Valor
/rimac/db/pe/host	<RDS_ENDPOINT>
/rimac/db/pe/user	rimac_user
/rimac/db/pe/password	******
/rimac/db/pe/name	mysql_pe
🇨🇱 Chile
Nombre	Ejemplo de Valor
/rimac/db/cl/host	<RDS_ENDPOINT>
/rimac/db/cl/user	rimac_user
/rimac/db/cl/password	******
/rimac/db/cl/name	mysql_cl
Comandos para crearlos
# PE
aws ssm put-parameter --name /rimac/db/pe/host --value "<RDS_ENDPOINT>" --type SecureString --overwrite
aws ssm put-parameter --name /rimac/db/pe/user --value "rimac_user" --type SecureString --overwrite
aws ssm put-parameter --name /rimac/db/pe/password --value "<PASSWORD>" --type SecureString --overwrite
aws ssm put-parameter --name /rimac/db/pe/name --value "mysql_pe" --type SecureString --overwrite

# CL
aws ssm put-parameter --name /rimac/db/cl/host --value "<RDS_ENDPOINT>" --type SecureString --overwrite
aws ssm put-parameter --name /rimac/db/cl/user --value "rimac_user" --type SecureString --overwrite
aws ssm put-parameter --name /rimac/db/cl/password --value "<PASSWORD>" --type SecureString --overwrite
aws ssm put-parameter --name /rimac/db/cl/name --value "mysql_cl" --type SecureString --overwrite

🔧 Cómo ejecutar localmente

Este proyecto es serverless puro, no utiliza Express ni servidores locales.

Instalar dependencias:

npm install


Transpilar:

npm run build


Ejecutar tests:

npm test

🚀 Deploy
npx serverless deploy --stage dev


Esto crea automáticamente:

Lambdas

Colas SQS

SNS Topic

Regla EventBridge

API Gateway

Permisos IAM

Variables de entorno desde SSM

🧪 Testing Manual
Crear cita (PE)
POST /appointments
{
  "insuredId": "PE001",
  "scheduleId": 1,
  "countryISO": "PE"
}

Crear cita (CL)
POST /appointments
{
  "insuredId": "CL001",
  "scheduleId": 1,
  "countryISO": "CL"
}

Consultar citas por asegurado
GET /appointments/PE001
GET /appointments/CL001

✔️ Buenas prácticas aplicadas

Arquitectura clean y altamente desacoplada

Diseño event-driven

Uso de SNS + SQS para resiliencia y backpressure

Uso de EventBridge para callback

Base de datos separada por país

Manejo seguro de credenciales con SSM Parameter Store

DynamoDB On-Demand (bajo costo)

Lambdas pequeñas y de responsabilidad única


👤 Autor

Juan Alfaro
Senior Software Engineer / Data Engineer
GitHub: https://github.com/tu-usuario

LinkedIn: https://linkedin.com/in/tu-perfil
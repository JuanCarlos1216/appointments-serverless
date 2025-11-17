import type { APIGatewayProxyHandlerV2, SQSEvent } from 'aws-lambda';
import { DynamoAppointmentRepository } from '../../infrastructure/aws/dynamodb/DynamoAppointmentRepository';
import { SNSPublisher } from '../../infrastructure/aws/sns/SNSPublisher';
import { CreateAppointmentUseCase } from '../../application/usecases/CreateAppointment/CreateAppointmentUseCase';
import { ListAppointmentsByInsuredUseCase } from '../../application/usecases/ListAppointmentsByInsured/ListAppointmentsByInsuredUseCase';
import { CompleteAppointmentUseCase } from '../../application/usecases/CompleteAppointment/CompleteAppointmentUseCase';
import { success, failure } from '../../shared/utils/httpResponse';

const dynamoRepo = new DynamoAppointmentRepository();
const snsPublisher = new SNSPublisher();

export const http: APIGatewayProxyHandlerV2 = async (event) => {
    try {
        const method = event.requestContext.http.method;

        if (method === 'POST') {
            const body = JSON.parse(event.body ?? '{}');

            const useCase = new CreateAppointmentUseCase(dynamoRepo, snsPublisher);
            const appointment = await useCase.execute(body);

            return success(202, {
                message: 'Appointment in process',
                appointmentId: appointment.appointmentId,
            });
        }

        if (method === 'GET') {
            const insuredId = event.pathParameters?.insuredId;
            if (!insuredId) return failure(400, 'insuredId is required');

            const useCase = new ListAppointmentsByInsuredUseCase(dynamoRepo);
            const appointments = await useCase.execute({ insuredId });

            return success(200, appointments);
        }

        return failure(404, 'Not found');
    } catch (err) {
        console.error(err);
        return failure(500, 'Internal Server Error');
    }
};

export const callback = async (event: SQSEvent) => {
    const useCase = new CompleteAppointmentUseCase(dynamoRepo);

    for (const record of event.Records) {
        const body = JSON.parse(record.body);
        // body es el evento EventBridge
        const detail = body.detail as { appointmentId: string; insuredId: string };

        await useCase.execute({
            appointmentId: detail.appointmentId,
            insuredId: detail.insuredId,
        });
    }
};

import { PutCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import type {
    Appointment,
    AppointmentStatus,
} from '../../../domain/entities/Appointment';
import type { IAppointmentDDBRepository } from '../../../domain/repositories/IAppointmentDDBRepository';
import { dynamoDocClient } from '../../config/awsClients';

const TABLE_NAME = process.env.APPOINTMENTS_TABLE || 'Appointments';

export class DynamoAppointmentRepository implements IAppointmentDDBRepository {
    async savePending(appointment: Appointment): Promise<void> {
        await dynamoDocClient.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: appointment,
            }),
        );
    }

    async updateStatus(
        insuredId: string,
        appointmentId: string,
        status: AppointmentStatus,
    ): Promise<void> {
        await dynamoDocClient.send(
            new UpdateCommand({
                TableName: TABLE_NAME,
                Key: { insuredId, appointmentId },
                UpdateExpression: 'SET #s = :s, updatedAt = :u',
                ExpressionAttributeNames: { '#s': 'status' },
                ExpressionAttributeValues: {
                    ':s': status,
                    ':u': new Date().toISOString(),
                },
            }),
        );
    }

    async listByInsuredId(insuredId: string): Promise<Appointment[]> {
        const result = await dynamoDocClient.send(
            new QueryCommand({
                TableName: TABLE_NAME,
                KeyConditionExpression: 'insuredId = :id',
                ExpressionAttributeValues: {
                    ':id': insuredId,
                },
            }),
        );

        return (result.Items ?? []) as Appointment[];
    }
}

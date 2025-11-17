import type { SQSEvent } from 'aws-lambda';
import { MySQLAppointmentRepositoryPE } from '../../infrastructure/aws/rds/MySQLAppointmentRepositoryPE';
import { EventBridgePublisher } from '../../infrastructure/aws/eventbridge/EventBridgePublisher';
import type { Appointment } from '../../domain/entities/Appointment';

const rdsRepo = new MySQLAppointmentRepositoryPE();
const eventPublisher = new EventBridgePublisher();

export const main = async (event: SQSEvent) => {
    for (const record of event.Records) {
        const appointment = JSON.parse(record.body) as Appointment;

        await rdsRepo.create(appointment);
        await eventPublisher.publishAppointmentScheduled(appointment);
    }
};

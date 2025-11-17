import { PutEventsCommand } from '@aws-sdk/client-eventbridge';
import type { Appointment } from '../../../domain/entities/Appointment';
import { eventBridgeClient } from '../../config/awsClients';

export class EventBridgePublisher {
    async publishAppointmentScheduled(appointment: Appointment): Promise<void> {
        await eventBridgeClient.send(
            new PutEventsCommand({
                Entries: [
                    {
                        Source: 'appointments',
                        DetailType: 'AppointmentScheduled',
                        Detail: JSON.stringify({
                            appointmentId: appointment.appointmentId,
                            insuredId: appointment.insuredId,
                        }),
                    },
                ],
            }),
        );
    }
}

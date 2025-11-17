import { PublishCommand } from '@aws-sdk/client-sns';
import type { Appointment } from '../../../domain/entities/Appointment';
import type { IEventPublisher } from '../../../application/services/IEventPublisher';
import { snsClient } from '../../config/awsClients';

const TOPIC_ARN = process.env.SCHEDULE_TOPIC_ARN as string;

export class SNSPublisher implements IEventPublisher {
    async publishScheduleRequested(appointment: Appointment): Promise<void> {
        await snsClient.send(
            new PublishCommand({
                TopicArn: TOPIC_ARN,
                Message: JSON.stringify(appointment),
                MessageAttributes: {
                    countryISO: {
                        DataType: 'String',
                        StringValue: appointment.countryISO,
                    },
                },
            }),
        );
    }

    // no-op para publishAppointmentScheduled (lo hace EventBridge)
}

import type { Appointment } from '../../domain/entities/Appointment';

export interface IEventPublisher {
    publishScheduleRequested(appointment: Appointment): Promise<void>;
    publishAppointmentScheduled?(appointment: Appointment): Promise<void>;
}

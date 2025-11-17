import type { Appointment } from '../entities/Appointment';

export interface IAppointmentRDSRepository {
    create(appointment: Appointment): Promise<void>;
}

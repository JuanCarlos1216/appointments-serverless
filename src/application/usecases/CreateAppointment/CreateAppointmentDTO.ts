import type { CountryISO } from '../../../domain/entities/Appointment';

export interface CreateAppointmentInput {
    insuredId: string;
    scheduleId: number;
    countryISO: CountryISO;
}

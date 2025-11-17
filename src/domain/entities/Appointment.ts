export type CountryISO = 'PE' | 'CL';
export type AppointmentStatus = 'pending' | 'completed';

export interface Appointment {
  appointmentId: string;
  insuredId: string;
  scheduleId: number;
  countryISO: CountryISO;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

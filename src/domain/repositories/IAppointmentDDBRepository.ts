import type { Appointment, AppointmentStatus } from '../entities/Appointment';

export interface IAppointmentDDBRepository {
  savePending(appointment: Appointment): Promise<void>;
  updateStatus(
    insuredId: string,
    appointmentId: string,
    status: AppointmentStatus,
  ): Promise<void>;
  listByInsuredId(insuredId: string): Promise<Appointment[]>;
}

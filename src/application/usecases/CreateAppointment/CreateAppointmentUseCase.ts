import { randomUUID } from 'crypto';
import type { Appointment } from '../../../domain/entities/Appointment';
import type { IAppointmentDDBRepository } from '../../../domain/repositories/IAppointmentDDBRepository';
import type { IEventPublisher } from '../../services/IEventPublisher';
import type { CreateAppointmentInput } from './CreateAppointmentDTO';

export class CreateAppointmentUseCase {
  constructor(
    private readonly repo: IAppointmentDDBRepository,
    private readonly snsPublisher: IEventPublisher,
  ) { }

  async execute(input: CreateAppointmentInput): Promise<Appointment> {
    // validaciones simples
    if (!/^[0-9]{5}$/.test(input.insuredId)) {
      throw new Error('insuredId must be 5 digits');
    }
    if (!['PE', 'CL'].includes(input.countryISO)) {
      throw new Error('Invalid countryISO');
    }

    const now = new Date().toISOString();

    const appointment: Appointment = {
      appointmentId: randomUUID(),
      insuredId: input.insuredId,
      scheduleId: input.scheduleId,
      countryISO: input.countryISO,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    await this.repo.savePending(appointment);
    await this.snsPublisher.publishScheduleRequested(appointment);

    return appointment;
  }
}

import type { Appointment } from '../../../domain/entities/Appointment';
import type { IAppointmentDDBRepository } from '../../../domain/repositories/IAppointmentDDBRepository';

export interface ListByInsuredInput {
    insuredId: string;
}

export class ListAppointmentsByInsuredUseCase {
    constructor(private readonly repo: IAppointmentDDBRepository) { }

    async execute(input: ListByInsuredInput): Promise<Appointment[]> {
        return this.repo.listByInsuredId(input.insuredId);
    }
}

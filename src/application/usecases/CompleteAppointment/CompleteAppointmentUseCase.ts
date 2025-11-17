import type { IAppointmentDDBRepository } from '../../../domain/repositories/IAppointmentDDBRepository';

export interface CompleteAppointmentInput {
    insuredId: string;
    appointmentId: string;
}

export class CompleteAppointmentUseCase {
    constructor(private readonly repo: IAppointmentDDBRepository) { }

    async execute(input: CompleteAppointmentInput): Promise<void> {
        await this.repo.updateStatus(input.insuredId, input.appointmentId, 'completed');
    }
}

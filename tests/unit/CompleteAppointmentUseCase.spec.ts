import {
    CompleteAppointmentUseCase,
    type CompleteAppointmentInput,
} from '../../src/application/usecases/CompleteAppointment/CompleteAppointmentUseCase';
import type { IAppointmentDDBRepository } from '../../src/domain/repositories/IAppointmentDDBRepository';

describe('CompleteAppointmentUseCase', () => {
    let repo: jest.Mocked<IAppointmentDDBRepository>;
    let useCase: CompleteAppointmentUseCase;

    const baseInput: CompleteAppointmentInput = {
        insuredId: '12345',
        appointmentId: 'APP-123',
    };

    beforeEach(() => {
        repo = {
            savePending: jest.fn(),
            updateStatus: jest.fn(),
            listByInsuredId: jest.fn(),
        };

        useCase = new CompleteAppointmentUseCase(repo);
        jest.clearAllMocks();
    });

    it('debe marcar la cita como completed usando el repositorio', async () => {
        repo.updateStatus.mockResolvedValueOnce();

        await useCase.execute(baseInput);

        expect(repo.updateStatus).toHaveBeenCalledTimes(1);
        expect(repo.updateStatus).toHaveBeenCalledWith(
            baseInput.insuredId,
            baseInput.appointmentId,
            'completed',
        );
    });

    it('debe propagar el error si updateStatus falla', async () => {
        repo.updateStatus.mockRejectedValueOnce(new Error('DDB update error'));

        await expect(useCase.execute(baseInput)).rejects.toThrow(
            'DDB update error',
        );

        expect(repo.updateStatus).toHaveBeenCalledTimes(1);
    });
});
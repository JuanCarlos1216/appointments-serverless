import {
    ListAppointmentsByInsuredUseCase,
    type ListByInsuredInput,
} from '../../src/application/usecases/ListAppointmentsByInsured/ListAppointmentsByInsuredUseCase';
import type { IAppointmentDDBRepository } from '../../src/domain/repositories/IAppointmentDDBRepository';
import type { Appointment } from '../../src/domain/entities/Appointment';

describe('ListAppointmentsByInsuredUseCase', () => {
    let repo: jest.Mocked<IAppointmentDDBRepository>;
    let useCase: ListAppointmentsByInsuredUseCase;

    const insuredId = '12345';

    const appointmentsMock: Appointment[] = [
        {
            appointmentId: 'APP-1',
            insuredId,
            scheduleId: 1,
            countryISO: 'PE',
            status: 'completed',
            createdAt: '2025-11-17T00:00:00.000Z',
            updatedAt: '2025-11-17T00:05:00.000Z',
        },
        {
            appointmentId: 'APP-2',
            insuredId,
            scheduleId: 2,
            countryISO: 'CL',
            status: 'pending',
            createdAt: '2025-11-18T00:00:00.000Z',
            updatedAt: '2025-11-18T00:00:00.000Z',
        },
    ];

    beforeEach(() => {
        repo = {
            savePending: jest.fn(),
            updateStatus: jest.fn(),
            listByInsuredId: jest.fn(),
        };

        useCase = new ListAppointmentsByInsuredUseCase(repo);
        jest.clearAllMocks();
    });

    it('debe obtener las citas del asegurado desde el repositorio', async () => {
        repo.listByInsuredId.mockResolvedValueOnce(appointmentsMock);

        const result = await useCase.execute({ insuredId });

        expect(repo.listByInsuredId).toHaveBeenCalledTimes(1);
        expect(repo.listByInsuredId).toHaveBeenCalledWith(insuredId);
        expect(result).toEqual(appointmentsMock);
    });

    it('debe retornar arreglo vacío si el asegurado no tiene citas', async () => {
        repo.listByInsuredId.mockResolvedValueOnce([]);

        const result = await useCase.execute({ insuredId: '99999' });

        expect(result).toEqual([]);
        expect(repo.listByInsuredId).toHaveBeenCalledTimes(1);
    });

    it('debe propagar el error si listByInsuredId falla', async () => {
        repo.listByInsuredId.mockRejectedValueOnce(new Error('DDB query error'));

        await expect(useCase.execute({ insuredId })).rejects.toThrow(
            'DDB query error',
        );
    });
});
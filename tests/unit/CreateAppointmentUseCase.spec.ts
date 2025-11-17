import { CreateAppointmentUseCase } from '../../src/application/usecases/CreateAppointment/CreateAppointmentUseCase';
import type { CreateAppointmentInput } from '../../src/application/usecases/CreateAppointment/CreateAppointmentDTO';
import type { IAppointmentDDBRepository } from '../../src/domain/repositories/IAppointmentDDBRepository';
import type { IEventPublisher } from '../../src/application/services/IEventPublisher';
import type { Appointment } from '../../src/domain/entities/Appointment';

describe('CreateAppointmentUseCase', () => {
    let repo: jest.Mocked<IAppointmentDDBRepository>;
    let publisher: jest.Mocked<IEventPublisher>;
    let useCase: CreateAppointmentUseCase;

    const baseInput: CreateAppointmentInput = {
        insuredId: '12345',
        scheduleId: 10,
        countryISO: 'PE',
    };

    beforeEach(() => {
        repo = {
            savePending: jest.fn(),
            updateStatus: jest.fn(),
            listByInsuredId: jest.fn(),
        };

        publisher = {
            publishScheduleRequested: jest.fn(),
            publishAppointmentScheduled: jest.fn(),
        };

        useCase = new CreateAppointmentUseCase(repo, publisher);
        jest.clearAllMocks();
    });

    it('debe crear una cita pending, guardarla y publicar el evento', async () => {
        repo.savePending.mockResolvedValueOnce();

        const result = await useCase.execute(baseInput);

        expect(result).toMatchObject<Partial<Appointment>>({
            insuredId: baseInput.insuredId,
            scheduleId: baseInput.scheduleId,
            countryISO: baseInput.countryISO,
            status: 'pending',
        });

        expect(result.appointmentId).toBeDefined();
        expect(typeof result.appointmentId).toBe('string');
        expect(result.createdAt).toBeDefined();
        expect(result.updatedAt).toBeDefined();

        expect(repo.savePending).toHaveBeenCalledTimes(1);
        expect(repo.savePending).toHaveBeenCalledWith(result);

        expect(publisher.publishScheduleRequested).toHaveBeenCalledTimes(1);
        expect(publisher.publishScheduleRequested).toHaveBeenCalledWith(result);
    });

    it('debe lanzar error si insuredId no tiene 5 dígitos', async () => {
        await expect(
            useCase.execute({
                ...baseInput,
                insuredId: '12',
            } as any),
        ).rejects.toThrow('insuredId must be 5 digits');

        expect(repo.savePending).not.toHaveBeenCalled();
        expect(publisher.publishScheduleRequested).not.toHaveBeenCalled();
    });

    it('debe lanzar error si countryISO es inválido', async () => {
        await expect(
            useCase.execute({
                ...baseInput,
                countryISO: 'XX',
            } as any),
        ).rejects.toThrow('Invalid countryISO');

        expect(repo.savePending).not.toHaveBeenCalled();
        expect(publisher.publishScheduleRequested).not.toHaveBeenCalled();
    });

    it('debe propagar el error si savePending falla', async () => {
        repo.savePending.mockRejectedValueOnce(new Error('DDB error'));

        await expect(useCase.execute(baseInput)).rejects.toThrow('DDB error');

        expect(repo.savePending).toHaveBeenCalledTimes(1);
        expect(publisher.publishScheduleRequested).not.toHaveBeenCalled();
    });
});

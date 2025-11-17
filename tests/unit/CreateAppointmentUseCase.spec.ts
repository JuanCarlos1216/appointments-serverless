import { CreateAppointmentUseCase } from '../../src/application/usecases/CreateAppointment/CreateAppointmentUseCase';
import type { IAppointmentDDBRepository } from '../../src/domain/repositories/IAppointmentDDBRepository';
import type { IEventPublisher } from '../../src/application/services/IEventPublisher';

describe('CreateAppointmentUseCase', () => {
    it('crea cita pendiente y publica evento', async () => {
        const repoMock: IAppointmentDDBRepository = {
            savePending: jest.fn().mockResolvedValue(undefined),
            updateStatus: jest.fn(),
            listByInsuredId: jest.fn(),
        };

        const publisherMock: IEventPublisher = {
            publishScheduleRequested: jest.fn().mockResolvedValue(undefined),
        };

        const useCase = new CreateAppointmentUseCase(repoMock, publisherMock);

        const result = await useCase.execute({
            insuredId: '12345',
            scheduleId: 1,
            countryISO: 'PE',
        });

        expect(result.status).toBe('pending');
        expect(repoMock.savePending).toHaveBeenCalledTimes(1);
        expect(publisherMock.publishScheduleRequested).toHaveBeenCalledTimes(1);
    });
});

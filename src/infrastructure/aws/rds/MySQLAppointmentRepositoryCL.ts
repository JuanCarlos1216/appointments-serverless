import mysql from 'mysql2/promise';
import type { Appointment } from '../../../domain/entities/Appointment';

export class MySQLAppointmentRepositoryCL {
    private pool = mysql.createPool({
        host: process.env.DB_CL_HOST,
        port: Number(process.env.DB_CL_PORT ?? '3306'),
        user: process.env.DB_CL_USER,
        password: process.env.DB_CL_PASSWORD,
        database: process.env.DB_CL_NAME,
    });

    async create(appointment: Appointment): Promise<void> {
        await this.pool.execute(
            `INSERT INTO appointments
        (appointment_id, insured_id, schedule_id, country_iso, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
            [
                appointment.appointmentId,
                appointment.insuredId,
                appointment.scheduleId,
                appointment.countryISO,
            ],
        );
    }
}

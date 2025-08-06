import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, of, switchMap, take, tap } from 'rxjs';

export interface Appointment {
    id: string;
    patientId: string;
    patientName: string;
    patientPhone: string;
    patientEmail: string;
    doctorId: number;
    doctorName: string;
    doctorSpecialty: string;
    date: Date;
    time: string;
    duration: number; // in minutes
    status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no-show';
    price: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateAppointmentDto {
    patientId?: string;
    patientName: string;
    patientPhone: string;
    patientEmail: string;
    patientBirthDate: Date;
    patientGender: 'male' | 'female';
    doctorId: number;
    date: Date;
    time: string;
    notes?: string;
}

export interface AppointmentStats {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    completed: number;
    todayTotal: number;
    tomorrowTotal: number;
    weekTotal: number;
}

@Injectable({
    providedIn: 'root'
})
export class AppointmentsService {
    
    private _appointments: BehaviorSubject<Appointment[]> = new BehaviorSubject<Appointment[]>([]);
    private _appointment: BehaviorSubject<Appointment | null> = new BehaviorSubject<Appointment | null>(null);
    private _stats: BehaviorSubject<AppointmentStats | null> = new BehaviorSubject<AppointmentStats | null>(null);

    constructor(private _httpClient: HttpClient) {
        // Initialize with mock data
        this.loadMockData();
    }

    // Getters
    get appointments$(): Observable<Appointment[]> {
        return this._appointments.asObservable();
    }

    get appointment$(): Observable<Appointment | null> {
        return this._appointment.asObservable();
    }

    get stats$(): Observable<AppointmentStats | null> {
        return this._stats.asObservable();
    }

    // Get all appointments
    getAppointments(): Observable<Appointment[]> {
        return this._httpClient.get<Appointment[]>('api/appointments').pipe(
            tap((appointments) => {
                this._appointments.next(appointments);
                this.calculateStats(appointments);
            })
        );
    }

    // Get appointment by id
    getAppointmentById(id: string): Observable<Appointment> {
        return this._appointments.pipe(
            take(1),
            map((appointments) => {
                const appointment = appointments.find(item => item.id === id) || null;
                this._appointment.next(appointment);
                return appointment;
            }),
            switchMap((appointment) => {
                if (!appointment) {
                    return this._httpClient.get<Appointment>(`api/appointments/${id}`).pipe(
                        tap((appointment) => {
                            this._appointment.next(appointment);
                        })
                    );
                }
                return of(appointment);
            })
        );
    }

    // Get appointments by doctor
    getAppointmentsByDoctor(doctorId: number, date?: Date): Observable<Appointment[]> {
        return this._appointments.pipe(
            take(1),
            map((appointments) => {
                let filtered = appointments.filter(apt => apt.doctorId === doctorId);
                
                if (date) {
                    const targetDate = new Date(date);
                    targetDate.setHours(0, 0, 0, 0);
                    
                    filtered = filtered.filter(apt => {
                        const aptDate = new Date(apt.date);
                        aptDate.setHours(0, 0, 0, 0);
                        return aptDate.getTime() === targetDate.getTime();
                    });
                }
                
                return filtered;
            })
        );
    }

    // Get today's appointments
    getTodayAppointments(): Observable<Appointment[]> {
        return this._appointments.pipe(
            take(1),
            map((appointments) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                return appointments.filter(apt => {
                    const aptDate = new Date(apt.date);
                    aptDate.setHours(0, 0, 0, 0);
                    return aptDate.getTime() === today.getTime();
                });
            })
        );
    }

    // Create appointment
    createAppointment(appointment: CreateAppointmentDto): Observable<Appointment> {
        // Generate mock appointment
        const newAppointment: Appointment = {
            id: `APT-${Date.now()}`,
            patientId: appointment.patientId || `PAT-${Date.now()}`,
            patientName: appointment.patientName,
            patientPhone: appointment.patientPhone,
            patientEmail: appointment.patientEmail,
            doctorId: appointment.doctorId,
            doctorName: 'Dr. Name', // Would be fetched from doctor service
            doctorSpecialty: 'Specialty', // Would be fetched from doctor service
            date: appointment.date,
            time: appointment.time,
            duration: 30,
            status: 'pending',
            price: '12 000 ₸', // Would be calculated based on doctor/service
            notes: appointment.notes,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Simulate API call
        return of(newAppointment).pipe(
            tap((appointment) => {
                const appointments = this._appointments.value;
                this._appointments.next([...appointments, appointment]);
                this.calculateStats([...appointments, appointment]);
            })
        );
    }

    // Update appointment
    updateAppointment(id: string, appointment: Partial<Appointment>): Observable<Appointment> {
        return this._httpClient.patch<Appointment>(`api/appointments/${id}`, appointment).pipe(
            tap((updatedAppointment) => {
                const appointments = this._appointments.value;
                const index = appointments.findIndex(item => item.id === id);
                appointments[index] = updatedAppointment;
                this._appointments.next(appointments);
                this._appointment.next(updatedAppointment);
                this.calculateStats(appointments);
            })
        );
    }

    // Cancel appointment
    cancelAppointment(id: string): Observable<Appointment> {
        return this.updateAppointment(id, { status: 'cancelled' });
    }

    // Confirm appointment
    confirmAppointment(id: string): Observable<Appointment> {
        return this.updateAppointment(id, { status: 'confirmed' });
    }

    // Complete appointment
    completeAppointment(id: string): Observable<Appointment> {
        return this.updateAppointment(id, { status: 'completed' });
    }

    // Delete appointment
    deleteAppointment(id: string): Observable<boolean> {
        return this._httpClient.delete<boolean>(`api/appointments/${id}`).pipe(
            tap((isDeleted) => {
                const appointments = this._appointments.value.filter(item => item.id !== id);
                this._appointments.next(appointments);
                this.calculateStats(appointments);
            })
        );
    }

    // Calculate statistics
    private calculateStats(appointments: Appointment[]): void {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const stats: AppointmentStats = {
            total: appointments.length,
            confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
            pending: appointments.filter(apt => apt.status === 'pending').length,
            cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
            completed: appointments.filter(apt => apt.status === 'completed').length,
            todayTotal: appointments.filter(apt => {
                const aptDate = new Date(apt.date);
                aptDate.setHours(0, 0, 0, 0);
                return aptDate.getTime() === today.getTime();
            }).length,
            tomorrowTotal: appointments.filter(apt => {
                const aptDate = new Date(apt.date);
                aptDate.setHours(0, 0, 0, 0);
                return aptDate.getTime() === tomorrow.getTime();
            }).length,
            weekTotal: appointments.filter(apt => {
                const aptDate = new Date(apt.date);
                aptDate.setHours(0, 0, 0, 0);
                return aptDate >= today && aptDate <= weekEnd;
            }).length
        };

        this._stats.next(stats);
    }

    // Load mock data
    private loadMockData(): void {
        const mockAppointments: Appointment[] = [
            {
                id: 'APT-001',
                patientId: 'PAT-001',
                patientName: 'Иван Петров',
                patientPhone: '+7 777 123 4567',
                patientEmail: 'ivan.petrov@email.com',
                doctorId: 1,
                doctorName: 'Айгерим Каримова',
                doctorSpecialty: 'Терапевт',
                date: new Date(),
                time: '09:00',
                duration: 30,
                status: 'confirmed',
                price: '12 000 ₸',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            // Add more mock appointments...
        ];

        this._appointments.next(mockAppointments);
        this.calculateStats(mockAppointments);
    }
}
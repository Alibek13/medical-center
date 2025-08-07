import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, of, switchMap, take, tap } from 'rxjs';

export interface Doctor {
    id: number;
    name: string;
    specialty: string;
    experience: string;
    rating: number;
    reviews: number;
    price: string;
    avatar: string;
    email: string;
    phone: string;
    bio?: string;
    education?: string[];
    languages?: string[];
    workingHours?: WorkingHours;
}

export interface WorkingHours {
    monday?: { start: string; end: string };
    tuesday?: { start: string; end: string };
    wednesday?: { start: string; end: string };
    thursday?: { start: string; end: string };
    friday?: { start: string; end: string };
    saturday?: { start: string; end: string };
    sunday?: { start: string; end: string };
}

export interface TimeSlot {
    time: string;
    available: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class DoctorsService {

    private _doctors: BehaviorSubject<Doctor[]> = new BehaviorSubject<Doctor[]>([]);
    private _doctor: BehaviorSubject<Doctor | null> = new BehaviorSubject<Doctor | null>(null);

    constructor(private _httpClient: HttpClient) {
        // Initialize with mock data for now
        this.loadMockData();
    }

    // Getters
    get doctors$(): Observable<Doctor[]> {
        return this._doctors.asObservable();
    }

    get doctor$(): Observable<Doctor | null> {
        return this._doctor.asObservable();
    }

    // Get all doctors
    getDoctors(): Observable<Doctor[]> {
        return this._httpClient.get<Doctor[]>('api/doctors').pipe(
            tap((doctors) => {
                this._doctors.next(doctors);
            })
        );
    }

    // Get doctor by id
    getDoctorById(id: number): Observable<Doctor> {
        return this._doctors.pipe(
            take(1),
            map((doctors) => {
                const doctor = doctors.find(item => item.id === id) || null;
                this._doctor.next(doctor);
                return doctor;
            }),
            switchMap((doctor) => {
                if (!doctor) {
                    return this._httpClient.get<Doctor>(`api/doctors/${id}`).pipe(
                        tap((doctor) => {
                            this._doctor.next(doctor);
                        })
                    );
                }
                return of(doctor);
            })
        );
    }

    // Get available time slots for a doctor on a specific date
    getAvailableTimeSlots(doctorId: number, date: Date): Observable<TimeSlot[]> {
        // This would typically call an API endpoint
        // For now, return mock data
        const slots: TimeSlot[] = [];
        const startHour = 9;
        const endHour = 18;

        for (let hour = startHour; hour < endHour; hour++) {
            slots.push({
                time: `${hour.toString().padStart(2, '0')}:00`,
                available: Math.random() > 0.3
            });
            slots.push({
                time: `${hour.toString().padStart(2, '0')}:30`,
                available: Math.random() > 0.3
            });
        }

        return of(slots);
    }

    // Search doctors
    searchDoctors(query: string): Observable<Doctor[]> {
        return this._doctors.pipe(
            take(1),
            map((doctors) => {
                const lowercaseQuery = query.toLowerCase();
                return doctors.filter(doctor =>
                    doctor.name.toLowerCase().includes(lowercaseQuery) ||
                    doctor.specialty.toLowerCase().includes(lowercaseQuery)
                );
            })
        );
    }

    // Filter doctors by specialty
    filterBySpecialty(specialty: string): Observable<Doctor[]> {
        return this._doctors.pipe(
            take(1),
            map((doctors) => {
                if (specialty === 'all') {
                    return doctors;
                }
                return doctors.filter(doctor => doctor.specialty === specialty);
            })
        );
    }

    // Create doctor
    createDoctor(doctor: Doctor): Observable<Doctor> {
        return this._httpClient.post<Doctor>('api/doctors', doctor).pipe(
            tap((newDoctor) => {
                const doctors = this._doctors.value;
                this._doctors.next([...doctors, newDoctor]);
            })
        );
    }

    // Update doctor
    updateDoctor(id: number, doctor: Partial<Doctor>): Observable<Doctor> {
        return this._httpClient.patch<Doctor>(`api/doctors/${id}`, doctor).pipe(
            tap((updatedDoctor) => {
                const doctors = this._doctors.value;
                const index = doctors.findIndex(item => item.id === id);
                doctors[index] = updatedDoctor;
                this._doctors.next(doctors);
                this._doctor.next(updatedDoctor);
            })
        );
    }

    // Delete doctor
    deleteDoctor(id: number): Observable<boolean> {
        return this._httpClient.delete<boolean>(`api/doctors/${id}`).pipe(
            tap((isDeleted) => {
                const doctors = this._doctors.value.filter(item => item.id !== id);
                this._doctors.next(doctors);
            })
        );
    }

    // Load mock data (temporary)
    private loadMockData(): void {
        const mockDoctors: Doctor[] = [
            {
                id: 1,
                name: 'Абдурахманова Гулжан Жаксыгельдиевна',
                specialty: 'Гинеколог',
                experience: '15 лет стажа',
                rating: 4.9,
                reviews: 127,
                price: '12 000 ₸',
                avatar: 'https://ui-avatars.com/api/?name=Гулжан+Абдурахманова&background=6366f1&color=fff&size=200&rounded=true&bold=true',
                email: 'g.abdurakhmanova@medcenter.kz',
                phone: '+7 777 123 4567',
                bio: 'Врач высшей категории. Специализируется на ведении беременности, диагностике и лечении гинекологических заболеваний.',
                education: [
                    'Казахский Национальный Медицинский Университет (2005)',
                    'Ординатура по акушерству и гинекологии (2007)',
                    'Повышение квалификации в Германии (2015)'
                ],
                languages: ['Казахский', 'Русский', 'Английский'],
                workingHours: {
                    monday: { start: '09:00', end: '18:00' },
                    tuesday: { start: '09:00', end: '18:00' },
                    wednesday: { start: '09:00', end: '18:00' },
                    thursday: { start: '09:00', end: '18:00' },
                    friday: { start: '09:00', end: '17:00' }
                }
            },
            {
                id: 2,
                name: 'Сыздыков Марат Кайратович',
                specialty: 'Кардиолог',
                experience: '20 лет стажа',
                rating: 4.8,
                reviews: 89,
                price: '15 000 ₸',
                avatar: 'https://ui-avatars.com/api/?name=Марат+Сыздыков&background=ec4899&color=fff&size=200&rounded=true&bold=true',
                email: 'm.syzdykov@medcenter.kz',
                phone: '+7 701 234 5678',
                bio: 'Доктор медицинских наук. Специалист по диагностике и лечению сердечно-сосудистых заболеваний.',
                education: [
                    'Алматинский Государственный Медицинский Институт (2000)',
                    'Кандидат медицинских наук (2008)',
                    'Доктор медицинских наук (2015)'
                ],
                languages: ['Казахский', 'Русский'],
                workingHours: {
                    monday: { start: '08:00', end: '16:00' },
                    tuesday: { start: '08:00', end: '16:00' },
                    wednesday: { start: '08:00', end: '16:00' },
                    thursday: { start: '08:00', end: '16:00' },
                    friday: { start: '08:00', end: '15:00' }
                }
            },
            {
                id: 3,
                name: 'Жанибекова Айгуль Серикбаевна',
                specialty: 'Педиатр',
                experience: '12 лет стажа',
                rating: 5.0,
                reviews: 203,
                price: '10 000 ₸',
                avatar: 'https://ui-avatars.com/api/?name=Айгуль+Жанибекова&background=10b981&color=fff&size=200&rounded=true&bold=true',
                email: 'a.zhanibekova@medcenter.kz',
                phone: '+7 705 345 6789',
                bio: 'Специалист первой категории. Занимается диагностикой и лечением детских заболеваний.',
                education: [
                    'Карагандинская Государственная Медицинская Академия (2009)',
                    'Интернатура по педиатрии (2011)',
                    'Курсы повышения квалификации (2020)'
                ],
                languages: ['Казахский', 'Русский'],
                workingHours: {
                    monday: { start: '09:00', end: '18:00' },
                    tuesday: { start: '09:00', end: '18:00' },
                    wednesday: { start: '09:00', end: '18:00' },
                    thursday: { start: '09:00', end: '18:00' },
                    friday: { start: '09:00', end: '17:00' },
                    saturday: { start: '10:00', end: '14:00' }
                }
            },
            {
                id: 4,
                name: 'Нурпеисов Бауыржан Маратович',
                specialty: 'Невролог',
                experience: '8 лет стажа',
                rating: 4.7,
                reviews: 56,
                price: '12 000 ₸',
                avatar: 'https://ui-avatars.com/api/?name=Бауыржан+Нурпеисов&background=f59e0b&color=fff&size=200&rounded=true&bold=true',
                email: 'b.nurpeisov@medcenter.kz',
                phone: '+7 708 456 7890',
                bio: 'Специализируется на диагностике и лечении заболеваний нервной системы.',
                education: [
                    'Астанинский Медицинский Университет (2013)',
                    'Резидентура по неврологии (2015)'
                ],
                languages: ['Казахский', 'Русский', 'Английский'],
                workingHours: {
                    monday: { start: '10:00', end: '19:00' },
                    tuesday: { start: '10:00', end: '19:00' },
                    wednesday: { start: '10:00', end: '19:00' },
                    thursday: { start: '10:00', end: '19:00' },
                    friday: { start: '10:00', end: '18:00' }
                }
            },
            {
                id: 5,
                name: 'Касымова Динара Амангельдиевна',
                specialty: 'Терапевт',
                experience: '18 лет стажа',
                rating: 4.9,
                reviews: 145,
                price: '8 000 ₸',
                avatar: 'https://ui-avatars.com/api/?name=Динара+Касымова&background=8b5cf6&color=fff&size=200&rounded=true&bold=true',
                email: 'd.kassymova@medcenter.kz',
                phone: '+7 747 567 8901',
                bio: 'Врач высшей категории. Общая терапевтическая практика, профилактические осмотры.',
                education: [
                    'Семипалатинская Государственная Медицинская Академия (2003)',
                    'Ординатура по внутренним болезням (2005)',
                    'Повышение квалификации (2019)'
                ],
                languages: ['Казахский', 'Русский'],
                workingHours: {
                    tuesday: { start: '08:00', end: '17:00' },
                    wednesday: { start: '08:00', end: '17:00' },
                    thursday: { start: '08:00', end: '17:00' },
                    friday: { start: '08:00', end: '16:00' }
                }
            }
        ];

        this._doctors.next(mockDoctors);
    }
}
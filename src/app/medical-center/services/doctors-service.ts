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
    nextSlot: string;
    status: 'available' | 'busy' | 'offline';
    email: string;
    phone: string;
    bio?: string;
    education?: string[];
    languages?: string[];
    workingHours?: WorkingHours;
}

export interface WorkingHours {
    monday: { start: string; end: string };
    tuesday: { start: string; end: string };
    wednesday: { start: string; end: string };
    thursday: { start: string; end: string };
    friday: { start: string; end: string };
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

    getSpecialties(): string[] {
        return Array.from(new Set(this._doctors.value.map(d => d.specialty))).sort();
    }

    /** Вернёт текущий массив докторов без HTTP‑запроса (sync) */
    getAll(): Doctor[] {
        return this._doctors.value;
    }

    getBySpecialty(specialty: string): Doctor[] {
        if (specialty === 'all') {
            return this._doctors.value;
        }
        return this._doctors.value.filter(d => d.specialty === specialty);
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
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=doctor1&backgroundColor=c7d2fe',
                nextSlot: 'Сегодня в 15:00',
                status: 'available',
                email: 'a.karimova@medcenter.kz',
                phone: '+7 777 123 4567',
                bio: 'Врач высшей категории. Специализируется на диагностике и лечении заболеваний внутренних органов.',
                education: [
                    'Казахский Национальный Медицинский Университет (2005)',
                    'Ординатура по терапии (2007)',
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
            // Add more mock doctors...
        ];

        this._doctors.next(mockDoctors);
    }
}
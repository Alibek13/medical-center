import { Component, OnInit, inject, signal, computed, ViewEncapsulation, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    ReactiveFormsModule,
    Validators,
    FormGroup,
    ValidatorFn,
    AbstractControl,
    ValidationErrors
} from '@angular/forms';
import { RouterModule } from '@angular/router';

/* Angular‑Material */
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import {
    trigger,
    state,
    style,
    animate,
    transition
} from '@angular/animations';
/* Fuse */
import { FuseCardComponent } from '@fuse/components/card';

/* Services & models */
import {
    DoctorsService,
    TimeSlot
} from '../../medical-center/services/doctors-service';
import {
    AppointmentsService,
    CreateAppointmentDto
} from '../../medical-center/services/appointments-service';

/* Интерфейсы */
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

@Component({
    standalone: true,
    selector: 'app-patient-booking',
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        /* Material */
        MatButtonModule,
        MatIconModule,
        MatStepperModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatRadioModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        MatCardModule,
        MatDividerModule,
        MatChipsModule,
        /* Fuse */
        FuseCardComponent
    ],
    templateUrl: './pacient-booking.component.html',
    styleUrls: ['./pacient-booking.component.scss'],
    //   encapsulation: ViewEncapsulation.None
})
export class PacientBookingComponent implements OnInit, AfterViewInit {

    /* ────── DI ────── */
    private doctorsSrv = inject(DoctorsService);
    private appointmentsSrv = inject(AppointmentsService);
    private fb = inject(FormBuilder);
    private cdr = inject(ChangeDetectorRef);

    /* ────── signals (state) ────── */
    currentStep = signal(0);
    specialties = signal<string[]>([]);
    doctors = signal<Doctor[]>([]);
    timeSlots = signal<TimeSlot[]>([]);
    loadingSlots = signal(false);
    submitting = signal(false);
    success = signal(false);
    searchQuery = signal('');

    // WhatsApp verification states
    codeSent = signal(false);
    verifying = signal(false);
    phoneVerified = signal(false);
    verificationCode = signal('');
    countdown = signal(0);
    canResend = signal(false);

    /* ────── computed signals ────── */
    filteredDoctors = computed(() => {
        const query = this.searchQuery().toLowerCase();
        const specialty = this.selectForm.value.specialty;

        return this.doctors().filter(doc => {
            const matchesSearch = !query ||
                doc.name.toLowerCase().includes(query);
            const matchesSpecialty = specialty === 'all' ||
                doc.specialty === specialty;
            return matchesSearch && matchesSpecialty;
        });
    });

    selectedDoctor = computed(() => {
        const id = this.selectForm.value.doctorId;
        return this.doctors().find(d => d.id === id) ?? null;
    });

    /* ────── reactive forms ────── */
    selectForm: FormGroup = this.fb.group({
        specialty: ['all', Validators.required],
        doctorId: [null, Validators.required], // null вместо string
    });

    dateForm: FormGroup = this.fb.group({
        date: [null, Validators.required],
        time: ['', Validators.required],
    });

    patientForm: FormGroup = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        phone: ['', [Validators.required, this.phoneValidator()]],
        gender: ['male'],
        comment: ['']
    });

    // Форма для кода подтверждения
    verificationForm: FormGroup = this.fb.group({
        code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });

    confirmationData = computed(() => ({
        doctor: this.selectedDoctor(),
        date: this.dateForm.value.date,
        time: this.dateForm.value.time,
        patientName: `${this.patientForm.value.firstName} ${this.patientForm.value.lastName}`,
        patientPhone: this.patientForm.value.phone,
        price: this.selectedDoctor()?.price
    }));

    /* Кастомный валидатор для телефона */
    phoneValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) return null;

            // Убираем все символы кроме цифр для проверки
            const digitsOnly = control.value.replace(/\D/g, '');

            // Проверяем что начинается с 7 и содержит 11 цифр
            // Формат: 7 + код оператора (3 цифры) + номер (7 цифр) = 11 цифр
            if (digitsOnly.length === 11 && digitsOnly.startsWith('7')) {
                const operatorCode = digitsOnly.substring(1, 4);
                // Базовая проверка - код оператора должен быть в диапазоне 700-799
                const codeNum = parseInt(operatorCode);
                if (codeNum >= 700 && codeNum <= 799) {
                    return null; // Валидный номер
                }
            }

            return { phone: true }; // Невалидный номер
        };
    }

    confirmForm: FormGroup = this.fb.group({
        consent: [false]
    });

    /* Минимальная дата (сегодня) */
    minDate = new Date();

    /* Максимальная дата (через 2 месяца) */
    maxDate = new Date(
        new Date().setMonth(new Date().getMonth() + 2)
    );

    /* ────── lifecycle ────── */
    ngOnInit(): void {
        /* загрузка специализаций */
        this.specialties.set(this.doctorsSrv.getSpecialties());

        /* загрузка всех врачей с дополнительными данными */
        const allDoctors = this.doctorsSrv.getAll()
        this.doctors.set(allDoctors);

        /* подписка на изменение фильтра специальности */
        this.selectForm.get('specialty')!.valueChanges.subscribe(spec => {
            this.selectForm.get('doctorId')!.reset(null);
        });

        this.selectForm.valueChanges.subscribe(() => {
            this.cdr.markForCheck();
        });

        this.dateForm.valueChanges.subscribe(() => {
            this.cdr.markForCheck();
        });

        this.patientForm.valueChanges.subscribe(() => {
            this.cdr.markForCheck();
        });
    }

    ngAfterViewInit(): void {
        // Дополнительное обновление после инициализации представления
        this.cdr.detectChanges();
    }

    /* ────── методы выбора врача ────── */
    selectDoctor(doctor: Doctor): void {
        this.selectForm.patchValue({ doctorId: doctor.id });
    }

    onSearchChange(query: string): void {
        this.searchQuery.set(query);
    }

    getAvatarUrl(name: string): string {
        const colors = ['6366f1', 'ec4899', '10b981', 'f59e0b', '8b5cf6'];
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const color = colors[hash % colors.length];
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&size=60&rounded=true&font-size=0.35`;
    }

    getRandomCategory(doctorId: number): string {
        const categories = ['Высшая категория', 'Первая категория', 'Вторая категория', 'К.м.н.', 'Д.м.н.'];
        // Используем ID врача для генерации псевдослучайного индекса
        const index = doctorId % categories.length;
        return categories[index];
    }

    /* ────── слоты времени ────── */
    onDateChange(date: Date | null): void {
        if (!date || !this.selectForm.valid) {
            this.timeSlots.set([]);
            return;
        }

        this.loadingSlots.set(true);
        this.dateForm.patchValue({ time: '' }); // сброс выбранного времени

        this.doctorsSrv
            .getAvailableTimeSlots(this.selectForm.value.doctorId, date)
            .subscribe(slots => {
                this.timeSlots.set(slots);
                this.loadingSlots.set(false);
            });
    }

    selectTime(time: string): void {
        this.dateForm.patchValue({ time });
    }

    isTimeSelected(time: string): boolean {
        return this.dateForm.value.time === time;
    }

    /* ────── WhatsApp верификация ────── */
    sendWhatsAppCode(): void {
        if (!this.patientForm.get('phone')?.valid) return;

        this.codeSent.set(true);

        // Используем статичный код для тестирования
        const code = '123456';
        this.verificationCode.set(code);

        // Имитация отправки кода
        console.log('WhatsApp код:', code);

        // Запускаем таймер обратного отсчета (60 секунд)
        this.countdown.set(60);
        this.canResend.set(false);

        const timer = setInterval(() => {
            const currentCount = this.countdown();
            if (currentCount > 0) {
                this.countdown.set(currentCount - 1);
            } else {
                clearInterval(timer);
                this.canResend.set(true);
            }
        }, 1000);
    }

    verifyCode(): void {
        if (!this.verificationForm.valid) return;

        this.verifying.set(true);

        // Имитация проверки кода (задержка 1.5 сек)
        setTimeout(() => {
            if (this.verificationForm.value.code === this.verificationCode()) {
                this.phoneVerified.set(true);
                this.verifying.set(false);
            } else {
                this.verifying.set(false);
                // Показываем ошибку
                this.verificationForm.get('code')?.setErrors({ incorrect: true });
            }
        }, 1500);
    }

    resendCode(): void {
        if (this.canResend()) {
            this.sendWhatsAppCode();
            this.verificationForm.reset();
        }
    }

    /* ────── навигация по шагам ────── */
    nextStep(): void {
        if (this.canProceed()) {
            this.currentStep.update(v => v + 1);

            // Принудительное обновление при переходе на шаг подтверждения
            if (this.currentStep() === 3) {
                setTimeout(() => {
                    this.cdr.detectChanges();
                }, 0);
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    prevStep(): void {
        this.currentStep.update(v => Math.max(0, v - 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    canProceed(): boolean {
        switch (this.currentStep()) {
            case 0: return this.selectForm.valid;
            case 1: return this.dateForm.valid;
            case 2: return this.patientForm.valid && this.phoneVerified();
            case 3: return this.confirmForm.valid;
            default: return false;
        }
    }

    getStepName(step: number): string {
        const stepNames = [
            'Выбор специалиста',
            'Дата и время',
            'Ваши данные',
            'Подтверждение'
        ];
        return stepNames[step] || '';
    }

    /* ────── форматирование ────── */
    formatPhone(event: any): void {
        let value = event.target.value.replace(/\D/g, '');

        // Обработка старого формата с 8
        if (value.startsWith('8') && value.length <= 11) {
            value = '7' + value.substring(1);
        }

        // Ограничиваем длину 11 цифр
        if (value.length > 11) {
            value = value.substring(0, 11);
        }

        // Если начинается не с 7, добавляем
        if (value.length > 0 && value[0] !== '7') {
            value = '7' + value;
        }

        // Форматируем в зависимости от длины
        // Казахстанский формат: +7 7XX XXX-XX-XX
        // Где 7XX - код оператора (700-799)
        let formatted = '';
        if (value.length > 0) {
            // +7
            formatted = '+' + value.substring(0, 1);

            if (value.length > 1) {
                // +7 7XX (код оператора)
                formatted += ' ' + value.substring(1, 4);
            }

            if (value.length > 4) {
                // +7 7XX XXX
                formatted += ' ' + value.substring(4, 7);
            }

            if (value.length > 7) {
                // +7 7XX XXX-XX
                formatted += '-' + value.substring(7, 9);
            }

            if (value.length > 9) {
                // +7 7XX XXX-XX-XX
                formatted += '-' + value.substring(9, 11);
            }
        }

        this.patientForm.patchValue({ phone: formatted });
    }

    onPhonePaste(event: ClipboardEvent): void {
        event.preventDefault();
        let pastedText = event.clipboardData?.getData('text') || '';

        // Убираем лишние символы, но оставляем цифры
        pastedText = pastedText.replace(/[^\d]/g, '');

        // Если номер начинается с 8, заменяем на 7
        if (pastedText.startsWith('8') && pastedText.length === 11) {
            pastedText = '7' + pastedText.substring(1);
        }

        // Создаем искусственный event для форматирования
        const fakeEvent = {
            target: {
                value: pastedText
            }
        };

        this.formatPhone(fakeEvent);
    }

    /* ────── отправка записи ────── */
    placeBooking(): void {
        if (this.submitting() || !this.confirmForm.valid) return;

        this.submitting.set(true);

        // Получаем чистый номер телефона для отправки
        const phoneDigits = this.patientForm.value.phone.replace(/\D/g, '');

        const dto: CreateAppointmentDto = {
            patientName: `${this.patientForm.value.firstName} ${this.patientForm.value.lastName}`,
            patientPhone: `+${phoneDigits}`, // Отправляем в формате +77783511751
            patientEmail: '', // Пустое значение, так как email больше не используется
            patientBirthDate: new Date(), // Используем текущую дату как заглушку
            patientGender: this.patientForm.value.gender,
            doctorId: this.selectForm.value.doctorId,
            date: this.dateForm.value.date,
            time: this.dateForm.value.time,
            notes: this.patientForm.value.comment
        };

        this.appointmentsSrv.createAppointment(dto).subscribe({
            next: () => {
                this.success.set(true);
                this.submitting.set(false);
                this.currentStep.set(4); // финальный экран
            },
            error: (err) => {
                console.error('Ошибка записи:', err);
                this.submitting.set(false);
            }
        });
    }

    /* ────── сброс формы ────── */
    resetBooking(): void {
        this.selectForm.reset({ specialty: 'all' });
        this.dateForm.reset();
        this.patientForm.reset({
            gender: 'male',
            phone: '' // Явно сбрасываем телефон
        });
        this.confirmForm.reset();
        this.verificationForm.reset();
        this.currentStep.set(0);
        this.success.set(false);
        this.timeSlots.set([]);

        // Сброс состояний WhatsApp верификации
        this.codeSent.set(false);
        this.verifying.set(false);
        this.phoneVerified.set(false);
        this.verificationCode.set('');
        this.countdown.set(0);
        this.canResend.set(false);
    }

    getShortName(fullName: string): string {
        const parts = fullName.trim().split(' ');

        if (parts.length === 1) {
            return fullName; // Если только одно слово, возвращаем как есть
        }

        if (parts.length === 2) {
            // Фамилия + инициал имени
            return `${parts[0]} ${parts[1].charAt(0)}.`;
        }

        if (parts.length >= 3) {
            // Фамилия + инициалы имени и отчества
            return `${parts[0]} ${parts[1].charAt(0)}.${parts[2].charAt(0)}.`;
        }

        return fullName;
    }
}
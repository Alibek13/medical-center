// src/app/medical-center/doctors/doctor-form-dialog/doctor-form-dialog-component.ts
// Упрощенная версия без статуса

import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { Doctor } from '../../services/doctors-service';
import { DoctorScheduleComponent } from '../doctor-schedule/doctor-schedule-component';
import { ScheduleConfig } from '../doctor-schedule/doctor-schedule-component';

@Component({
    selector: 'medical-center-doctor-form-dialog',
    templateUrl: './doctor-form-dialog-html.html',
    styleUrls: ['./doctor-form-dialog-scss.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatIconModule,
        MatTabsModule,
        MatChipsModule,
        MatSlideToggleModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatDividerModule,
        DoctorScheduleComponent
    ]
})
export class DoctorFormDialogComponent implements OnInit {
    doctorForm!: FormGroup;
    mode: 'create' | 'edit' = 'create';
    doctorSchedule: ScheduleConfig | null = null;

    specialties = [
        'Терапевт',
        'Кардиолог',
        'Невролог',
        'Гинеколог',
        'Педиатр',
        'Хирург',
        'Офтальмолог',
        'ЛОР',
        'Дерматолог',
        'Эндокринолог',
        'Гастроэнтеролог',
        'Уролог',
        'Психиатр',
        'Стоматолог',
        'Ортопед',
        'Анестезиолог',
        'Рентгенолог',
        'УЗИ-специалист'
    ];

    languages = ['Казахский', 'Русский', 'Английский', 'Турецкий', 'Китайский'];

    workDays = [
        { key: 'monday', label: 'Понедельник', short: 'Пн' },
        { key: 'tuesday', label: 'Вторник', short: 'Вт' },
        { key: 'wednesday', label: 'Среда', short: 'Ср' },
        { key: 'thursday', label: 'Четверг', short: 'Чт' },
        { key: 'friday', label: 'Пятница', short: 'Пт' },
        { key: 'saturday', label: 'Суббота', short: 'Сб' },
        { key: 'sunday', label: 'Воскресенье', short: 'Вс' }
    ];

    timeSlots: string[] = [];

    constructor(
        private _formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<DoctorFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { doctor: Doctor | null, mode: 'create' | 'edit' }
    ) {
        this.mode = data.mode;
        this.generateTimeSlots();
    }

    ngOnInit(): void {
        this.initializeForm();

        if (this.mode === 'edit' && this.data.doctor) {
            this.populateForm(this.data.doctor);
        }
    }

    generateTimeSlots(): void {
        for (let hour = 6; hour <= 22; hour++) {
            for (let min = 0; min < 60; min += 30) {
                const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
                this.timeSlots.push(time);
            }
        }
    }

    initializeForm(): void {
        this.doctorForm = this._formBuilder.group({
            // Основная информация
            name: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.required, Validators.pattern(/^\+7\s?\(?\d{3}\)?\s?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/)]],
            specialty: ['', Validators.required],
            experience: ['', [Validators.required, Validators.pattern(/^\d+\s*(лет|год|года|месяц|месяца|месяцев)/)]],
            price: ['', [Validators.required, Validators.pattern(/^\d+(\s?\d{3})*\s?₸?$/)]],

            // Дополнительная информация
            bio: ['', [Validators.maxLength(500)]],
            education: this._formBuilder.array([]),
            languages: [[], Validators.required],

            // Рейтинг
            rating: [4.5, [Validators.required, Validators.min(0), Validators.max(5)]],
            reviews: [0, [Validators.required, Validators.min(0)]],

            // График работы
            workingHours: this._formBuilder.group({
                monday: this.createWorkDayGroup(true, '09:00', '18:00'),
                tuesday: this.createWorkDayGroup(true, '09:00', '18:00'),
                wednesday: this.createWorkDayGroup(true, '09:00', '18:00'),
                thursday: this.createWorkDayGroup(true, '09:00', '18:00'),
                friday: this.createWorkDayGroup(true, '09:00', '17:00'),
                saturday: this.createWorkDayGroup(false, '10:00', '14:00'),
                sunday: this.createWorkDayGroup(false, '', '')
            })
        });

        // Добавляем хотя бы одно поле образования
        if (this.educationArray.length === 0) {
            this.addEducation();
        }
    }

    createWorkDayGroup(enabled: boolean, start: string, end: string): FormGroup {
        return this._formBuilder.group({
            enabled: [enabled],
            start: [start],
            end: [end]
        });
    }

    populateForm(doctor: Doctor): void {
        // Основные поля
        this.doctorForm.patchValue({
            name: doctor.name,
            email: doctor.email,
            phone: doctor.phone,
            specialty: doctor.specialty,
            experience: doctor.experience,
            price: doctor.price,
            bio: doctor.bio || '',
            languages: doctor.languages || [],
            rating: doctor.rating,
            reviews: doctor.reviews
        });

        // Образование
        this.educationArray.clear();
        if (doctor.education && doctor.education.length > 0) {
            doctor.education.forEach(edu => {
                this.addEducation(edu);
            });
        } else {
            this.addEducation();
        }

        // График работы
        if (doctor.workingHours) {
            const workingHours = doctor.workingHours as any;
            Object.keys(workingHours).forEach(day => {
                const dayControl = this.doctorForm.get(`workingHours.${day}`);
                if (dayControl && workingHours[day]) {
                    dayControl.patchValue({
                        enabled: true,
                        start: workingHours[day].start,
                        end: workingHours[day].end
                    });
                }
            });
        }

        if (doctor.workingHours) {
            this.doctorSchedule = this.convertToScheduleConfig(doctor.workingHours);
        }
    }

    // Методы для работы с образованием
    get educationArray(): FormArray {
        return this.doctorForm.get('education') as FormArray;
    }

    addEducation(value: string = ''): void {
        this.educationArray.push(
            this._formBuilder.control(value, [Validators.required, Validators.minLength(5)])
        );
    }

    removeEducation(index: number): void {
        if (this.educationArray.length > 1) {
            this.educationArray.removeAt(index);
        }
    }

    // Получить данные для рабочего дня
    getWorkDayControl(day: string): FormGroup {
        return this.doctorForm.get(`workingHours.${day}`) as FormGroup;
    }

    // Копировать график на все будние дни
    copyToWeekdays(): void {
        const mondaySchedule = this.getWorkDayControl('monday').value;
        ['tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
            this.getWorkDayControl(day).patchValue(mondaySchedule);
        });
    }

    // Форматирование цены
    formatPrice(event: any): void {
        let value = event.target.value.replace(/[^\d]/g, '');
        if (value) {
            value = parseInt(value).toLocaleString('ru-RU');
            this.doctorForm.get('price')?.setValue(value + ' ₸', { emitEvent: false });
        }
    }

    // Сохранить
    save(): void {
        if (this.doctorForm.invalid) {
            this.doctorForm.markAllAsTouched();
            return;
        }

        const formValue = this.doctorForm.value;

        // Преобразуем график работы
        const workingHours: any = {};
        Object.keys(formValue.workingHours).forEach(day => {
            const dayData = formValue.workingHours[day];
            if (dayData.enabled && dayData.start && dayData.end) {
                workingHours[day] = {
                    start: dayData.start,
                    end: dayData.end
                };
            }
        });

        // Формируем объект доктора
        const doctorData: Partial<Doctor> = {
            name: formValue.name.trim(),
            email: formValue.email.toLowerCase().trim(),
            phone: formValue.phone.trim(),
            specialty: formValue.specialty,
            experience: formValue.experience.trim(),
            price: formValue.price.includes('₸') ? formValue.price : `${formValue.price} ₸`,
            bio: formValue.bio.trim(),
            education: formValue.education.filter((e: string) => e && e.trim()),
            languages: formValue.languages,
            rating: parseFloat(formValue.rating),
            reviews: parseInt(formValue.reviews),
            workingHours: workingHours,
            avatar: this.data.doctor?.avatar || this.generateAvatar(formValue.name)
        };

        this.dialogRef.close(doctorData);
    }

    // Генерация аватара
    generateAvatar(name: string): string {
        const colors = ['6366f1', 'ec4899', '10b981', 'f59e0b', '8b5cf6', '06b6d4', 'ef4444'];
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const color = colors[hash % colors.length];
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&size=200&rounded=true&bold=true`;
    }

    // Отмена
    cancel(): void {
        this.dialogRef.close();
    }

    updateSchedule(scheduleConfig: ScheduleConfig): void {
        this.doctorSchedule = scheduleConfig;
        // Можно сохранить в форму или обработать как нужно
        // Например, преобразовать в простой формат для сохранения
        this.convertScheduleToSimpleFormat(scheduleConfig);
    }

    // 5. Метод для преобразования расширенного расписания в простой формат
    convertScheduleToSimpleFormat(config: ScheduleConfig): void {
        // Преобразуем расширенное расписание в простой формат workingHours
        const workingHours: any = {};

        config.workDays.forEach(day => {
            if (day.enabled && day.workHours.length > 0) {
                const dayName = this.getDayName(day.dayOfWeek);
                workingHours[dayName] = {
                    start: day.workHours[0].start,
                    end: day.workHours[0].end
                };
            }
        });

        // Обновляем форму
        this.doctorForm.patchValue({ workingHours });
    }

    // 6. Вспомогательный метод для получения названия дня
    getDayName(dayOfWeek: number): string {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days[dayOfWeek];
    }

    // 8. Метод для преобразования простого расписания в расширенный формат
    convertToScheduleConfig(workingHours: any): ScheduleConfig {
        const workDays = [];
        const dayMapping: { [key: string]: number } = {
            'sunday': 0,
            'monday': 1,
            'tuesday': 2,
            'wednesday': 3,
            'thursday': 4,
            'friday': 5,
            'saturday': 6
        };

        for (const [day, hours] of Object.entries(workingHours)) {
            if (hours && typeof hours === 'object' && 'start' in hours && 'end' in hours) {
                workDays.push({
                    dayOfWeek: dayMapping[day],
                    enabled: true,
                    workHours: [{
                        start: (hours as any).start,
                        end: (hours as any).end
                    }],
                    breaks: []
                });
            }
        }

        // Добавляем неактивные дни
        for (let i = 0; i <= 6; i++) {
            if (!workDays.find(d => d.dayOfWeek === i)) {
                workDays.push({
                    dayOfWeek: i,
                    enabled: false,
                    workHours: [],
                    breaks: []
                });
            }
        }

        return {
            slotDuration: 30,
            workDays: workDays.sort((a, b) => a.dayOfWeek - b.dayOfWeek),
            breaks: [{
                name: 'Обеденный перерыв',
                start: '13:00',
                end: '14:00',
                applyToDays: [1, 2, 3, 4, 5]
            }],
            blockedDates: [],
            specialDates: []
        };
    }
}
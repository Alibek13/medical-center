// src/app/medical-center/doctors/doctor-schedule/doctor-schedule-component.ts
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';

export interface ScheduleConfig {
    slotDuration: number; // Длительность слота в минутах (15, 30, 45, 60)
    workDays: DaySchedule[];
    breaks: BreakTime[];
    blockedDates: Date[];
    specialDates: SpecialDate[];
}

export interface DaySchedule {
    dayOfWeek: number; // 0 = Воскресенье, 1 = Понедельник, и т.д.
    enabled: boolean;
    workHours: TimeRange[];
    breaks: TimeRange[];
}

export interface TimeRange {
    start: string; // "09:00"
    end: string;   // "18:00"
}

export interface BreakTime {
    name: string; // "Обеденный перерыв"
    start: string;
    end: string;
    applyToDays: number[]; // Дни недели, к которым применяется
}

export interface SpecialDate {
    date: Date;
    type: 'holiday' | 'conference' | 'sick-leave' | 'vacation';
    description: string;
    isFullDay: boolean;
    timeRange?: TimeRange;
}

@Component({
    selector: 'doctor-schedule',
    templateUrl: './doctor-schedule-html.html',
    styleUrls: ['./doctor-schedule-scss.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatChipsModule,
        MatTooltipModule,
        MatExpansionModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatCardModule,
        MatTabsModule,
        MatMenuModule
    ]
})
export class DoctorScheduleComponent implements OnInit {
    @Input() scheduleConfig?: ScheduleConfig;
    @Output() scheduleChange = new EventEmitter<ScheduleConfig>();

    scheduleForm!: FormGroup;

    slotDurations = [
        { value: 15, label: '15 минут' },
        { value: 30, label: '30 минут' },
        { value: 45, label: '45 минут' },
        { value: 60, label: '1 час' }
    ];

    weekDays = [
        { value: 1, label: 'Понедельник', short: 'Пн' },
        { value: 2, label: 'Вторник', short: 'Вт' },
        { value: 3, label: 'Среда', short: 'Ср' },
        { value: 4, label: 'Четверг', short: 'Чт' },
        { value: 5, label: 'Пятница', short: 'Пт' },
        { value: 6, label: 'Суббота', short: 'Сб' },
        { value: 0, label: 'Воскресенье', short: 'Вс' }
    ];

    timeSlots: string[] = [];

    specialDateTypes = [
        { value: 'holiday', label: 'Выходной', icon: 'beach_access', color: 'primary' },
        { value: 'conference', label: 'Конференция', icon: 'groups', color: 'accent' },
        { value: 'sick-leave', label: 'Больничный', icon: 'medical_services', color: 'warn' },
        { value: 'vacation', label: 'Отпуск', icon: 'flight_takeoff', color: 'primary' }
    ];

    constructor(private fb: FormBuilder) { }

    ngOnInit(): void {
        this.generateTimeSlots();
        this.initializeForm();

        if (this.scheduleConfig) {
            this.loadScheduleConfig(this.scheduleConfig);
        }
    }

    generateTimeSlots(): void {
        for (let hour = 6; hour <= 22; hour++) {
            for (let min = 0; min < 60; min += 15) {
                const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
                this.timeSlots.push(time);
            }
        }
    }

    initializeForm(): void {
        this.scheduleForm = this.fb.group({
            slotDuration: [30, Validators.required],
            workDays: this.fb.array([]),
            breaks: this.fb.array([]),
            blockedDates: this.fb.array([]),
            specialDates: this.fb.array([])
        });

        // Инициализируем дни недели
        this.weekDays.forEach(day => {
            this.addWorkDay(day.value);
        });

        // Добавляем стандартный обеденный перерыв
        this.addBreak();
    }

    // Work Days Management
    get workDaysArray(): FormArray {
        return this.scheduleForm.get('workDays') as FormArray;
    }

    addWorkDay(dayOfWeek: number): void {
        const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
        const workDay = this.fb.group({
            dayOfWeek: [dayOfWeek],
            enabled: [isWeekday],
            workHours: this.fb.array([
                this.createTimeRange(isWeekday ? '09:00' : '', isWeekday ? '18:00' : '')
            ]),
            breaks: this.fb.array([])
        });
        this.workDaysArray.push(workDay);
    }

    getWorkDay(index: number): FormGroup {
        return this.workDaysArray.at(index) as FormGroup;
    }

    getWorkHours(dayIndex: number): FormArray {
        return this.getWorkDay(dayIndex).get('workHours') as FormArray;
    }

    addWorkHourRange(dayIndex: number): void {
        const workHours = this.getWorkHours(dayIndex);
        workHours.push(this.createTimeRange('', ''));
    }

    removeWorkHourRange(dayIndex: number, rangeIndex: number): void {
        const workHours = this.getWorkHours(dayIndex);
        if (workHours.length > 1) {
            workHours.removeAt(rangeIndex);
        }
    }

    // Breaks Management
    get breaksArray(): FormArray {
        return this.scheduleForm.get('breaks') as FormArray;
    }

    addBreak(): void {
        const breakTime = this.fb.group({
            name: ['Обеденный перерыв', Validators.required],
            start: ['13:00', Validators.required],
            end: ['14:00', Validators.required],
            applyToDays: [[1, 2, 3, 4, 5]] // По умолчанию будние дни
        });
        this.breaksArray.push(breakTime);
    }

    removeBreak(index: number): void {
        this.breaksArray.removeAt(index);
    }

    // Special Dates Management
    get specialDatesArray(): FormArray {
        return this.scheduleForm.get('specialDates') as FormArray;
    }

    addSpecialDate(): void {
        const specialDate = this.fb.group({
            date: [null, Validators.required],
            type: ['holiday', Validators.required],
            description: ['', Validators.required],
            isFullDay: [true],
            timeRange: this.fb.group({
                start: [''],
                end: ['']
            })
        });
        this.specialDatesArray.push(specialDate);
    }

    removeSpecialDate(index: number): void {
        this.specialDatesArray.removeAt(index);
    }

    // Blocked Dates Management
    get blockedDatesArray(): FormArray {
        return this.scheduleForm.get('blockedDates') as FormArray;
    }

    addBlockedDate(): void {
        this.blockedDatesArray.push(this.fb.control(null, Validators.required));
    }

    removeBlockedDate(index: number): void {
        this.blockedDatesArray.removeAt(index);
    }

    // Helper Methods
    createTimeRange(start: string, end: string): FormGroup {
        return this.fb.group({
            start: [start, Validators.required],
            end: [end, Validators.required]
        });
    }

    copyToWeekdays(): void {
        const mondaySchedule = this.getWorkDay(0).value;
        for (let i = 1; i < 5; i++) {
            const day = this.getWorkDay(i);
            day.patchValue({
                enabled: mondaySchedule.enabled,
                workHours: mondaySchedule.workHours
            });
        }
    }

    applyTemplate(template: 'standard' | 'extended' | 'morning' | 'evening'): void {
        const templates = {
            standard: { start: '09:00', end: '18:00', break: { start: '13:00', end: '14:00' } },
            extended: { start: '08:00', end: '20:00', break: { start: '13:00', end: '14:00' } },
            morning: { start: '07:00', end: '14:00', break: { start: '11:00', end: '11:30' } },
            evening: { start: '14:00', end: '21:00', break: { start: '17:00', end: '17:30' } }
        };

        const selectedTemplate = templates[template];

        // Применяем к будним дням
        for (let i = 0; i < 5; i++) {
            const day = this.getWorkDay(i);
            day.patchValue({
                enabled: true,
                workHours: [{ start: selectedTemplate.start, end: selectedTemplate.end }]
            });
        }

        // Обновляем перерыв
        if (this.breaksArray.length > 0) {
            this.breaksArray.at(0).patchValue({
                start: selectedTemplate.break.start,
                end: selectedTemplate.break.end
            });
        }
    }

    calculateWorkHours(): number {
        let totalMinutes = 0;

        this.workDaysArray.controls.forEach(day => {
            if (day.get('enabled')?.value) {
                const workHours = day.get('workHours')?.value || [];
                workHours.forEach((range: TimeRange) => {
                    if (range.start && range.end) {
                        const start = this.timeToMinutes(range.start);
                        const end = this.timeToMinutes(range.end);
                        totalMinutes += (end - start);
                    }
                });

                // Вычитаем перерывы
                const breaks = this.breaksArray.value || [];
                breaks.forEach((breakTime: any) => {
                    if (breakTime.applyToDays.includes(day.get('dayOfWeek')?.value)) {
                        const start = this.timeToMinutes(breakTime.start);
                        const end = this.timeToMinutes(breakTime.end);
                        totalMinutes -= (end - start);
                    }
                });
            }
        });

        return Math.round(totalMinutes / 60);
    }

    timeToMinutes(time: string): number {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    saveSchedule(): void {
        if (this.scheduleForm.valid) {
            const config: ScheduleConfig = this.scheduleForm.value;
            this.scheduleChange.emit(config);
        }
    }

    loadScheduleConfig(config: ScheduleConfig): void {
        // Загружаем существующую конфигурацию
        this.scheduleForm.patchValue({
            slotDuration: config.slotDuration
        });

        // Загружаем остальные данные...
    }
}
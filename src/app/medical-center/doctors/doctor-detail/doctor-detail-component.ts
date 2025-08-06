import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FuseCardComponent } from '@fuse/components/card';
import { DoctorsService, Doctor } from '../doctors-service';

@Component({
    selector: 'app-doctor-detail',
    templateUrl: './doctor-detail-html.html',
    styleUrls: ['./doctor-detail-scss.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        MatIconModule,
        MatButtonModule,
        MatTabsModule,
        MatChipsModule,
        MatProgressBarModule,
        FuseCardComponent
    ]
})
export class DoctorDetailComponent implements OnInit {
    
    doctor: Doctor;
    
    // Mock schedule data
    schedule = {
        monday: [
            { time: '09:00', patient: 'Иван Петров', type: 'Первичный прием' },
            { time: '10:00', patient: 'Мария Сидорова', type: 'Повторный прием' },
            { time: '11:00', patient: null },
            { time: '12:00', patient: null },
            { time: '14:00', patient: 'Алексей Иванов', type: 'Консультация' },
            { time: '15:00', patient: null },
            { time: '16:00', patient: 'Елена Козлова', type: 'Первичный прием' },
            { time: '17:00', patient: null }
        ]
    };
    
    // Mock reviews
    reviews = [
        {
            id: 1,
            patientName: 'Анна К.',
            rating: 5,
            date: new Date('2024-01-15'),
            comment: 'Отличный врач! Очень внимательная и профессиональная. Все подробно объяснила и назначила эффективное лечение.'
        },
        {
            id: 2,
            patientName: 'Сергей М.',
            rating: 5,
            date: new Date('2024-01-10'),
            comment: 'Записывался на прием через приложение, все прошло отлично. Врач принял вовремя, был очень внимателен.'
        },
        {
            id: 3,
            patientName: 'Ольга П.',
            rating: 4,
            date: new Date('2024-01-05'),
            comment: 'Хороший специалист, но пришлось немного подождать. В целом довольна приемом.'
        }
    ];

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _doctorsService: DoctorsService
    ) {}

    ngOnInit(): void {
        const doctorId = parseInt(this._activatedRoute.snapshot.paramMap.get('id'));
        
        this._doctorsService.getDoctorById(doctorId).subscribe((doctor) => {
            this.doctor = doctor;
        });
    }
    
    getTimeSlotClass(slot: any): string {
        if (slot.patient) {
            return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
        }
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 cursor-pointer hover:bg-green-200 dark:hover:bg-green-900/30';
    }
}
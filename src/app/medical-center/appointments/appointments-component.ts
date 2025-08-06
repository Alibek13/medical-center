import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { FuseCardComponent } from '@fuse/components/card';

export interface Appointment {
    id: string;
    patientName: string;
    doctorName: string;
    doctorSpecialty: string;
    date: Date;
    time: string;
    status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
    price: string;
    phone: string;
    email: string;
}

@Component({
    selector: 'app-appointments',
    templateUrl: './appointments-html.html',
    styleUrls: ['./appointments-scss.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        MatIconModule,
        MatButtonModule,
        MatTableModule,
        MatChipsModule,
        MatMenuModule,
        MatTabsModule,
        FuseCardComponent
    ]
})
export class AppointmentsComponent implements OnInit {
    
    appointments: Appointment[] = [
        {
            id: 'APT-001',
            patientName: 'Иван Петров',
            doctorName: 'Абдурахманова Гулжан Жаксыгельдиевна',
            doctorSpecialty: 'Терапевт',
            date: new Date(),
            time: '09:00',
            status: 'confirmed',
            price: '12 000 ₸',
            phone: '+7 777 123 4567',
            email: 'ivan.petrov@email.com'
        },
        {
            id: 'APT-002',
            patientName: 'Мария Сидорова',
            doctorName: 'Нурлан Сагындыков',
            doctorSpecialty: 'Кардиолог',
            date: new Date(),
            time: '10:30',
            status: 'pending',
            price: '15 000 ₸',
            phone: '+7 777 234 5678',
            email: 'maria.sidorova@email.com'
        },
        {
            id: 'APT-003',
            patientName: 'Алексей Иванов',
            doctorName: 'Жанар Мустафина',
            doctorSpecialty: 'Невролог',
            date: new Date(new Date().setDate(new Date().getDate() - 1)),
            time: '14:00',
            status: 'completed',
            price: '14 000 ₸',
            phone: '+7 777 345 6789',
            email: 'alexey.ivanov@email.com'
        },
        {
            id: 'APT-004',
            patientName: 'Елена Козлова',
            doctorName: 'Айгерим Каримова',
            doctorSpecialty: 'Терапевт',
            date: new Date(),
            time: '15:30',
            status: 'confirmed',
            price: '12 000 ₸',
            phone: '+7 777 456 7890',
            email: 'elena.kozlova@email.com'
        }
    ];
    
    todayAppointments: Appointment[] = [];
    upcomingAppointments: Appointment[] = [];
    pastAppointments: Appointment[] = [];
    
    displayedColumns: string[] = ['id', 'patient', 'doctor', 'dateTime', 'status', 'actions'];

    constructor() {}

    ngOnInit(): void {
        this.filterAppointments();
    }
    
    filterAppointments(): void {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        this.todayAppointments = this.appointments.filter(apt => {
            const aptDate = new Date(apt.date);
            aptDate.setHours(0, 0, 0, 0);
            return aptDate.getTime() === today.getTime();
        });
        
        this.upcomingAppointments = this.appointments.filter(apt => {
            const aptDate = new Date(apt.date);
            aptDate.setHours(0, 0, 0, 0);
            return aptDate.getTime() >= tomorrow.getTime();
        });
        
        this.pastAppointments = this.appointments.filter(apt => {
            const aptDate = new Date(apt.date);
            aptDate.setHours(0, 0, 0, 0);
            return aptDate.getTime() < today.getTime();
        });
    }
    
    getStatusColor(status: string): string {
        switch(status) {
            case 'confirmed': return 'text-green-500';
            case 'pending': return 'text-orange-500';
            case 'cancelled': return 'text-red-500';
            case 'completed': return 'text-blue-500';
            default: return 'text-gray-500';
        }
    }
    
    getStatusText(status: string): string {
        switch(status) {
            case 'confirmed': return 'Подтверждено';
            case 'pending': return 'Ожидает';
            case 'cancelled': return 'Отменено';
            case 'completed': return 'Завершено';
            default: return status;
        }
    }
    
    cancelAppointment(appointment: Appointment): void {
        appointment.status = 'cancelled';
        this.filterAppointments();
    }
    
    confirmAppointment(appointment: Appointment): void {
        appointment.status = 'confirmed';
        this.filterAppointments();
    }
}
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseCardComponent } from '@fuse/components/card';

interface StatCard {
    title: string;
    value: number;
    icon: string;
    color: string;
    bgColor: string;
    change?: number;
}

interface Doctor {
    id: number;
    name: string;
    specialty: string;
    rating: number;
    reviews: number;
    price: string;
    avatar: string;
    nextSlot: string;
}

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard-html.html',
    styleUrls: ['./dashboard-scss.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
        MatProgressBarModule,
        MatTooltipModule,
        FuseCardComponent
    ]
})
export class DashboardComponent implements OnInit {
    today: Date = new Date();

    stats: StatCard[] = [
        {
            title: 'Всего врачей',
            value: 48,
            icon: 'group',
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
            change: 12
        },
        {
            title: 'Записей сегодня',
            value: 127,
            icon: 'event_available',
            color: 'text-green-600',
            bgColor: 'bg-green-100',
            change: 8
        },
        {
            title: 'Свободных слотов',
            value: 89,
            icon: 'schedule',
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
        },
        {
            title: 'Рейтинг клиники',
            value: 4.9,
            icon: 'star',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100'
        }
    ];

    popularDoctors: Doctor[] = [
        {
            id: 1,
            name: 'Айгерим Каримова',
            specialty: 'Терапевт',
            rating: 4.9,
            reviews: 127,
            price: '12 000 ₸',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=doctor1&backgroundColor=c7d2fe',
            nextSlot: 'Сегодня в 15:00'
        },
        {
            id: 2,
            name: 'Нурлан Сагындыков',
            specialty: 'Кардиолог',
            rating: 4.8,
            reviews: 89,
            price: '15 000 ₸',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=doctor2&backgroundColor=a5b4fc',
            nextSlot: 'Завтра в 10:00'
        },
        {
            id: 3,
            name: 'Жанар Мустафина',
            specialty: 'Невролог',
            rating: 5.0,
            reviews: 156,
            price: '14 000 ₸',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=doctor3&backgroundColor=e0e7ff',
            nextSlot: 'Сегодня в 17:30'
        }
    ];

    todayAppointments = [
        { time: '09:00', patient: 'Иван Петров', doctor: 'Айгерим Каримова' },
        { time: '10:30', patient: 'Мария Сидорова', doctor: 'Нурлан Сагындыков' },
        { time: '14:00', patient: 'Алексей Иванов', doctor: 'Жанар Мустафина' },
        { time: '15:30', patient: 'Елена Козлова', doctor: 'Айгерим Каримова' }
    ];

    constructor() {}

    ngOnInit(): void {
        // Load dashboard data
    }
}
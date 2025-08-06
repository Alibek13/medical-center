import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseCardComponent } from '@fuse/components/card';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

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
}

@Component({
    selector: 'app-doctors',
    templateUrl: './doctors-html.html',
    styleUrls: ['./doctors-scss.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterLink,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatChipsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatMenuModule,
        MatTooltipModule,
        FuseCardComponent
    ]
})
export class DoctorsComponent implements OnInit {

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    displayedColumns: string[] = ['doctor', 'specialty', 'rating', 'price', 'status', 'actions'];
    dataSource: MatTableDataSource<Doctor>;

    viewMode: 'grid' | 'list' = 'grid';
    searchQuery: string = '';
    selectedSpecialty: string = 'all';

    specialties: string[] = [
        'Терапевт',
        'Кардиолог',
        'Невролог',
        'ЛОР',
        'Окулист',
        'Хирург',
        'Гинеколог',
        'Дерматолог',
        'Стоматолог'
    ];

    doctors: Doctor[] = [
        {
            id: 1,
            name: 'Абдурахманова Гулжан Жаксыгельдиевна',
            specialty: 'Терапевт',
            experience: '15 лет стажа',
            rating: 4.9,
            reviews: 127,
            price: '12 000 ₸',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=doctor1&backgroundColor=c7d2fe',
            nextSlot: 'Сегодня в 15:00',
            status: 'available',
            email: 'a.karimova@medcenter.kz',
            phone: '+7 777 123 4567'
        },
        {
            id: 2,
            name: 'Нурлан Сагындыков',
            specialty: 'Кардиолог',
            experience: '20 лет стажа',
            rating: 4.8,
            reviews: 89,
            price: '15 000 ₸',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=doctor2&backgroundColor=a5b4fc',
            nextSlot: 'Завтра в 10:00',
            status: 'available',
            email: 'n.sagyndykov@medcenter.kz',
            phone: '+7 777 234 5678'
        },
        {
            id: 3,
            name: 'Жанар Мустафина',
            specialty: 'Невролог',
            experience: '12 лет стажа',
            rating: 5.0,
            reviews: 156,
            price: '14 000 ₸',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=doctor3&backgroundColor=e0e7ff',
            nextSlot: 'Сегодня в 17:30',
            status: 'busy',
            email: 'zh.mustafina@medcenter.kz',
            phone: '+7 777 345 6789'
        },
        {
            id: 4,
            name: 'Арман Байжанов',
            specialty: 'ЛОР',
            experience: '8 лет стажа',
            rating: 4.7,
            reviews: 64,
            price: '10 000 ₸',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=doctor4&backgroundColor=c7d2fe',
            nextSlot: 'Завтра в 14:00',
            status: 'available',
            email: 'a.baizhanov@medcenter.kz',
            phone: '+7 777 456 7890'
        },
        {
            id: 5,
            name: 'Гульнара Абдуллаева',
            specialty: 'Окулист',
            experience: '18 лет стажа',
            rating: 4.9,
            reviews: 203,
            price: '13 000 ₸',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=doctor5&backgroundColor=fce7f3',
            nextSlot: 'Сегодня в 16:00',
            status: 'available',
            email: 'g.abdullaeva@medcenter.kz',
            phone: '+7 777 567 8901'
        },
        {
            id: 6,
            name: 'Ержан Касымов',
            specialty: 'Хирург',
            experience: '25 лет стажа',
            rating: 5.0,
            reviews: 312,
            price: '20 000 ₸',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=doctor6&backgroundColor=ddd6fe',
            nextSlot: 'Завтра в 09:00',
            status: 'offline',
            email: 'e.kasymov@medcenter.kz',
            phone: '+7 777 678 9012'
        }
    ];

    constructor(private location: Location, private router: Router) {
        this.dataSource = new MatTableDataSource(this.doctors);
    }

    ngOnInit(): void {
        // Initialize
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    goBack(): void {
        this.router.navigate(['/medical-center/dashboard']);
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    filterBySpecialty(specialty: string) {
        if (specialty === 'all') {
            this.dataSource.data = this.doctors;
        } else {
            this.dataSource.data = this.doctors.filter(d => d.specialty === specialty);
        }
    }

    toggleViewMode() {
        this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'available': return 'text-green-500';
            case 'busy': return 'text-orange-500';
            case 'offline': return 'text-gray-500';
            default: return 'text-gray-500';
        }
    }

    getStatusText(status: string): string {
        switch (status) {
            case 'available': return 'Доступен';
            case 'busy': return 'Занят';
            case 'offline': return 'Не в сети';
            default: return '';
        }
    }
}
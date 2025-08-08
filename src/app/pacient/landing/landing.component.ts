// landing.component.ts
import {
    Component,
    OnInit,
    OnDestroy,
    HostListener,
    ViewEncapsulation
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subject, takeUntil } from 'rxjs';
import {
    trigger,
    state,
    style,
    animate,
    transition,
    query,
    stagger
} from '@angular/animations';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule
    ],
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: [
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('600ms ease-in', style({ opacity: 1 }))
            ])
        ]),
        trigger('fadeInUp', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(30px)' }),
                animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ]),
        trigger('slideDown', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(-20px)' }),
                animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ]),
        trigger('float', [
            state('*', style({ transform: 'translateY(0)' })),
            transition(':enter', [
                animate('3s ease-in-out', style({ transform: 'translateY(-10px)' })),
                animate('3s ease-in-out', style({ transform: 'translateY(0)' }))
            ])
        ]),
        trigger('counter', [
            transition(':enter', [
                style({ opacity: 0, transform: 'scale(0.5)' }),
                animate('600ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
            ])
        ])
    ]
})
export class LandingComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    isScrolled = false;
    isMobile = false;
    mobileMenuOpen = false;
    currentYear = new Date().getFullYear();

    features = [
        {
            icon: 'phone_android',
            title: 'Онлайн-запись',
            desc: 'Запишитесь на сайте в любое время - не нужно звонить и ждать на линии'
        },
        {
            icon: 'star',
            title: 'Опытные врачи',
            desc: 'Специалисты с большим стажем работы, которым доверяют тысячи пациентов'
        },
        {
            icon: 'receipt_long',
            title: 'Понятные цены',
            desc: 'Никаких сюрпризов - стоимость всех услуг указана в прайс-листе'
        },
        {
            icon: 'science',
            title: 'Качественные анализы',
            desc: 'Работаем с проверенной лабораторией AquaLab. Результаты в течение 1-3 дней'
        },
        {
            icon: 'access_time',
            title: 'Работаем каждый день',
            desc: 'Принимаем с понедельника по субботу. Есть вечерние часы приёма'
        },
        {
            icon: 'favorite',
            title: 'Забота о пациентах',
            desc: 'Внимательное отношение и индивидуальный подход к каждому'
        }
    ];

    stats = [
        { value: '15+', label: 'Лет заботы о здоровье' },
        { value: '10 000+', label: 'Довольных пациентов' },
        { value: '98%', label: 'Рекомендуют нас друзьям' }
    ];

    doctors = [
        {
            id: 1,
            name: 'Абдурахманова Гулжан Жаксыгельдиевна',
            specialty: 'Гинеколог',
            experience: 15
        },
        {
            id: 2,
            name: 'Абдурахманова Айнура Калыбековна',
            specialty: 'Гений',
            experience: 12
        },
        {
            id: 3,
            name: 'Калыбек Алинур Алибекович',
            specialty: 'Терапевт',
            experience: 20
        }
    ];

    constructor(private breakpointObserver: BreakpointObserver) { }

    @HostListener('window:scroll', [])
    onWindowScroll() {
        this.isScrolled = window.scrollY > 50;
    }

    ngOnInit(): void {
        // Проверка мобильного устройства
        this.breakpointObserver
            .observe(['(max-width: 768px)'])
            .pipe(takeUntil(this.destroy$))
            .subscribe(result => {
                this.isMobile = result.matches;
                if (!this.isMobile) {
                    this.mobileMenuOpen = false;
                }
            });

        // Инициализация анимаций при скролле
        this.initScrollAnimations();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    toggleMobileMenu(): void {
        this.mobileMenuOpen = !this.mobileMenuOpen;
    }

    scrollToSection(sectionId: string): void {
        const element = document.getElementById(sectionId);
        if (element) {
            const offset = 80;
            const targetPosition = element.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    private initScrollAnimations(): void {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        // Применяем наблюдатель после небольшой задержки
        setTimeout(() => {
            const elements = document.querySelectorAll('.animate-on-scroll');
            elements.forEach(el => observer.observe(el));
        }, 100);
    }
}
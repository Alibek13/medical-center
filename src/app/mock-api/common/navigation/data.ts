// src/app/mock-api/common/navigation/data.ts
/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id: 'medical-center',
        title: 'Медицинский центр',
        subtitle: 'Управление клиникой',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [
            {
                id: 'medical-center.dashboard',
                title: 'Панель управления',
                type: 'basic',
                icon: 'heroicons_outline:chart-pie',
                link: '/medical-center/dashboard'
            },
            {
                id: 'medical-center.doctors',
                title: 'Врачи',
                type: 'basic',
                icon: 'heroicons_outline:user-group',
                link: '/medical-center/doctors',
                badge: {
                    title: '5',
                    classes: 'px-2 bg-primary text-on-primary rounded-full'
                }
            },
            {
                id: 'medical-center.appointments',
                title: 'Записи на прием',
                type: 'basic',
                icon: 'heroicons_outline:calendar',
                link: '/medical-center/appointments'
            }
        ]
    },
    {
        id: 'patients',
        title: 'Пациенты',
        subtitle: 'Управление пациентами',
        type: 'group',
        icon: 'heroicons_outline:users',
        children: [
            {
                id: 'patients.booking',
                title: 'Запись на прием',
                type: 'basic',
                icon: 'heroicons_outline:calendar-days',
                link: '/booking'
            },
            {
                id: 'patients.list',
                title: 'База пациентов',
                type: 'basic',
                icon: 'heroicons_outline:identification',
                link: '/patients',
                badge: {
                    title: 'Скоро',
                    classes: 'px-2 bg-gray-300 text-gray-800 rounded-full'
                }
            }
        ]
    },
    {
        id: 'divider-1',
        type: 'divider'
    },
    {
        id: 'settings',
        title: 'Настройки',
        subtitle: 'Управление системой',
        type: 'group',
        icon: 'heroicons_outline:cog',
        children: [
            {
                id: 'settings.profile',
                title: 'Профиль',
                type: 'basic',
                icon: 'heroicons_outline:user-circle',
                link: '/settings/profile'
            },
            {
                id: 'settings.security',
                title: 'Безопасность',
                type: 'basic',
                icon: 'heroicons_outline:lock-closed',
                link: '/settings/security'
            }
        ]
    }
];

export const compactNavigation: FuseNavigationItem[] = [
    {
        id: 'medical-center.dashboard',
        title: 'Панель',
        tooltip: 'Панель управления',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/medical-center/dashboard'
    },
    {
        id: 'medical-center.doctors',
        title: 'Врачи',
        tooltip: 'Управление врачами',
        type: 'basic',
        icon: 'heroicons_outline:user-group',
        link: '/medical-center/doctors'
    },
    {
        id: 'medical-center.appointments',
        title: 'Записи',
        tooltip: 'Записи на прием',
        type: 'basic',
        icon: 'heroicons_outline:calendar',
        link: '/medical-center/appointments'
    },
    {
        id: 'divider-1',
        type: 'divider'
    },
    {
        id: 'patients.booking',
        title: 'Запись',
        tooltip: 'Запись пациентов',
        type: 'basic',
        icon: 'heroicons_outline:calendar-days',
        link: '/booking'
    }
];

export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id: 'medical-center',
        title: 'МЕДЦЕНТР',
        type: 'group',
        children: [
            {
                id: 'medical-center.dashboard',
                title: 'Панель управления',
                type: 'basic',
                icon: 'heroicons_outline:chart-pie',
                link: '/medical-center/dashboard'
            },
            {
                id: 'medical-center.doctors',
                title: 'Врачи',
                type: 'basic',
                icon: 'heroicons_outline:user-group',
                link: '/medical-center/doctors'
            },
            {
                id: 'medical-center.appointments',
                title: 'Записи',
                type: 'basic',
                icon: 'heroicons_outline:calendar',
                link: '/medical-center/appointments'
            }
        ]
    },
    {
        id: 'patients',
        title: 'ПАЦИЕНТЫ',
        type: 'group',
        children: [
            {
                id: 'patients.booking',
                title: 'Запись на прием',
                type: 'basic',
                icon: 'heroicons_outline:calendar-days',
                link: '/booking'
            }
        ]
    }
];

export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id: 'medical-center',
        title: 'Медцентр',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [
            {
                id: 'medical-center.dashboard',
                title: 'Панель управления',
                type: 'basic',
                icon: 'heroicons_outline:chart-pie',
                link: '/medical-center/dashboard'
            },
            {
                id: 'medical-center.doctors',
                title: 'Врачи',
                type: 'basic',
                icon: 'heroicons_outline:user-group',
                link: '/medical-center/doctors'
            },
            {
                id: 'medical-center.appointments',
                title: 'Записи на прием',
                type: 'basic',
                icon: 'heroicons_outline:calendar',
                link: '/medical-center/appointments'
            }
        ]
    },
    {
        id: 'patients',
        title: 'Пациенты',
        type: 'group',
        icon: 'heroicons_outline:users',
        children: [
            {
                id: 'patients.booking',
                title: 'Запись',
                type: 'basic',
                icon: 'heroicons_outline:calendar-days',
                link: '/booking'
            }
        ]
    }
];
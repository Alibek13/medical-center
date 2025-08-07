import { Routes } from '@angular/router';
import { MedicalCenterComponent } from '../medical-center/medical-center-component';

export default [
    {
        path: '',
        component: MedicalCenterComponent,
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                loadComponent: () => import('../medical-center/dashboard/dashboard-component').then(m => m.DashboardComponent)
            },
            {
                path: 'doctors',
                children: [
                    {
                        path: '',
                        loadComponent: () => import('../medical-center/doctors/doctors-component').then(m => m.DoctorsComponent)
                    },
                    {
                        path: ':id',
                        loadComponent: () => import('../medical-center/doctors/doctor-detail/doctor-detail-component').then(m => m.DoctorDetailComponent)
                    }
                ]
            },
            {
                path: 'appointments',
                children: [
                    {
                        path: '',
                        loadComponent: () => import('../medical-center/appointments/appointments-component').then(m => m.AppointmentsComponent)
                    },
                    {
                        path: 'booking',
                        loadComponent: () => import('../medical-center/appointments/booking/booking-component').then(m => m.BookingComponent)
                    },
                    {
                        path: 'booking/:doctorId',
                        loadComponent: () => import('../medical-center/appointments/booking/booking-component').then(m => m.BookingComponent)
                    }
                ]
            }
        ]
    }
] as Routes;
import { Routes } from '@angular/router';
import { PacientBookingComponent } from './pacient-booking.component';

/** Lazy‑роут: /booking  (layout 'empty' = без сайд‑бара Fuse) */
export const PACIENT_BOOKING_ROUTES: Routes = [
  {
    path: '',
    component: PacientBookingComponent,
    data: { layout: 'empty' }
  }
];
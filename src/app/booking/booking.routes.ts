import { Routes } from '@angular/router';
import { BookingComponent } from './booking.component';

/** Lazy‑роут: /booking  (layout 'empty' = без сайд‑бара Fuse) */
export const PATIENT_BOOKING_ROUTES: Routes = [
  {
    path: '',
    component: BookingComponent,
    data: { layout: 'empty' }
  }
];
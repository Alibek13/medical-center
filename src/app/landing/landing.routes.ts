import { Routes } from '@angular/router';
import { LandingComponent } from './landing.component';

/**
 * Регистрируем лендинг как отдельный lazy‑модуль.
 * В Fuse укажите layout 'empty', чтобы не подгружать сайд‑бар медицинского центра.
 */
export const LANDING_ROUTES: Routes = [
  {
    path: '',
    component: LandingComponent,
    data: { layout: 'empty' }   // <‑‑ берёт «пустой» шаблон из Fuse
  }
];
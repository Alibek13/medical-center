// app.routes.ts
import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';

/* eslint-disable max-len */

export const appRoutes: Route[] = [

    /* ─────────────────────────────────────────────
     * PUBLIC (no auth)
     * ──────────────────────────────────────────── */

    // 1. Landing = корень сайта
    {
        path: '',
        component: LayoutComponent,
        data: { layout: 'empty' },
        children: [
            {
                path: 'landing',
                loadChildren: () =>
                    import('./landing/landing.routes').then(m => m.LANDING_ROUTES)
            }
        ]
    },

    // 2. Auth routes (sign‑in, sign‑up, …) доступны только гостям
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: { layout: 'empty' },
        children: [
            { path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.routes') },
            { path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.routes') },
            { path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.routes') },
            { path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes') },
            { path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.routes') }
        ]
    },

    /* ─────────────────────────────────────────────
     * AUTH ONLY
     * ──────────────────────────────────────────── */

    // 3. Redirect после успешного логина
    { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'medical-center' },

    // 4. Auth‑user‑only routes (sign‑out, unlock)
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: { layout: 'empty' },
        children: [
            { path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes') },
            { path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.routes') }
        ]
    },

    // 5. Медицинский центр (CRM)
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: { initialData: initialDataResolver },
        children: [
            {
                path: 'medical-center',
                loadChildren: () => import('./medical-center/medical-center-routes')
            },
            // Пример “Admin/Example” модуля – можно оставить или удалить
            {
                path: 'example',
                loadChildren: () => import('app/modules/admin/example/example.routes')
            }
        ]
    },

    {
        path: 'booking',
        loadChildren: () =>
            import('../app/booking/booking.routes').then(m => m.PATIENT_BOOKING_ROUTES)
    },

    /* ─────────────────────────────────────────────
     * FALLBACK
     * ──────────────────────────────────────────── */

    // 404
    //   {
    //     path: '**',
    //     component: LayoutComponent,
    //     data: { layout: 'empty' },
    //     children: [
    //       {
    //         path: '',
    //         loadComponent: () => import('app/pages/errors/error-404.component')
    //                            .then(m => m.Error404Component)
    //       }
    //     ]
    //   }
];
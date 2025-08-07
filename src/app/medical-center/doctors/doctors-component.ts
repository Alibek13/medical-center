// src/app/medical-center/doctors/doctors-component.ts
import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit } from '@angular/core';
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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FuseCardComponent } from '@fuse/components/card';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Doctor, DoctorsService } from '../services/doctors-service';
import { DoctorFormDialogComponent } from '../doctors/doctors-form-dialog/doctor-form-dialog-component';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from 'app/core/user/user.service';

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
        MatDialogModule,
        MatSnackBarModule,
        FuseCardComponent
    ]
})
export class DoctorsComponent implements OnInit, AfterViewInit {

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    displayedColumns: string[] = ['doctor', 'specialty', 'rating', 'price', 'actions'];
    dataSource!: MatTableDataSource<Doctor>;

    viewMode: 'grid' | 'list' = 'grid';

    // Admin mode toggle
    isAdminMode: boolean = false;
    userRole: string = '';

    doctors: Doctor[] = [];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private location: Location,
        private router: Router,
        private _doctorsService: DoctorsService,
        private _dialog: MatDialog,
        private _snackBar: MatSnackBar,
        private _userService: UserService
    ) {
        this.dataSource = new MatTableDataSource<Doctor>([]);
    }

    ngOnInit(): void {
        // Check user role for admin features
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: any) => {
                this.userRole = user?.role || '';
                // this.isAdminMode = this.userRole === 'admin' || this.userRole === 'manager';
                this.isAdminMode = true
                this.updateTableColumns();
            });

        // Load doctors from service
        this._doctorsService.doctors$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((doctors: Doctor[]) => {
                this.doctors = doctors;
                this.dataSource.data = doctors;
            });

        // Initial load
        this._doctorsService.getDoctors().subscribe();
    }

    ngAfterViewInit(): void {
        if (this.paginator) {
            this.dataSource.paginator = this.paginator;
        }
        if (this.sort) {
            this.dataSource.sort = this.sort;
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // Update table columns based on admin mode
    updateTableColumns(): void {
        if (this.isAdminMode) {
            this.displayedColumns = ['doctor', 'specialty', 'rating', 'price', 'adminActions'];
        } else {
            this.displayedColumns = ['doctor', 'specialty', 'rating', 'price', 'actions'];
        }
    }

    goBack(): void {
        this.router.navigate(['/medical-center/dashboard']);
    }

    toggleViewMode(): void {
        this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
    }

    // CRUD Operations (Admin only)

    createDoctor(): void {
        const dialogRef = this._dialog.open(DoctorFormDialogComponent, {
            width: '900px',
            maxHeight: '90vh',
            data: { doctor: null, mode: 'create' }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this._doctorsService.createDoctor(result).subscribe({
                    next: (doctor) => {
                        this._snackBar.open('Доктор успешно добавлен', 'Закрыть', {
                            duration: 3000,
                            horizontalPosition: 'end',
                            verticalPosition: 'top',
                            panelClass: ['success-snackbar']
                        });
                    },
                    error: (error) => {
                        this._snackBar.open('Ошибка при добавлении доктора', 'Закрыть', {
                            duration: 3000,
                            panelClass: ['error-snackbar']
                        });
                    }
                });
            }
        });
    }

    editDoctor(doctor: Doctor): void {
        const dialogRef = this._dialog.open(DoctorFormDialogComponent, {
            width: '900px',
            maxHeight: '90vh',
            data: { doctor: { ...doctor }, mode: 'edit' }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this._doctorsService.updateDoctor(doctor.id, result).subscribe({
                    next: (updatedDoctor) => {
                        this._snackBar.open('Данные доктора обновлены', 'Закрыть', {
                            duration: 3000,
                            panelClass: ['success-snackbar']
                        });
                    },
                    error: (error) => {
                        this._snackBar.open('Ошибка при обновлении данных', 'Закрыть', {
                            duration: 3000,
                            panelClass: ['error-snackbar']
                        });
                    }
                });
            }
        });
    }

    deleteDoctor(doctor: Doctor): void {
        if (confirm(`Вы уверены, что хотите удалить доктора ${doctor.name}?\n\nЭто действие нельзя отменить.`)) {
            this._doctorsService.deleteDoctor(doctor.id).subscribe({
                next: () => {
                    this._snackBar.open('Доктор удален', 'Закрыть', {
                        duration: 3000,
                        panelClass: ['warning-snackbar']
                    });
                },
                error: (error) => {
                    this._snackBar.open('Ошибка при удалении доктора', 'Закрыть', {
                        duration: 3000,
                        panelClass: ['error-snackbar']
                    });
                }
            });
        }
    }

    viewDoctor(doctor: Doctor): void {
        this.router.navigate(['/medical-center/doctors', doctor.id]);
    }

    bookAppointment(doctorId: number): void {
        this.router.navigate(['/medical-center/appointments/booking', doctorId]);
    }

    // Helper method для обработки ошибки загрузки изображения
    onImageError(event: any, doctorName: string): void {
        const colors = ['6366f1', 'ec4899', '10b981', 'f59e0b', '8b5cf6', '06b6d4', 'ef4444'];
        const hash = doctorName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const color = colors[hash % colors.length];
        const encodedName = encodeURIComponent(doctorName);
        event.target.src = `https://ui-avatars.com/api/?name=${encodedName}&background=${color}&color=fff&size=200&rounded=true&bold=true`;
    }
}
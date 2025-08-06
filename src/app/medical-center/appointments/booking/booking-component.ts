import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FuseCardComponent } from '@fuse/components/card';
import { FuseAlertComponent } from '@fuse/components/alert';
import { DoctorsService, Doctor, TimeSlot } from '../../services/doctors-service';

@Component({
    selector: 'app-booking',
    templateUrl: './booking-html.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatSelectModule,
        MatCheckboxModule,
        MatStepperModule,
        MatRadioModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        FuseCardComponent,
        FuseAlertComponent
    ]
})
export class BookingComponent implements OnInit {
    
    doctor: Doctor | null = null;
    doctors: Doctor[] = [];
    dateForm: FormGroup;
    patientForm: FormGroup;
    confirmForm: FormGroup;
    
    timeSlots: TimeSlot[] = [];
    selectedDate: any = null;
    selectedTime: string = '';
    
    isLoading: boolean = false;

    constructor(
        private _formBuilder: FormBuilder,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _doctorsService: DoctorsService,
        private _snackBar: MatSnackBar
    ) {
        // Initialize forms
        this.dateForm = this._formBuilder.group({
            date: ['', Validators.required],
            time: ['', Validators.required]
        });
        
        this.patientForm = this._formBuilder.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{10,}$/)]],
            email: ['', [Validators.required, Validators.email]],
            birthDate: ['', Validators.required],
            gender: ['', Validators.required],
            comment: ['']
        });
        
        this.confirmForm = this._formBuilder.group({
            consent: [false, Validators.requiredTrue]
        });
    }

    ngOnInit(): void {
        // Get doctor ID from route params (if exists)
        const doctorId = this._activatedRoute.snapshot.paramMap.get('doctorId');
        
        if (doctorId) {
            // Load specific doctor data
            this._doctorsService.getDoctorById(parseInt(doctorId)).subscribe((doctor) => {
                if (!doctor) {
                    this._router.navigate(['/medical-center/doctors']);
                    return;
                }
                console.log("asdf", doctor)
                this.doctor = doctor;
            });
        } else {
            // No doctor selected - redirect to doctors list
            this._router.navigate(['/medical-center/doctors']);
        }
    }

    onDateChange(dateValue: any): void {
        if (!dateValue || !this.doctor) return;
        
        this.selectedDate = dateValue;
        this.isLoading = true;
        
        // Convert Luxon DateTime to JS Date if needed
        const jsDate = dateValue.toJSDate ? dateValue.toJSDate() : dateValue;
        
        // Load available time slots for selected date
        this._doctorsService.getAvailableTimeSlots(this.doctor.id, jsDate)
            .subscribe((slots) => {
                this.timeSlots = slots;
                this.isLoading = false;
                
                // Reset time selection
                this.dateForm.get('time')?.setValue('');
                this.selectedTime = '';
            });
    }

    onTimeSelect(time: string): void {
        this.selectedTime = time;
        this.dateForm.get('time')?.setValue(time);
    }

    submitBooking(): void {
        if (this.dateForm.invalid || this.patientForm.invalid || this.confirmForm.invalid || !this.doctor) {
            return;
        }
        
        this.isLoading = true;
        
        const bookingData = {
            doctorId: this.doctor.id,
            date: this.selectedDate,
            time: this.selectedTime,
            patient: this.patientForm.value
        };
        
        // Simulate API call
        setTimeout(() => {
            this.isLoading = false;
            
            // Show success message
            this._snackBar.open(
                `Запись подтверждена! ${this.formatDate(this.selectedDate)} в ${this.selectedTime}`,
                'OK',
                {
                    duration: 5000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top'
                }
            );
            
            // Navigate to appointments
            this._router.navigate(['/medical-center/appointments']);
        }, 1500);
    }

    formatDate(date: any): string {
        if (!date) return '';
        
        try {
            // If it's a Luxon DateTime
            if (date.toFormat) {
                return date.setLocale('ru').toFormat('d MMMM');
            }
            
            // If it's a JS Date
            if (date instanceof Date) {
                const options: Intl.DateTimeFormatOptions = { 
                    day: 'numeric', 
                    month: 'long' 
                };
                return date.toLocaleDateString('ru-RU', options);
            }
            
            // Convert to JS Date if possible
            const jsDate = date.toJSDate ? date.toJSDate() : new Date(date);
            const options: Intl.DateTimeFormatOptions = { 
                day: 'numeric', 
                month: 'long' 
            };
            return jsDate.toLocaleDateString('ru-RU', options);
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    }

    getTimeSlotClass(slot: TimeSlot): string {
        if (!slot.available) {
            return 'time-slot-disabled';
        }
        if (slot.time === this.selectedTime) {
            return 'time-slot-selected';
        }
        return 'time-slot-available';
    }
}
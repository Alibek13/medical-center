import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-medical-center',
    templateUrl: './medical-center-html.html',
    styleUrls: ['./medical-center-scss.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [RouterOutlet]
})
export class MedicalCenterComponent {
    constructor() {}
}
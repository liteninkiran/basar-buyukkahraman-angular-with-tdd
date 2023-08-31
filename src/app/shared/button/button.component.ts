import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-button',
    templateUrl: './button.component.html',
    styles: [
    ],
})
export class ButtonComponent implements OnInit {

    @Input() public disabled = false;
    @Input() public apiProgress = false;

    constructor() { }

    public ngOnInit(): void {
    }

}

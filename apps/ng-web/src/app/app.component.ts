import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import {
  COLOR_GRID_ITEMS,
  ColorGridSelectComponent,
} from '@brew/ng/ui/components';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    JsonPipe,

    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,

    ColorGridSelectComponent,
  ],
  selector: 'brew-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {

  COLOR_GRID_ITEMS = [
    'rgb(255, 0, 0)', // Red
    'rgb(0, 255, 0)', // Lime
    'rgb(0, 0, 255)', // Blue
    'rgb(255, 255, 0)', // Yellow
    'rgb(0, 255, 255)', // Cyan
    'rgb(255, 0, 255)', // Magenta
    'rgb(192, 192, 192)', // Silver
    'rgb(128, 128, 128)', // Gray
    'rgb(128, 0, 0)', // Maroon
    'rgb(128, 128, 0)', // Olive
    'rgb(0, 128, 0)', // Green
    'rgb(128, 0, 128)', // Purple
    'rgb(0, 128, 128)', // Teal
    'rgb(0, 0, 128)', // Navy
    'rgb(255, 165, 0)', // Orange
    'rgb(255, 105, 180)', // Hot Pink
    'rgb(75, 0, 130)', // Indigo
    'rgb(240, 128, 128)', // Light Coral
    'rgb(32, 178, 170)', // Light Sea Green
    'rgb(255, 222, 173)', // Navajo White

    'rgb(192, 192, 193)',
  'rgb(128, 128, 129)', 
  'rgb(128, 0, 1)', 
  'rgb(128, 128, 1)', 
  'rgb(0, 128, 1)', 
  'rgb(128, 0, 129)', 
  'rgb(0, 129, 128)', 
  'rgb(0, 1, 128)',
  'rgb(275, 165, 0)',
  'rgb(253, 105, 180)', 
  'rgb(73, 1, 130)', 
  'rgb(241, 128, 128)', 
  'rgb(33, 178, 170)', 
  'rgb(257, 222, 173)', 

  'rgb(195, 192, 193)',
  'rgb(124, 128, 129)', 
  'rgb(128, 9, 3)', 
  'rgb(128, 125, 5)', 
  'rgb(0, 129, 1)', 
  'rgb(129, 2, 129)', 
  'rgb(0, 199, 128)', 
  'rgb(2, 1, 128)',
  'rgb(175, 135, 0)',
  'rgb(253, 195, 180)', 
  'rgb(73, 7, 130)', 
  'rgb(241, 129, 128)', 
  'rgb(33, 180, 170)', 
  'rgb(257, 333, 173)',
  ];

  COLOR_GRID_ITEM_SIZES = ['small', 'medium', 'large']
  private readonly _fb = inject(FormBuilder);

  public readonly form = this._fb.group({
    search: this._fb.control(''),
    color: this._fb.control('', {
      validators: [Validators.required],
    }),
  });
}

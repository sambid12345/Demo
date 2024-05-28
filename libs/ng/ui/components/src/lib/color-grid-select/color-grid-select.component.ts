import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  InputSignal,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChildren,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  // COLOR_GRID_ITEMS,
  COLOR_GRID_ITEM_SIZES,
  ColorGridItemSize,
  ColorGridItemComponent,
  ColorGridSelect,
  COLOR_GRID_SELECT,
} from './item';
import { FocusKeyManager } from '@angular/cdk/a11y';
import {
  DOWN_ARROW,
  LEFT_ARROW,
  RIGHT_ARROW,
  UP_ARROW,
} from '@angular/cdk/keycodes';
import { chunk } from 'lodash';
import { _getFocusedElementPierceShadowDom } from '@angular/cdk/platform';
import { Subject, takeUntil } from 'rxjs';

/**
 *
 * A lot of the code has been inspired by
 * [MatSelectionList](https://github.com/angular/components/blob/main/src/material/list/selection-list.ts)
 * for focus management and accessibility.
 *
 * @todo
 * - Handle {@link ColorGridSelectComponent._onKeydown}
 * - Calculate {@link ColorGridSelectComponent.grid}
 *
 * @link https://blog.angular-university.io/angular-custom-form-controls/
 */
@Component({
  selector: 'brew-color-grid-select',
  standalone: true,
  imports: [CommonModule, ColorGridItemComponent],
  templateUrl: './color-grid-select.component.html',
  styleUrl: './color-grid-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: ColorGridSelectComponent,
    },
    {
      provide: COLOR_GRID_SELECT,
      useExisting: ColorGridSelectComponent,
    },
  ],
})
export class ColorGridSelectComponent
  implements ControlValueAccessor, ColorGridSelect, AfterViewInit, OnDestroy, OnInit
{

 
  /** Emits when the list has been destroyed. */
  private readonly _destroyed = new Subject<void>();

  // private readonly _items = signal(COLOR_GRID_ITEMS);

  readonly items = input<string[]>([]);

  
  // private readonly _itemSize = signal<ColorGridItemSize>(
  //   COLOR_GRID_ITEM_SIZES[0]
  // );

  readonly itemSize = input<string>('');

  private readonly _el = inject(ElementRef<ColorGridSelectComponent>);

  private readonly _ngZone = inject(NgZone);

  private _itemsPerRow = 5;

  private _keyManager!: FocusKeyManager<ColorGridItemComponent>;

  private _value?: string | null | undefined = this.items()[0];

  private _disabled = false;
  private _touched = false;

  private _onTouched = (): void => void 0;
  private _onChange = (val?: string | null): void => void 0;

  @HostBinding('attr.tabindex')
  private get _tabIndex() {
    return -1;
    // return this.disabled ? -1 : 0;
  }

  @HostBinding('role')
  private get _role() {
    return 'radiogroup';
  }

  @ViewChildren(ColorGridItemComponent)
  public colorItems!: QueryList<ColorGridItemComponent>;

  // @Input()
  // public set items(value) {colorItems
  //   this._items.set(value);
  // }

  // public get items() {
  //   return this._items();
  // }

  // @Input()
  // public get itemSize(): ColorGridItemSize {
  //   return this._itemSize();
  // }

  // public set itemSize(value: ColorGridItemSize) {
  //   this._itemSize.set(value);
  // }

  @Input()
  public get value(): string | null | undefined {
    return this._value;
  }

  public set value(value: string | null | undefined) {
    this._value = value;
    // this._updateKeyManagerActiveItem();
  }

  @Input()
  public disabled = false;

  @Output()
  public readonly valueChange = new EventEmitter<string | null | undefined>();

  public getScreenWidth: any;

  public cGrid: any = [];

  gridItems!: string[][];

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.getScreenWidth = window.innerWidth;
    this.grid(window.innerWidth);
    
  }
  ngOnInit(){
    this.getScreenWidth = window.innerWidth;
    this.grid(window.innerWidth);
  }

  public grid(availableWidth: number){
    console.log('current width', availableWidth);
    const ITEM_SIZE = this.itemSize() === 'small' ? 32: (this.itemSize() ==='medium' ? 40 : 48);
    const itemsPerRow = Math.floor(availableWidth / ITEM_SIZE);
    this._itemsPerRow = itemsPerRow;
    this.gridItems =  chunk(this.items(), itemsPerRow);
  }

  /** @todo logic to generate a grid of colors to allow navigation */
  // public readonly grid = computed((): string[][] => {
  //   console.log('current width', this.getScreenWidth);
  //   const availableWidth = this.getScreenWidth;
  //   const ITEM_SIZE = this.itemSize() === 'small' ? 32: (this.itemSize() ==='medium' ? 40 : 48)
  //   const itemsPerRow = Math.floor(availableWidth / ITEM_SIZE);
    
  //   console.log(chunk(this.items(), itemsPerRow));

  //   return chunk(this.items(), itemsPerRow);
  // });

  public get keyMan() {
    return this._keyManager;
  }

  // ControlValueAccessor
  public writeValue(val: string): void {
    this.value = val;
  }

  public registerOnChange(onChange: (val?: string | null) => void): void {
    this._onChange = onChange;
  }

  public registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this._disabled = isDisabled;
  }
  // /ControlValueAccessor

  /** Marks the component as touched */
  public markAsTouched() {
    if (!this._touched) {
      this._onTouched();
      this._touched = true;
    }
  }

  public emitChange(value?: string | null | undefined) {
    this.markAsTouched();

    if (!this._disabled) {
      this.value = value;
      this._onChange(this.value);
      this.valueChange.emit(value);
    }
  }

  public ngAfterViewInit() {
    this._keyManager = new FocusKeyManager(this.colorItems)
      .withHomeAndEnd()
      .withHorizontalOrientation('ltr')
      .skipPredicate(() => this.disabled)
      .withWrap();

    // Set the initial focus.
    this._resetActiveOption();

    // Move the tabindex to the currently-focused list item.
    // this._keyManager.change.subscribe((activeItemIndex) => {
    // this._setActiveOption(activeItemIndex);
    // });

    // If the active item is removed from the list, reset back to the first one.
    this.colorItems.changes.pipe(takeUntil(this._destroyed)).subscribe(() => {
      const activeItem = this._keyManager.activeItem;

      if (!activeItem || this.colorItems.toArray().indexOf(activeItem) === -1) {
        this._resetActiveOption();
      }
    });

    // These events are bound outside the zone, because they don't change
    // any change-detected properties and they can trigger timeouts.
    this._ngZone.runOutsideAngular(() => {
      this._el.nativeElement.addEventListener('focusin', this._handleFocusin);
      this._el.nativeElement.addEventListener('focusout', this._handleFocusout);
    });
  }

  public ngOnDestroy() {
    this._keyManager.destroy();
    this._el.nativeElement.removeEventListener('focusin', this._handleFocusin);
    this._el.nativeElement.removeEventListener(
      'focusout',
      this._handleFocusout
    );

    this._destroyed.next();
    this._destroyed.complete();
  }

  /**
   * @todo
   * The logic to decide how to navigate inside the grid when the
   * up, down, left and right buttons are pressed
   */
 
  @HostListener('keydown', ['$event'])
  private _onKeydown(event: KeyboardEvent) {
    switch (event.keyCode) {

      case 37:{  // LEFT KEY
        const currentIndex = this.colorItems.toArray().findIndex(item => item.value === this.value);
        const previousItemIndex = currentIndex - 1;
        const isStartOfRow = currentIndex % this._itemsPerRow === 0;

        if (isStartOfRow && previousItemIndex >= 0) {
          
          this.emitChange(this.colorItems.toArray()[previousItemIndex].value);
        } else if (previousItemIndex >= 0) {
         
          this.emitChange(this.colorItems.toArray()[previousItemIndex].value);
        }
        break;
      }

      case 38:{  // UP KEY

        const currentIndex = this.colorItems.toArray().findIndex(item => item.value === this.value);
        const currentRow = Math.floor(currentIndex / this._itemsPerRow);

        let targetIndex = currentIndex - this._itemsPerRow;

        if (currentRow === 0) {
       
          const no_of_rows = Math.ceil( this.colorItems.length / this._itemsPerRow );
          const lastRowItemIndex = currentIndex + ((no_of_rows-1) * this._itemsPerRow);
          if(lastRowItemIndex <= this.colorItems.length-1)
            targetIndex = lastRowItemIndex;
        }
        if(targetIndex >=0 && targetIndex < this.colorItems.length){
          this.emitChange(this.colorItems.toArray()[targetIndex]?.value);
        }

        break;
      }

      case 39: { // RIGHT KEY
        const currentIndex = this.colorItems.toArray().findIndex(item => item.value === this.value);
        const nextItemIndex = currentIndex + 1;
        const isEndOfRow = nextItemIndex % this._itemsPerRow === 0; 

        if (isEndOfRow && nextItemIndex < this.colorItems.length) {
         
          this.emitChange(this.colorItems.toArray()[nextItemIndex].value);
        } else if (nextItemIndex < this.colorItems.length) {
          
          this.emitChange(this.colorItems.toArray()[nextItemIndex].value);
        }
 
        break;
      }

      case 40:{  //DOWN KEY
        const currentIndex = this.colorItems.toArray().findIndex(item => item.value === this.value);
        const nextRowItemIndex = currentIndex + this._itemsPerRow;
        if (nextRowItemIndex < this.colorItems.length) {
          this.emitChange(this.colorItems.toArray()[nextRowItemIndex].value);
        } else {
          const firstColumnItemIndex = currentIndex % this._itemsPerRow;
          this.emitChange(this.colorItems.toArray()[firstColumnItemIndex].value);
        }
      
        break;
      }
    }
  }

  /** Handles focusout events within the list. */
  private _handleFocusout = () => {
    // Focus takes a while to update so we have to wrap our call in a timeout.
    setTimeout(() => {
      if (!this._containsFocus()) {
        this._resetActiveOption();
      }
    });
  };

  /** Handles focusin events within the list. */
  private _handleFocusin = (event: FocusEvent) => {
    if (this.disabled) {
      return;
    }

    const activeIndex = this.colorItems
      .toArray()
      .findIndex((item) =>
        item.elRef.nativeElement.contains(event.target as HTMLElement)
      );

    if (activeIndex > -1) {
      this._setActiveOption(activeIndex);
    } else {
      this._resetActiveOption();
    }
  };

  /**
   * Sets an option as active.
   * @param index Index of the active option. If set to -1, no option will be active.
   */
  private _setActiveOption(index: number) {
    this.colorItems.forEach((item, itemIndex) =>
      item.setTabindex(itemIndex === index ? 0 : -1)
    );

    this._keyManager.updateActiveItem(index);
  }

  /**
   * Resets the active option. When the list is disabled, remove all options from to the tab order.
   * Otherwise, focus the first selected option.
   */
  private _resetActiveOption() {
    if (this.disabled) {
      this._setActiveOption(-1);
      return;
    }

    const activeItem =
      this.colorItems.find((item) => item.checked && !item.disabled) ||
      this.colorItems.first;

    const index = activeItem
      ? this.colorItems.toArray().indexOf(activeItem)
      : -1;

    this._setActiveOption(index);
  }

  /** Returns whether the focus is currently within the list. */
  private _containsFocus() {
    const activeElement = _getFocusedElementPierceShadowDom();
    return activeElement && this._el.nativeElement.contains(activeElement);
  }
}

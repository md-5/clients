import {
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  NgZone,
  Optional,
  Self,
} from "@angular/core";
import { NgControl, Validators } from "@angular/forms";

// Increments for each instance of this component
let nextId = 0;

@Directive({
  selector: "input[toolsSlider]",
  standalone: true,
})
export class ToolsSliderDirective {
  @HostBinding("class") @Input() get classList() {
    return [
      "tw-block",
      "tw-w-full",
      this.hasError ? "tools-range-danger-600" : "tools-range-primary-600",
      "focus:tools-range-primary-700",
      "disabled:tools-range-secondary-600",
    ].filter((s) => s != "");
  }

  @HostBinding() @Input() id = `tools-slider-${nextId++}`;

  @HostBinding("attr.aria-describedby") ariaDescribedBy: string;

  @HostBinding("attr.aria-invalid") get ariaInvalid() {
    return this.hasError ? true : undefined;
  }

  @HostBinding("attr.type") @Input() type: string = "range";

  @HostBinding()
  @Input()
  get required() {
    return this._required ?? this.ngControl?.control?.hasValidator(Validators.required) ?? false;
  }
  set required(value: any) {
    this._required = value != null && value !== false;
  }
  private _required: boolean;

  @Input() showErrorsWhenDisabled? = false;

  get labelForId(): string {
    return this.id;
  }

  @HostListener("input")
  onInput() {
    this.ngControl?.control?.markAsUntouched();
  }

  get hasError() {
    if (this.showErrorsWhenDisabled) {
      return (
        (this.ngControl?.status === "INVALID" || this.ngControl?.status === "DISABLED") &&
        this.ngControl?.touched &&
        this.ngControl?.errors != null
      );
    } else {
      return this.ngControl?.status === "INVALID" && this.ngControl?.touched;
    }
  }

  get error(): [string, any] {
    const key = Object.keys(this.ngControl.errors)[0];
    return [key, this.ngControl.errors[key]];
  }

  constructor(
    @Optional() @Self() private ngControl: NgControl,
    private ngZone: NgZone,
    private elementRef: ElementRef<HTMLInputElement>,
  ) {}

  focus() {
    this.ngZone.runOutsideAngular(() => {
      const end = this.elementRef.nativeElement.value.length;
      this.elementRef.nativeElement.setSelectionRange(end, end);
      this.elementRef.nativeElement.focus();
    });
  }
}

import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";

import { JslibModule } from "@bitwarden/angular/jslib.module";

import { ToolsSliderDirective } from "./slider.directive";

@Component({
  selector: "tools-slider",
  templateUrl: "slider.component.html",
  standalone: true,
  imports: [JslibModule, CommonModule, ToolsSliderDirective],
  encapsulation: ViewEncapsulation.None,
})
export class SliderComponent implements AfterViewInit {
  @Input() min = 0;
  @Input() max: number;
  @Input() step = 0.1;

  @ViewChild("rangeSlider", { static: true }) sliderEl: ElementRef<HTMLInputElement>;

  ngAfterViewInit() {
    this.sliderEl.nativeElement.addEventListener("input", (event: InputEvent) => {
      const tempValue = Number((event.target as HTMLInputElement).value);
      const progress = (tempValue / this.max) * 100;
      this.sliderEl.nativeElement.style.setProperty("--range-fill-value", `${progress}%`);
    });
  }
}

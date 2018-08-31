import { NgModule, ModuleWithProviders } from '@angular/core';
import { ImageShiftDirective } from '../directives/image-shift.directive';


@NgModule({
    declarations: [
        ImageShiftDirective
    ],
    exports: [
        ImageShiftDirective
    ]
})
export class ImageShiftModule {}

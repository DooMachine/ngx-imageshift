import {
    Component, DebugElement
} from '@angular/core';
import {TestBed, ComponentFixture} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ImageInfo } from '../src/models/imageinfo';
import { ImageShiftDirective } from '../src/directives/image-shift.directive';

@Component({
    template: `<img [src]="imageInfos[0].src" alt="imageInfos[0].alt"
                    imageShift
                    [images] = "imageInfos"
                    [period] = "1000"
                    [shiftOnHover]="true"
                    [preloadImages]="true"
                />`
  })
  class TestShiftComponent {
    imageInfos: Array<ImageInfo> = new Array<ImageInfo>();
    imageInfostring: Array<string> = new Array<string>();
    constructor() {
        for (let i = 0; i < 12; i++) {
            this.imageInfos.push({
              src: 'https://placeimg.com/' + (400 + 10 * i).toString() + '/480/any',
              alt: i.toString()
            });
            this.imageInfostring.push('https://placeimg.com/' + (100 + 50 * i).toString() + '/200/any');
          }
    }
  }

  describe('Directive: imageShift', () => {

    let component: TestShiftComponent;
    let fixture: ComponentFixture<TestShiftComponent>;
    let inputEl: DebugElement;

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [TestShiftComponent, ImageShiftDirective]
      });
      fixture = TestBed.createComponent(TestShiftComponent);
      component = fixture.componentInstance;
      inputEl = fixture.debugElement.query(By.css('img'));
    });
    it('hovering over image', () => {
      inputEl.triggerEventHandler('mouseover', null);
      fixture.detectChanges();
      inputEl.triggerEventHandler('mouseout', null);
      fixture.detectChanges();
      expect(inputEl.nativeElement.getAttribute('src')).toBe('https://placeimg.com');
    });
  });

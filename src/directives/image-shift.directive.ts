import { Directive, Input, OnDestroy, AfterViewInit, HostListener, Output, EventEmitter, ElementRef, Renderer2 } from '@angular/core';
import { ImageInfo } from '../models/imageinfo';
import { Subject, Observable, of, interval } from 'rxjs';
import { debounceTime ,takeUntil } from 'rxjs/operators';
@Directive({
    selector: '[imageShift]'
})
export class ImageShiftDirective implements OnDestroy, AfterViewInit {

    private shiftStartNotifier: Subject<any> = new Subject();
    private shiftEndNotifier: Subject<any> = new Subject();

    constructor(private el: ElementRef, private renderer: Renderer2)
    {
        this.registerShiftEvents();
    }
    // Array of ImageInfo or Image Urls
    private _images: Array<ImageInfo | string>;
    // Next Index of image that will preloaded
    private preloadImageIndex: number;
    // Preloaded (cached) Image Indexs
    private preloadedImageIndexes : Array<number> = new Array<number>();
    // Currently shown image Index
    private _activeImageIndex: number = 0;
    // Default Image Index in case of hover
    private _defaultImageIndex: number = 0;
    // Period of image shifting in ms
    private _period: number = 300;
    private _shiftOnHover: boolean = false;
    private _interval: Observable<number>;

    @Input() public preloadImages: boolean= true;
    @Input() public loop: boolean = false;
    @Output() public onImageChange: EventEmitter<ImageInfo | string> = new EventEmitter<ImageInfo | string>();
   
    

    @Input('images')
    set images(images: Array<ImageInfo | string>) {
        if(!Array.isArray(images))
        {
            throw new Error("images should be instance of ImageInfo or string array");
        }
        this._images = images;
        this.preloadImageIndex = (this.defaultImageIndex + 1) % (this._images.length-1);
    }
    get images(): Array<ImageInfo | string> {
        return this._images;
    }

    @Input('defaultImageIndex')
    set defaultImageIndex(ind: number) {
        this._defaultImageIndex = ind % (this._images.length-1);
    }
    get defaultImageIndex(): number {
        return this._defaultImageIndex;
    }
    @Input('period')
    set period(value: number) {
        this._period = value;
        this._interval = interval(value);
    }
    
    get period(): number {
        return this._period;
    }

    @Input('shiftOnHover')
    set shiftOnHover(value: boolean) {
        this._shiftOnHover = value;
    }
    get shiftOnHover(): boolean {
        return this._shiftOnHover;
    }

    @HostListener('mouseenter') onMouseEnter()
    {
        if (this.shiftOnHover)
        {
            this.shiftStartNotifier.next();
        }        
    }
    
    @HostListener('mouseleave') onMouseLeave()
    {
        if (this.shiftOnHover)
        {
            this.shiftEndNotifier.next();
        }
    }

    ngAfterViewInit() : void {
        this.preLoadNextImage();
        this.assignAttrsIfNotSet();
        if (!this.shiftOnHover)
        {
            this.shiftStartNotifier.next();
        }
        if (this.preloadImages)
        {
            this.loadAllImages();
        }
    }
    ngOnDestroy(): void {
        this.shiftStartNotifier.unsubscribe();
        this.shiftEndNotifier.unsubscribe();        
    }

    private registerShiftEvents() : void
    {
        this.shiftStartNotifier
            .subscribe(e=>{
                this._interval.pipe(takeUntil(this.shiftEndNotifier)).subscribe((ind)=>{
                    if (!this.loop && this._activeImageIndex == this.images.length-1)
                    {
                        this.shiftEndNotifier.next();
                    }
                    else
                    {
                        this._activeImageIndex = (this._activeImageIndex+1) % (this.images.length);
                        const imageInfo: any = this._images[this._activeImageIndex];
                        if (imageInfo.hasOwnProperty('src'))
                        {
                            this.renderer.setAttribute(this.el.nativeElement,'src',imageInfo['src'])
                            this.renderer.setAttribute(this.el.nativeElement,'alt',imageInfo['alt'])
                        }
                        else
                        {
                            this.renderer.setAttribute(this.el.nativeElement,'src',imageInfo as string)
                        }
                        this.onImageChange.emit(imageInfo);
                        this.preloadImageIndex = (this._activeImageIndex+1) % (this.images.length);
                        this.preLoadNextImage()
                    }
                })
            });
        this.shiftEndNotifier.pipe(debounceTime(this._period))
            .subscribe(e=>{
                if (!this.loop && this._activeImageIndex == this.images.length-1)
                {
                    return;
                }
                this._activeImageIndex = this._defaultImageIndex;
                const imageInfo: any = this._images[this._activeImageIndex];
                if (imageInfo.hasOwnProperty('src'))
                    {
                        this.renderer.setAttribute(this.el.nativeElement,'src',imageInfo['src'])
                        this.renderer.setAttribute(this.el.nativeElement,'alt',imageInfo['alt'])
                    }
                    else
                    {
                        this.renderer.setAttribute(this.el.nativeElement,'src',imageInfo as string)
                    }
                    this.onImageChange.emit(imageInfo);
            });
    }

    private preLoadNextImage()
    {
        if (this.preloadedImageIndexes.findIndex(p => p == this.preloadImageIndex) === -1)
        {
            const pre_image = new Image();
            const imageInfo: any = this._images[this.preloadImageIndex];
            if (imageInfo.hasOwnProperty('src'))
            {
                pre_image.src = imageInfo['src'];
            }
            else
            {
                pre_image.src = imageInfo as string;
            }
            this.preloadedImageIndexes.push(this.preloadImageIndex);
            this.preloadImageIndex = (this.preloadImageIndex + 1) % (this._images.length-1);
        }
    }
    private loadAllImages()
    {
        for (let i = 0; i < this.images.length; i++) {
            const imageInfo : any = this.images[i];
            this.loadImage(imageInfo).then(()=>{
                this.preloadedImageIndexes.push(i);
                this.preloadImageIndex = (i + 1) % (this.images.length-1);
            })
        }
    }
    private async loadImage(imageInfo: any)
    {
        const pre_image = new Image();
        if (imageInfo.hasOwnProperty('src'))
        {
            pre_image.src = imageInfo['src'];
        }
        else
        {
            pre_image.src = imageInfo as string;
        }
    }
    private assignAttrsIfNotSet()
    {
        const src = this.el.nativeElement.getAttribute('src');
        if (!src)
        {
            const imageInfo: any = this.images[this.defaultImageIndex];
            if (!imageInfo)
                return;
            if (imageInfo.hasOwnProperty('src'))
            {
                this.renderer.setAttribute(this.el.nativeElement,'src',imageInfo['src'])
                this.renderer.setAttribute(this.el.nativeElement,'alt',imageInfo['alt'])
            }
            else
            {
                this.renderer.setAttribute(this.el.nativeElement,'src',imageInfo as string)
            }
        }
    }
}
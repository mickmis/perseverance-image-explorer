import {Injectable} from '@angular/core';
import {Image} from 'image-js';
import {ImageResolution} from './models/image-resolution';
import {from, Observable} from 'rxjs';
import {ColorizedImage} from './models/colorized-image';
import {tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  private _selectedResolution: ImageResolution;
  private corsProxyUrl = 'https://corsenabler.herokuapp.com/';

  private _loadingCount: number;

  // Gpath = 'assets/RRG_0002_0667129481_373ECM_N0010052AUT_04096_00_2I3J01.png';
  // Bpath = 'assets/RRB_0002_0667129492_604ECM_N0010052AUT_04096_00_2I3J01.png';
  // Rpath = 'assets/RRR_0002_0667129466_057ECM_N0010052AUT_04096_00_2I3J01.png';
  Epath = 'assets/FRE_0000_0666958373_100ECM_N0010052AUT_04096_00_0LLJ01.png';

  constructor() {
    this.selectedResolution = ImageResolution.Full;
    this._loadingCount = 0;
  }

  colorize(pImg: Observable<ColorizedImage>): Observable<ColorizedImage> {
    // Image.load(this.Epath).then(tt => console.log(tt));

    return pImg.pipe(
      tap(img => {
        if (img.colorizedDataUrl) {
          return;
        }
        this._loadingCount++;

        // tslint:disable-next-line:one-variable-per-declaration
        let rUrl, gUrl, bUrl: string;
        switch (this.selectedResolution) {
          default:
          case ImageResolution.Full:
            rUrl = this.corsProxyUrl + img.red.image_files.full_res;
            gUrl = this.corsProxyUrl + img.green.image_files.full_res;
            bUrl = this.corsProxyUrl + img.blue.image_files.full_res;
            break;

          case ImageResolution.Large:
            rUrl = this.corsProxyUrl + img.red.image_files.large;
            gUrl = this.corsProxyUrl + img.green.image_files.large;
            bUrl = this.corsProxyUrl + img.blue.image_files.large;
            break;

          case ImageResolution.Medium:
            rUrl = this.corsProxyUrl + img.red.image_files.medium;
            gUrl = this.corsProxyUrl + img.green.image_files.medium;
            bUrl = this.corsProxyUrl + img.blue.image_files.medium;
            break;

          case ImageResolution.Small:
            rUrl = this.corsProxyUrl + img.red.image_files.small;
            gUrl = this.corsProxyUrl + img.green.image_files.small;
            bUrl = this.corsProxyUrl + img.blue.image_files.small;
            break;
        }

        return from(
          Image.load(rUrl).then(red =>
          Image.load(gUrl).then(green =>
          Image.load(bUrl).then(blue => {
            const combined = Image.createFrom(red, {});
            for (let i = 0 ; i < combined.width * combined.height ; i++) {
              combined.setPixel(i, [red.getPixel(i)[0], green.getPixel(i)[0], blue.getPixel(i)[0]]);
            }
            img.colorizedDataUrl = combined.toDataURL();
            this._loadingCount--;
          })))
        );
      })
    );
  }

  get selectedResolution(): ImageResolution {
    return this._selectedResolution;
  }

  set selectedResolution(val: ImageResolution) {
    this._selectedResolution = val;
  }

  get loadingCount(): number {
    return this._loadingCount;
  }
}

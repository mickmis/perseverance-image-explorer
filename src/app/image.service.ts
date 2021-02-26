import {Injectable} from '@angular/core';
import {ColorModel, Image, ImageKind} from 'image-js';
import {ImageResolution} from './models/image-resolution';
import {from, Observable} from 'rxjs';
import {ColorizedImage} from './models/colorized-image';
import {tap} from 'rxjs/operators';
import {combineRGB, demosaic} from './image-processing';

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
  // Epath = 'assets/FRE_0000_0666958373_100ECM_N0010052AUT_04096_00_0LLJ01.png';
  Tpath = 'assets/Mars_Perseverance_ESF_0004_0667289069_518ECM_N0010052EDLC00004_0010LUJ01.png';
  // Tpath = 'assets/FLE_0000_0666958329_772ECM_N0010052AUT_04096_00_0LLJ01.png';

  constructor() {
    this.selectedResolution = ImageResolution.Medium;
    this._loadingCount = 0;
  }

  debayerSingleImg(): void {
    Image.load(this.Tpath).then(orig => {
      const combined = Image.createFrom(orig, {
        kind: 'CMYK' as ImageKind, colorModel: 'CMYK' as ColorModel, components: 4, alpha: 0, width: orig.width / 2, height: orig.height / 2
      });

      for (let i = 0 ; i < combined.width * combined.height ; i++) {

        const C0 = Math.floor(i / combined.width) * combined.width * 4 + (i % combined.width) * 2;
        const C1 = C0 + 1;
        const C2 = C0 + combined.width * 2;
        const C3 = C2 + 1;

        if (i % 100000 === 0) {
          console.log(`pixel values: ${orig.getPixel(C0)[0]}, ${orig.getPixel(C1)[0]}, ${orig.getPixel(C2)[0]}, ${orig.getPixel(C3)[0]}`);
        }

        combined.setPixel(i, [orig.getPixel(C1)[0], orig.getPixel(C2)[0], orig.getPixel(C0)[0], orig.getPixel(C3)[0]]);

        // RGGB - yellow shade
        // combined.setPixel(i, [orig.getPixel(C0)[0], (orig.getPixel(C1)[0] + orig.getPixel(C2)[0]) / 2, orig.getPixel(C3)[0]]);

        // BGGR - blue shade
        // combined.setPixel(i, [orig.getPixel(C3)[0], (orig.getPixel(C1)[0] + orig.getPixel(C2)[0]) / 2, orig.getPixel(C0)[0]]);

        // GBRG - violet shade
        // combined.setPixel(i, [orig.getPixel(C2)[0], (orig.getPixel(C0)[0] + orig.getPixel(C3)[0]) / 2, orig.getPixel(C1)[0]]);

        // GRBG - violet shade
        // combined.setPixel(i, [orig.getPixel(C1)[0], (orig.getPixel(C0)[0] + orig.getPixel(C3)[0]) / 2, orig.getPixel(C2)[0]]);
      }
      (document.getElementById('debug-test-img') as HTMLImageElement).src = combined.toDataURL();

    });
  }

  colorize(pImg: Observable<ColorizedImage>): Observable<ColorizedImage> {

    return pImg.pipe(
      tap(img => {
        if (img.colorizedDataUrl && img.colorizedResolution === this.selectedResolution) {
          return;
        }
        this._loadingCount++;

        if (img.type === 'RGB') {
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
          img.colorizedResolution = this.selectedResolution;

          return from(
            Image.load(rUrl).then(red =>
              Image.load(gUrl).then(green =>
                Image.load(bUrl).then(blue => {
                  const combined = combineRGB(red, green, blue);
                  img.colorizedDataUrl = combined.toDataURL();
                  this._loadingCount--;
                })))
          );
        } else if (img.type === 'E') {
          const url = this.corsProxyUrl + img.singleImage.image_files.full_res;
          img.colorizedResolution = ImageResolution.Full;
          return from(Image.load(url).then(eImg => {
            const colorized = demosaic(eImg);
            img.colorizedDataUrl = colorized.toDataURL();
            this._loadingCount--;
          }));
        }
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

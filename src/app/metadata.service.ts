import { Injectable } from '@angular/core';
import {forkJoin, Observable, of, ReplaySubject} from 'rxjs';
import {ImageMetadata, Metadata} from './models/metadata';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map, switchMap, tap} from 'rxjs/operators';
import {ColorizedImage} from './models/colorized-image';
import {ImageId} from './models/image-id';

@Injectable({
  providedIn: 'root'
})
export class MetadataService {

  lastImagesMetadata: ReplaySubject<ImageMetadata[]>;

  private baseUrl = 'https://mars.nasa.gov/rss/api/';

  // Sol-00002M15:37:11.985
  private marsTimeRegex = /^Sol-(\d+)M(\d+:\d+):\d+\.\d+$/;

  private _loadingCount: number;

  constructor(private http: HttpClient) {
    this.lastImagesMetadata = new ReplaySubject(1);
    this._loadingCount = 0;
  }

  private static loadImagesMetadataParams(page: number, search: string[], solRange: [number, number]): HttpParams {
    const params = new HttpParams()
      .set('feed', 'raw_images')
      .set('feedtype', 'json')
      .set('category', 'mars2020')
      .set('num', '100')
      .set('page', page.toString())
      // sol+desc: newest to oldest; sol+asc: oldest to newest
      .set('order', 'sol+asc')
      // "sample_type::full": only full images; "sample_type::thumbnail": only thumbnails
      .set('extended', 'sample_type::full')
      // categories of images e.g. "|NAVCAM_LEFT"
      .set('search', search.join(''));

    if (solRange) {
      params
        .set('condition_2', `${solRange[0]}:sol:gte`)
        .set('condition_3', `${solRange[1]}:sol:lte`);
    }
    return params;
  }

  loadImagesMetadata(search: string[], solRange?: [number, number]): Observable<ImageMetadata[]> {
    return of(null).pipe(
      tap(() => this._loadingCount++),
      switchMap(() =>
        this.http.get<Metadata>(this.baseUrl, {params: MetadataService.loadImagesMetadataParams(0, search, solRange)})
      ),

      // based on the first response, request all the remaining missing metadata
      switchMap(metadata0 => {
        const nbCalls = metadata0.total_results / parseInt(metadata0.per_page, 10);
        console.log(`Doing ${nbCalls} requests to retrieve metadata about ${metadata0.total_results} images`);

        if (nbCalls <= 1) {
          return of(metadata0.images);
        }

        const vals = [];
        for (let i = 1 ; i < nbCalls ; i++) {
          vals[i - 1] = i;
        }
        return forkJoin(vals.map(val =>
          this.http.get<Metadata>(this.baseUrl, {params: MetadataService.loadImagesMetadataParams(val, search, solRange)}))
        ).pipe(
          map(metadataMore => metadataMore.map(m => m.images).reduce((prev, curr) => prev.concat(curr))),
          map(imagesMore => metadata0.images.concat(imagesMore))
        );
      }),

      // parse the image id
      tap(x => x.forEach(img => img.parsedImageId = new ImageId(img.imageid))),
      tap((x) => this.lastImagesMetadata.next(x.sort((a, b) => b.date_taken_mars.localeCompare(a.date_taken_mars)))),
      tap(() => this._loadingCount--)
    );
  }

  parseMarsTime(orig: string): string {
    const [_, sol, time] = orig.match(this.marsTimeRegex);
    return `Sol ${parseInt(sol, 10)}, ${time} LST`;
  }

  sortColorizedImages(): (pImg: Observable<ColorizedImage[]>) => Observable<ColorizedImage[]> {
    return (pImg: Observable<ColorizedImage[]>) => pImg.pipe(
      tap(() => this._loadingCount++),
      map(img => img.sort((a, b) => b.refImage.date_taken_mars.localeCompare(a.refImage.date_taken_mars))),
      tap(() => this._loadingCount--),
    );
  }

  getColorizableImages(): (images: Observable<ImageMetadata[]>) => Observable<ColorizedImage[]> {
    return (images: Observable<ImageMetadata[]>) => images.pipe(
      tap(() => this._loadingCount++),

      // for RGB images: group images by a specific key: camera ID + camera position
      // for E images: just extract them
      map(allImages => {
        const groupedRgbImgs = new Map<string, Array<ImageMetadata>>();
        const eImgs = new Array<ImageMetadata>();
        allImages.forEach(img => {
          if (!img.parsedImageId) {
            console.warn(`Missing parsed ID for ${img.imageid}`);
            return;
          }

          if (img.parsedImageId.imageType === 'E') {
            eImgs.push(img);

          } else if (
            img.parsedImageId.imageType === 'R' ||
            img.parsedImageId.imageType === 'G' ||
            img.parsedImageId.imageType === 'B') {

            const groupKey = img.parsedImageId.cameraId + img.camera.camera_position;
            if (!groupedRgbImgs.has(groupKey)) {
              groupedRgbImgs.set(groupKey, new Array<ImageMetadata>());
            }
            groupedRgbImgs.get(groupKey).push(img);

          } else {
            console.log(`Ignoring type ${img.parsedImageId.imageType} of ${img.imageid}`);
          }
        });
        const ret: [Map<string, Array<ImageMetadata>>, Array<ImageMetadata>] = [groupedRgbImgs, eImgs];
        return ret;
      }),

      // sort per date the images
      tap(imgs => imgs[0].forEach(imageGroup =>
        imageGroup.sort((a, b) => a.date_taken_mars.localeCompare(b.date_taken_mars))
      )),
      tap(imgs => imgs[1].sort((a, b) => a.date_taken_mars.localeCompare(b.date_taken_mars))),

      // generate the ColorizedImage[]
      map(allImgs => {
        const colImgs = Array<ColorizedImage>();
        for (const group of allImgs[0].values()) {

          // parse the metadata and generate for each group the ColorizedImage[]
          // Each group can have several RGB images, in which case the order is important
          // tslint:disable-next-line:prefer-for-of
          for (let imgIdx = 0 ; imgIdx < group.length ; imgIdx++) {
            const img = group[imgIdx];

            if (
              img.parsedImageId.imageType === 'R' &&
              group[imgIdx + 1].parsedImageId.imageType === 'G' &&
              group[imgIdx + 2].parsedImageId.imageType === 'B') {

              const colImg = new ColorizedImage('RGB');
              colImg.red = img;
              colImg.green = group[imgIdx + 1];
              colImg.blue = group[imgIdx + 2];
              colImgs.push(colImg);
              imgIdx += 2;

            } else if (
              img.parsedImageId.imageType === 'M' ||
              img.parsedImageId.imageType === 'F' ||
              img.parsedImageId.imageType === 'E') {
              console.log(`Ignoring type ${img.parsedImageId.imageType} of ${img.imageid}`);
            } else {
              console.warn(`Ignoring unexpected type or incomplete RGB image ${img.parsedImageId.imageType} of ${img.imageid}`, img);
            }
          }
        }

        // add all the E images
        colImgs.push(...allImgs[1].map(eImg => {
          const colImg = new ColorizedImage('E');
          colImg.singleImage = eImg;
          return colImg;
        }));

        return colImgs;
      }),
      tap(() => this._loadingCount--)
    );
  }

  get loadingCount(): number {
    return this._loadingCount;
  }
}
// todo: update component to display accordingly the RGB or single

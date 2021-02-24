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

  images: ReplaySubject<ImageMetadata[]>;
  colorizedImages: ReplaySubject<ColorizedImage[]>;

  private baseUrl = 'https://mars.nasa.gov/rss/api/';

  // Sol-00002M15:37:11.985
  private marsTimeRegex = /^Sol-(\d+)M(\d+:\d+):\d+\.\d+$/;

  constructor(private http: HttpClient) {
    this.images = new ReplaySubject(1);
    this.colorizedImages = new ReplaySubject(1);
  }

  // todo: have categories per cameras (auto-parsed? not in a first time), have them as tab!

  // todo: provide functions to filter stuff according to what I find in IDs etc.
  // todo: load not in constructor
  // todo: XXF in image id probably stands for FULL? e.g. ZL1234 --> OUI F=FULL, and the first 2 are the camera

  // todo: generate a nice chronology?? like vertical with photos loading as it comes?

  // todo: option to choose resolution of image (and default to different stuff if on mobile or desktop)
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
    return this.http.get<Metadata>(this.baseUrl, {params: MetadataService.loadImagesMetadataParams(0, search, solRange)}).pipe(

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
      tap(x => x.forEach(img => img.parsedImageId = new ImageId(img.imageid)))
    );
  }

  parseMarsTime(orig: string): string {
    const [_, sol, time] = orig.match(this.marsTimeRegex);
    return `Sol ${parseInt(sol, 10)}, ${time} LST`;
  }

  sortColorizedImages(pImg: Observable<ColorizedImage[]>): Observable<ColorizedImage[]> {
    return pImg.pipe(map(img => img.sort(
      (a, b) => b.red.date_taken_mars.localeCompare(a.red.date_taken_mars))
    ));
  }

  getColorizableImages(images: Observable<ImageMetadata[]>): Observable<ColorizedImage[]> {
    return images.pipe(

      // group images by a specific key
      map(allImages => {
        const groupedImgs = new Map<string, Set<ImageMetadata>>();
        allImages.forEach(img => {
          const groupKey = img.camera.camera_position;
          if (!groupedImgs.has(groupKey)) {
            groupedImgs.set(groupKey, new Set<ImageMetadata>());
          }
          groupedImgs.get(groupKey).add(img);
        });
        return groupedImgs;
      }),

      // parse the metadata and generate for each group the ColorizedImage[]
      map(groupedImgs => {
        const colImgs = Array<ColorizedImage>();
        for (const group of groupedImgs.values()) {

          // we need at least images for RGB
          if (group.size < 3) {
            continue;
          }

          const colImg = new ColorizedImage();
          for (const img of group.values()) {
            if (!img.parsedImageId) {
              console.warn(`Missing parsed ID for ${img.imageid}`);
              continue;
            }

            if (img.parsedImageId.imageType === 'R') {
              colImg.red = img;
            } else if (img.parsedImageId.imageType === 'G') {
              colImg.green = img;
            } else if (img.parsedImageId.imageType === 'B') {
              colImg.blue = img;
            } else {
              console.warn(`Ignoring unexpected type ${img.parsedImageId.imageType} of ${img.imageid} (${colImg.id})`);
            }
          }

          if (colImg.red && colImg.green && colImg.blue) {
            colImgs.push(colImg);
          } else {
            console.warn(`Ignoring incomplete colorized image ${colImg.id}`);
          }
        }
        return colImgs;
      })
    );
  }
}

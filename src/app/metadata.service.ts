import { Injectable } from '@angular/core';
import {forkJoin, Observable, of, ReplaySubject} from 'rxjs';
import {ImageMetadata, Metadata, NavMetadata} from './models/api/metadata';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map, shareReplay, switchMap, tap} from 'rxjs/operators';
import {LatestMetadata} from './models/api/latest-metadata';
import {MetadataRequestParams} from './models/api/metadata-request-params';
import {ParsedImageMetadata} from './models/parsed-image-metadata';

@Injectable({
  providedIn: 'root'
})
export class MetadataService {

  private static BaseUrl = 'https://mars.nasa.gov/rss/api/';
  public static MaxImagesPerPage = 100;
  public static DefaultImagesPerPage = 25;

  private readonly _generalMetadata: Observable<{latest: LatestMetadata, nav: NavMetadata[]}>;

  // Sol-00002M15:37:11.985
  private marsTimeRegex = /^Sol-(\d+)M(\d+:\d+):\d+\.\d+$/;

  private _loadingCount: number;

  constructor(private http: HttpClient) {
    this._generalMetadata = new ReplaySubject(1);
    this._loadingCount = 0;

    this._generalMetadata = of(null).pipe(
      tap(() => this._loadingCount++),
      switchMap(() =>
        forkJoin({
          latest: this.http.get<LatestMetadata>(MetadataService.BaseUrl, {
            params: new HttpParams()
              .set('feed', 'raw_images')
              .set('feedtype', 'json')
              .set('category', 'mars2020')
              .set('latest', 'true')
          }),
          nav: this.http.get<Metadata>(MetadataService.BaseUrl, {
            params: new HttpParams()
              .set('feed', 'raw_images')
              .set('feedtype', 'json')
              .set('category', 'mars2020')
              .set('num', '0')
          }).pipe(map(resp => resp.nav))
        })
      ),
      tap(() => this._loadingCount--),
      tap((genMet) => console.log('Loaded general metadata', genMet)),
    shareReplay(1)
    );
  }

  loadMetadata(pageNumber: number, imagesPerPage: number, params: MetadataRequestParams): Observable<Metadata> {
    let httpParams = new HttpParams()
      .set('feed', 'raw_images')
      .set('feedtype', 'json')
      .set('category', 'mars2020')
      .set('num', imagesPerPage.toString())
      .set('page', pageNumber.toString())
      // "sample_type::full": only full images; "sample_type::thumbnail": only thumbnails
      .set('extended', params.excludeThumbnails ? 'sample_type::full' : '')
      // categories of images e.g. "|NAVCAM_LEFT"
      .set('search', params.search.join('|'));

    // sort defaults to ascending
    if (params.sortBy === 'descending') {
      httpParams = httpParams.set('order', 'sol+desc');
    } else {
      httpParams = httpParams.set('order', 'sol+asc');
    }

    if (params.solRange && (params.solRange[0] || params.solRange[1])) {
      if (params.solRange[0]) {
        httpParams = httpParams.set('condition_2', `${params.solRange[0]}:sol:gte`);
      }
      if (params.solRange[1]) {
        httpParams = httpParams.set('condition_3', `${params.solRange[1]}:sol:lte`);
      }
    } else if (params.dateRange && (params.dateRange[0] || params.dateRange[1])) {
      if (params.dateRange[0]) {
        httpParams = httpParams.set('condition_2', `${params.dateRange[0]}:date_taken:gte`);
      }
      if (params.dateRange[1]) {
        httpParams = httpParams.set('condition_3', `${params.dateRange[1]}:date_taken:lte`);
      }
    }

    return of(null).pipe(
      tap(() => this._loadingCount++),
      switchMap(() => this.http.get<Metadata>(MetadataService.BaseUrl, {params: httpParams})),
      tap(() => this._loadingCount--)
    );
  }

  loadImagesMetadata(pageNumber: number, imagesPerPages: number, params: MetadataRequestParams
  ): Observable<[number, ParsedImageMetadata[]]> {
    return of(null).pipe(
      tap(() => this._loadingCount++),
      switchMap(() => this.loadMetadata(pageNumber, imagesPerPages, params)),
      map(metadata => {
        const res: [number, ParsedImageMetadata[]] = [
          metadata.total_results,
          metadata.images.map(img => new ParsedImageMetadata(img))
        ];
        return res;
      }),
      tap(() => this._loadingCount--)
    );
  }

  loadImagesMetadataBatched(pageNumber: number, imagesPerPages: number, params: MetadataRequestParams
  ): Observable<[number, ParsedImageMetadata[]]> {
    const pageMultiplier = imagesPerPages / MetadataService.MaxImagesPerPage;
    const firstPage = pageMultiplier * pageNumber;
    return of(null).pipe(
      tap(() => this._loadingCount++),
      switchMap(() => this.loadImagesMetadata(firstPage, MetadataService.MaxImagesPerPage, params)),

      // based on the first response, request all the remaining missing metadata
      switchMap(metadataFirst => {
        console.log(`Doing ${pageMultiplier} requests to retrieve metadata about ${imagesPerPages} images`);

        if (pageMultiplier <= 1) {
          return of(metadataFirst);
        }

        const pageNumbers = [];
        for (let i = firstPage + 1 ; i < firstPage + pageMultiplier ; i++) {
          pageNumbers.push(i);
        }
        return forkJoin(pageNumbers.map(p => this.loadImagesMetadata(p, MetadataService.MaxImagesPerPage, params))).pipe(
          map(metadataAll => metadataAll.map(m => m[1]).reduce((prev, curr) => prev.concat(curr))),
          map(imagesAll => {
            const res: [number, ParsedImageMetadata[]] = [metadataFirst[0], metadataFirst[1].concat(imagesAll)];
            return res;
          })
        );
      }),
      tap(() => this._loadingCount--)
    );
  }

  loadAllImagesMetadata(params: MetadataRequestParams): Observable<ParsedImageMetadata[]> {
    return of(null).pipe(
      tap(() => this._loadingCount++),
      switchMap(() => this.loadMetadata(0, MetadataService.MaxImagesPerPage, params)),

      // based on the first response, request all the remaining missing metadata
      switchMap(metadata0 => {
        const nbCalls = metadata0.total_results / parseInt(metadata0.per_page, 10);
        console.log(`Doing ${nbCalls} requests to retrieve metadata about ${metadata0.total_results} images`);

        if (nbCalls <= 1) {
          return of(metadata0.images.map(img => new ParsedImageMetadata(img)));
        }

        const pageNumbers = [];
        for (let i = 1 ; i < nbCalls ; i++) {
          pageNumbers[i - 1] = i;
        }
        return forkJoin(pageNumbers.map(pageNumber => this.loadMetadata(pageNumber, MetadataService.MaxImagesPerPage, params))).pipe(
          map(metadataAll => metadataAll.map(m => m.images).reduce((prev, curr) => prev.concat(curr))),
          map(imagesAll => metadata0.images.concat(imagesAll)),
          map(images => images.map(img => new ParsedImageMetadata(img)))
        );
      }),
      tap(() => this._loadingCount--)
    );
  }

  parseMarsTime(orig: string): string {
    const [_, sol, time] = orig.match(this.marsTimeRegex);
    return `Sol ${parseInt(sol, 10)}, ${time} LST`;
  }
  //
  // sortColorizedImages(): (pImg: Observable<ColorizedImage[]>) => Observable<ColorizedImage[]> {
  //   return (pImg: Observable<ColorizedImage[]>) => pImg.pipe(
  //     tap(() => this._loadingCount++),
  //     map(img => img.sort((a, b) => b.refImage.date_taken_mars.localeCompare(a.refImage.date_taken_mars))),
  //     tap(() => this._loadingCount--),
  //   );
  // }
  //
  // getColorizableImages(): (images: Observable<ImageMetadata[]>) => Observable<ColorizedImage[]> {
  //   return (images: Observable<ImageMetadata[]>) => images.pipe(
  //     tap(() => this._loadingCount++),
  //
  //     // for RGB images: group images by a specific key: camera ID + camera position
  //     // for E images: just extract them
  //     map(allImages => {
  //       const groupedRgbImgs = new Map<string, Array<ImageMetadata>>();
  //       const eImgs = new Array<ImageMetadata>();
  //       allImages.forEach(img => {
  //         if (!img.parsedImageId) {
  //           console.warn(`Missing parsed ID for ${img.imageid}`);
  //           return;
  //         }
  //
  //         if (img.parsedImageId.filter === 'E') {
  //           eImgs.push(img);
  //
  //         } else if (
  //           img.parsedImageId.filter === 'R' ||
  //           img.parsedImageId.filter === 'G' ||
  //           img.parsedImageId.filter === 'B') {
  //
  //           const groupKey = img.parsedImageId.instrumentId + img.camera.camera_position;
  //           if (!groupedRgbImgs.has(groupKey)) {
  //             groupedRgbImgs.set(groupKey, new Array<ImageMetadata>());
  //           }
  //           groupedRgbImgs.get(groupKey).push(img);
  //
  //         } else {
  //           console.log(`Ignoring type ${img.parsedImageId.filter} of ${img.imageid}`);
  //         }
  //       });
  //       const ret: [Map<string, Array<ImageMetadata>>, Array<ImageMetadata>] = [groupedRgbImgs, eImgs];
  //       return ret;
  //     }),
  //
  //     // sort per date the images
  //     tap(imgs => imgs[0].forEach(imageGroup =>
  //       imageGroup.sort((a, b) => a.date_taken_mars.localeCompare(b.date_taken_mars))
  //     )),
  //     tap(imgs => imgs[1].sort((a, b) => a.date_taken_mars.localeCompare(b.date_taken_mars))),
  //
  //     // generate the ColorizedImage[]
  //     map(allImgs => {
  //       const colImgs = Array<ColorizedImage>();
  //       for (const group of allImgs[0].values()) {
  //
  //         // parse the metadata and generate for each group the ColorizedImage[]
  //         // Each group can have several RGB images, in which case the order is important
  //         // tslint:disable-next-line:prefer-for-of
  //         for (let imgIdx = 0 ; imgIdx < group.length ; imgIdx++) {
  //           const img = group[imgIdx];
  //
  //           if (
  //             img.parsedImageId.filter === 'R' &&
  //             group[imgIdx + 1].parsedImageId.filter === 'G' &&
  //             group[imgIdx + 2].parsedImageId.filter === 'B') {
  //
  //             const colImg = new ColorizedImage('RGB');
  //             colImg.red = img;
  //             colImg.green = group[imgIdx + 1];
  //             colImg.blue = group[imgIdx + 2];
  //             colImgs.push(colImg);
  //             imgIdx += 2;
  //
  //           } else if (
  //             img.parsedImageId.filter === 'M' ||
  //             img.parsedImageId.filter === 'F' ||
  //             img.parsedImageId.filter === 'E') {
  //             console.log(`Ignoring type ${img.parsedImageId.filter} of ${img.imageid}`);
  //           } else {
  //             console.warn(`Ignoring unexpected type or incomplete RGB image ${img.parsedImageId.filter} of ${img.imageid}`, img);
  //           }
  //         }
  //       }
  //
  //       // add all the E images
  //       colImgs.push(...allImgs[1].map(eImg => {
  //         const colImg = new ColorizedImage('E');
  //         colImg.singleImage = eImg;
  //         return colImg;
  //       }));
  //
  //       return colImgs;
  //     }),
  //     tap(() => this._loadingCount--)
  //   );
  // }

  get loadingCount(): number {
    return this._loadingCount;
  }

  get generalMetadata(): Observable<{latest: LatestMetadata, nav: NavMetadata[]}> {
    return this._generalMetadata;
  }
}

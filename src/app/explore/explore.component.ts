import {Component, OnInit} from '@angular/core';
import {MetadataService} from '../metadata.service';
import {ExportToCSV} from '@molteni/export-csv';
import {map} from 'rxjs/operators';
import {Camera} from '../models/camera';
import {Observable, of, ReplaySubject} from 'rxjs';
import {ImageService} from '../image.service';
import {MetadataRequestParams} from '../models/api/metadata-request-params';
import {ParsedImageMetadata} from '../models/parsed-image-metadata';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent implements OnInit {

  // --- request parameters

  private _excludeThumbnails: boolean;

  private _includeAllCameras: boolean;
  private _selectedCameras: Camera[];

  private _restrictPerTime: boolean;
  private readonly _solRange: [number, number];
  private readonly _dateRange: [string, string];

  private _sortBy: 'ascending' | 'descending';

  // --- request responses

  private _allCameras: Observable<Camera[]>;

  private readonly _currentImagesMetadata: ReplaySubject<[number, ParsedImageMetadata[]]>;

  constructor(public metadataService: MetadataService, public imageService: ImageService) {
    this.excludeThumbnails = true;
    this.includeAllCameras = true;
    this._selectedCameras = [];
    this.restrictPerTime = false;
    this._solRange = [undefined, undefined];
    this._dateRange = [undefined, undefined];
    this._sortBy = 'descending';

    this._currentImagesMetadata = new ReplaySubject(1);
  }

  ngOnInit(): void {
    this._allCameras = this.metadataService.generalMetadata.pipe(
      map(met => met.nav.map(nav => nav.checkboxes.map(checkbox =>
        new Camera(checkbox.label, checkbox.value.split('|')))
      ).reduce((prev, curr) => prev.concat(curr)))
    );
    this.updateImagesMetadata(0);
  }

  updateImagesMetadata(pageIdx: number, imagesPerPage?: number): void {
    let obs: Observable<[number, ParsedImageMetadata[]]>;
    if (imagesPerPage && imagesPerPage > MetadataService.MaxImagesPerPage) {
      obs = this.metadataService.loadImagesMetadataBatched(
        pageIdx,
        imagesPerPage,
        this.metadataRequestParams
      );
    } else {
      obs = this.metadataService.loadImagesMetadata(
        pageIdx,
        imagesPerPage ? imagesPerPage : this.defaultNbImagesPerPage,
        this.metadataRequestParams
      );
    }
    obs.subscribe(met => this._currentImagesMetadata.next(met));
  }

  updateCameraSelection(checked: boolean, camera: Camera): void {
    if (checked) {
      this._selectedCameras.push(camera);
    } else {
      this._selectedCameras = this._selectedCameras.filter(c => c !== camera);
    }
  }

  get metadataRequestParams(): MetadataRequestParams {
    return {
      excludeThumbnails: this.excludeThumbnails,
      search: (this.includeAllCameras || this._selectedCameras.length === 0) ?
        [] :
        this._selectedCameras.map(cam => cam.searchQuery).reduce((prev, curr) => prev.concat(curr)),
      sortBy: this.sortBy,
      solRange: this.restrictPerTime ? this.solRange : undefined,
      dateRange: this.restrictPerTime ? this.dateRange : undefined
    };
  }

  downloadAllCsv(): void {
    this.metadataService.loadAllImagesMetadata(this.metadataRequestParams).pipe(
      map(images => images.map(image => { return {
        'json.sol': image.sol,
        'json.extended.sclk': image.extended.sclk,
        'gen.parsedImageId.sequenceIdInstrument': image.parsedImageId.sequenceIdInstrument,
        'gen.parsedImageId.sequenceId': image.parsedImageId.sequenceId,
        'json.imageid': image.imageid,
        'json.image_files.full_res': image.image_files.full_res,
        'json.date_taken_mars': image.date_taken_mars,
        'json.date_taken_utc': image.date_taken_utc,
        'json.date_received': image.date_received,
        'gen.parsedImageId.instrumentId': image.parsedImageId.instrumentId,
        'json.camera.instrument': image.camera.instrument,
        'json.sample_type': image.sample_type,
        'json.camera.filter_name': image.camera.filter_name,
        'json.extended.scaleFactor': image.extended.scaleFactor,
        'json.extended.dimension': image.extended.dimension,
        'gen.parsedImageId.quality': image.parsedImageId.quality,
        'json.extended.subframeRect': image.extended.subframeRect,
        'json.extended.mastAz': image.extended.mastAz,
        'json.extended.mastEl': image.extended.mastEl,
        'json.site': image.site,
        'json.drive': image.drive,
        'json.extended.xyz': image.extended.xyz,
        'json.attitude': image.attitude,
        'json.camera.camera_position': image.camera.camera_position,
        'json.camera.camera_vector': image.camera.camera_vector,
        'json.camera.camera_model_component_list': image.camera.camera_model_component_list,
        'json.camera.camera_model_type': image.camera.camera_model_type,
        'json.link': image.link,
        'json.json_link': image.json_link,
        'json.image_files.large': image.image_files.large,
        'json.image_files.medium': image.image_files.medium,
        'json.image_files.small': image.image_files.small,
        'json.title': image.title,
        'json.credit': image.credit,
        'json.caption': image.caption,
        'gen.parsedImageId.filter': image.parsedImageId.filter,
        'gen.parsedImageId.primaryTimestamp': image.parsedImageId.primaryTimestamp,
        'gen.parsedImageId.secondaryTimestamp': image.parsedImageId.secondaryTimestamp,
        'gen.parsedImageId.tertiaryTimestamp': image.parsedImageId.tertiaryTimestamp,
        'gen.parsedImageId.productType': image.parsedImageId.productType,
        'gen.parsedImageId.normalOrThumbnail': image.parsedImageId.normalOrThumbnail,
        'gen.parsedImageId.siteLocationCount': image.parsedImageId.siteLocationCount,
        'gen.parsedImageId.driveCount': image.parsedImageId.driveCount,
        'gen.parsedImageId.focalLength': image.parsedImageId.focalLength,
        'gen.parsedImageId.downsamplingFlag': image.parsedImageId.downsamplingFlag,
        'gen.parsedImageId.producer': image.parsedImageId.producer,
        'gen.parsedImageId.productVersion': image.parsedImageId.productVersion,
      }; }))
    ).subscribe(images => new ExportToCSV().exportAllToCSV(images, 'perseverance_image_api_export.csv'));
  }

  downloadAllJson(): void {
    this.metadataService.loadAllImagesMetadata(this.metadataRequestParams)
      .subscribe(images => {
        const downloadLink = document.createElement('a');
        downloadLink.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(images));
        downloadLink.download = 'perseverance_image_api_export.json';
        downloadLink.click();
      });
  }

  downloadAllFileList(): void {
    this.metadataService.loadAllImagesMetadata(this.metadataRequestParams).pipe(
      map(images => images.map(image => this.imageService.resolveImageUrlResolution(image, false)))
    ).subscribe(images => {
        const downloadLink = document.createElement('a');
        downloadLink.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(images.join('\n'));
        downloadLink.download = 'perseverance_image_api_export.txt';
        downloadLink.click();
      });
  }

  downloadImage(img: ParsedImageMetadata): void {
    // cannot work for outside images --> copy full link or open full in new tab
    const downloadLink = document.createElement('a');
    downloadLink.href = img.image_files.full_res;
    const urlElements = img.image_files.full_res.split('/');
    downloadLink.download = urlElements[urlElements.length - 1];
    downloadLink.setAttribute('download', '');
    downloadLink.target = '_blank';
    downloadLink.click();
  }

  colorizeImage(img: ParsedImageMetadata): void {
    this.imageService.colorize(of(img)).subscribe();
  }

  get latestSol(): Observable<number> {
    return this.metadataService.generalMetadata.pipe(
      map(met => met.latest.latest_sol)
    );
  }

  get totalNbImages(): Observable<number> {
    return this.metadataService.generalMetadata.pipe(
      map(met => met.latest.total)
    );
  }

  get imagesPerPageOptions(): number[] {
    return [25, 50, 100, 200, 500, 1000, 2000];
  }

  get allCameras(): Observable<Camera[]> {
    return this._allCameras;
  }

  get excludeThumbnails(): boolean {
    return this._excludeThumbnails;
  }

  set excludeThumbnails(value: boolean) {
    this._excludeThumbnails = value;
  }

  get includeAllCameras(): boolean {
    return this._includeAllCameras;
  }

  set includeAllCameras(value: boolean) {
    this._includeAllCameras = value;
  }

  get restrictPerTime(): boolean {
    return this._restrictPerTime;
  }

  set restrictPerTime(value: boolean) {
    this._restrictPerTime = value;
  }

  get dateRange(): [string, string] {
    return this._dateRange;
  }

  get solRange(): [number, number] {
    return this._solRange;
  }

  get currentImagesMetadata(): Observable<ParsedImageMetadata[]> {
    return this._currentImagesMetadata.pipe(map(i => i[1]));
  }

  get currentNbOfImages(): Observable<number> {
    return this._currentImagesMetadata.pipe(map(i => i[0]));
  }

  get defaultNbImagesPerPage(): number {
    return MetadataService.DefaultImagesPerPage;
  }

  get sortBy(): 'ascending' | 'descending' {
    return this._sortBy;
  }

  set sortBy(value: 'ascending' | 'descending') {
    this._sortBy = value;
  }
}

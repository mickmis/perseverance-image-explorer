import {Component, OnInit} from '@angular/core';
import {MetadataService} from '../metadata.service';
import {AllCams, Camera} from '../models/camera';
import {Observable, of} from 'rxjs';
import {shareReplay, tap} from 'rxjs/operators';
import {ColorizedImage} from '../models/colorized-image';
import {ImageService} from '../image.service';
import {environment} from '../../environments/environment';
import {ImageMetadata} from '../models/metadata';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.css']
})
export class CameraComponent implements OnInit {
  AllCams = AllCams;

  private imagesMetadata: Map<Camera, Observable<ImageMetadata[]>>;
  private colorizedImages: Map<Camera, Observable<ColorizedImage[]>>;

  private _selectedTabIdx: number;

  constructor(public metadataService: MetadataService, public imageService: ImageService) {
  }

  ngOnInit(): void {
    this.imageService.debayerSingleImg();
    this.imagesMetadata = new Map<Camera, Observable<ImageMetadata[]>>(AllCams.map(cam => [
      cam,
      this.metadataService.loadImagesMetadata(cam.searchQuery).pipe(
        shareReplay(1)
      )
    ]));

    this.colorizedImages = new Map<Camera, Observable<ColorizedImage[]>>();
    this.imagesMetadata.forEach((val, key) =>
      this.colorizedImages.set(key, val.pipe(
        this.metadataService.getColorizableImages(),
        this.metadataService.sortColorizedImages(),
        shareReplay(1)
      ))
    );

    this.selectedTabIdx = 0;
    this.selectedTabChange(0);
  }

  loadColorizableImages(camera: Camera): Observable<ColorizedImage[]> {
    return this.colorizedImages.get(camera);
  }

  loadImagesMetadata(camera: Camera): Observable<ImageMetadata[]> {
    return this.imagesMetadata.get(camera);
  }

  loadImage(img: ColorizedImage): void {
    this.imageService.colorize(of(img)).subscribe();
  }

  downloadImage(img: ColorizedImage): void {
    const downloadLink = document.createElement('a');
    downloadLink.href = img.colorizedDataUrl;
    downloadLink.download = img.id;
    downloadLink.click();
  }

  selectedTabChange(tabIdx: number): void {
    this.loadColorizableImages(AllCams[tabIdx]).subscribe();
  }

  get selectedTabIdx(): number {
    return this._selectedTabIdx;
  }

  set selectedTabIdx(val: number) {
    this._selectedTabIdx = val;
  }

  get displayDebug(): boolean {
    return !environment.production;
  }
}

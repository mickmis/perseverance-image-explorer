import {Component, OnInit} from '@angular/core';
import {MetadataService} from '../metadata.service';
import {AllCams, Camera} from '../models/camera';
import {Observable, of} from 'rxjs';
import {shareReplay, tap} from 'rxjs/operators';
import {ColorizedImage} from '../models/colorized-image';
import {ImageService} from '../image.service';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.css']
})
export class CameraComponent implements OnInit {
  AllCams = AllCams;

  private colorizedImages: Map<Camera, Observable<ColorizedImage[]>>;

  private _selectedTabIdx: number;

  constructor(public metadataService: MetadataService, private imageService: ImageService) {
  }

  ngOnInit(): void {
    this.colorizedImages = new Map(AllCams.map(cam => [
      cam,
      this.metadataService.loadImagesMetadata(cam.searchQuery).pipe(
        this.metadataService.getColorizableImages,
        this.metadataService.sortColorizedImages,
        shareReplay(1)
      )
    ]));
    this.selectedTabIdx = 0;
    this.selectedTabChange(0);
  }

  loadColorizableImages(camera: Camera): Observable<ColorizedImage[]> {
    return this.colorizedImages.get(camera);
  }

  loadImage(img: ColorizedImage): void {
    this.imageService.colorize(of(img)).subscribe();
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
}

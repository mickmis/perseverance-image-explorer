import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ImageResolutionToString} from '../models/image-resolution';
import {ImageService} from '../image.service';
import {MetadataService} from '../metadata.service';
import {MatSliderChange} from '@angular/material/slider';
import { faGithub, faTwitter } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css'],
})
export class SideNavComponent implements OnInit {
  faGithub = faGithub;
  faTwitter = faTwitter;
  ImageResolutionToString = ImageResolutionToString;

  constructor(public imageService: ImageService, private metadataService: MetadataService) {
  }

  ngOnInit(): void {
  }

  resolutionSliderChange(change: MatSliderChange): void {
    this.imageService.selectedResolution = change.value;
  }

  get isLoading(): boolean {
    return this.imageService.loadingCount > 0 || this.metadataService.loadingCount > 0;
  }
}

import { Component, OnInit } from '@angular/core';
import {ImageResolutionToString} from '../models/image-resolution';
import {ImageService} from '../image.service';
import {MetadataService} from '../metadata.service';
import {MatSliderChange} from '@angular/material/slider';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent implements OnInit {
  ImageResolutionToString = ImageResolutionToString;

  constructor(public imageService: ImageService) {
  }

  ngOnInit(): void {
  }

  resolutionSliderChange(change: MatSliderChange): void {
    this.imageService.selectedResolution = change.value;
  }
}

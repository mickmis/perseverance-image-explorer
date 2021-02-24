import {ImageMetadata} from './metadata';
import {from, Observable, of} from 'rxjs';
import {Image} from 'image-js';

export class ColorizedImage {
  red: ImageMetadata;
  green: ImageMetadata;
  blue: ImageMetadata;
  colorizedDataUrl?: string;

  get id(): string {
    const ids = [];
    if (this.red) {
      ids.push(`R:${this.red.imageid}`);
    }
    if (this.green) {
      ids.push(`G:${this.green.imageid}`);
    }
    if (this.blue) {
      ids.push(`B:${this.blue.imageid}`);
    }
    return ids.join(',');
  }
}
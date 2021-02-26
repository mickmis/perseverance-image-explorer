import {ImageMetadata} from './metadata';
import {ImageResolution} from './image-resolution';

export class ColorizedImage {
  type: 'RGB' | 'E';

  red: ImageMetadata;
  green: ImageMetadata;
  blue: ImageMetadata;

  singleImage: ImageMetadata;

  colorizedDataUrl?: string;
  colorizedResolution?: ImageResolution;

  constructor(type: 'RGB' | 'E') {
    this.type = type;
  }

  get id(): string {
    if (this.type === 'E') {
      return `E:${this.singleImage.imageid}`;
    } else if (this.type === 'RGB') {
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
      if (this.singleImage) {
        ids.push(`E:${this.singleImage.imageid}`);
      }
      return ids.join(',');
    }
  }

  get refImage(): ImageMetadata {
    if (this.type === 'E') {
      return this.singleImage;
    } else if (this.type === 'RGB') {
      return this.red;
    }
  }
}

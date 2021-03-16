import {ImageMetadata} from './api/metadata';
import {ImageResolution} from './image-resolution';
import {ImageId} from './image-id';

export class ParsedImageMetadata extends ImageMetadata {

  parsedImageId?: ImageId;

  red: ParsedImageMetadata;
  green: ParsedImageMetadata;
  blue: ParsedImageMetadata;

  colorizedDataUrl?: string;
  colorizedResolution?: ImageResolution;

  constructor(img: ImageMetadata) {
    super();
    Object.assign(this, img);
    this.parsedImageId = new ImageId(this.imageid);
  }

  get isColorizable(): boolean {
    return this.parsedImageId.filter === 'E' ||
      this.parsedImageId.filter === 'R' ||
      this.parsedImageId.filter === 'G' ||
      this.parsedImageId.filter === 'B';
  }

  // constructor(type: 'RGB' | 'E') {
  //   this.type = type;
  // }

  // get id(): string {
  //   if (this.type === 'E') {
  //     return `E:${this.singleImage.imageid}`;
  //   } else if (this.type === 'RGB') {
  //     const ids = [];
  //     if (this.red) {
  //       ids.push(`R:${this.red.imageid}`);
  //     }
  //     if (this.green) {
  //       ids.push(`G:${this.green.imageid}`);
  //     }
  //     if (this.blue) {
  //       ids.push(`B:${this.blue.imageid}`);
  //     }
  //     if (this.singleImage) {
  //       ids.push(`E:${this.singleImage.imageid}`);
  //     }
  //     return ids.join(',');
  //   }
  // }
  //
  // get refImage(): ImageMetadata {
  //   if (this.type === 'E') {
  //     return this.singleImage;
  //   } else if (this.type === 'RGB') {
  //     return this.red;
  //   }
  // }
}

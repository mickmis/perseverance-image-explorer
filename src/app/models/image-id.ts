export class ImageId {

  constructor(imageId: string) {
    // example: RRB_0002_0667129492_604ECM_N0010052AUT_04096_00_2I3J01
    //          ZR5_0002_0667131617_423FDR_N0010052ZCAM00012_0630LUJ02
    //          ZLF_0002_0667132063_000FDR_N0010052AUT_04096_0260LUJ01

    const els = imageId.split('_');

    if (els.length < 5) {
      console.error(`Unexpected number of elements: ${imageId}`);
      return undefined;
    }

    if (els[0].length !== 3) {
      console.error(`Unexpected size for camera type and image type: ${els[0]}`);
      return undefined;
    }
    this.cameraId = els[0].substr(0, 2);
    this.imageType = els[0].substr(2, 1);

    this.sol = parseInt(els[1], 10);
    if (isNaN(this.sol)) {
      console.warn(`Unexpected sol value: ${els[1]}`);
    }

    this.timestamp = els[2];
    this.unkVal0 = els[3];

    this.normalOrThumbnail = els[4].substr(0, 1);
    if (this.normalOrThumbnail !== 'N' && this.normalOrThumbnail !== 'T') {
      console.warn(`Unexpected normalOrThumbnail value: ${els[1]}`);
    }

    // all the rest is unknown
    this.unkVal1 = els.slice(4).join('_').substr(1);
  }

  cameraId: string;
  imageType: string;
  sol: number;
  timestamp: string;
  normalOrThumbnail: string;

  unkVal0: string;
  unkVal1: string;
}

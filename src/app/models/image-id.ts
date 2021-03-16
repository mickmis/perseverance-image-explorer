// Credits to Jim Bell for some details (specific to science cameras though)
// https://mastcamz.asu.edu/decoding-the-raw-publicly-released-mastcam-z-image-filenames/
export class ImageId {

  static ImageIdRegex = /^(\w{2})(\w)_(\d{4})_(\d{10})_(\d{3})(\w{3})_(\w)(\d{3})(\d{4})(\w{4})(\w{5})_(\w{3})(\d)(\w{2})(\w)(\d{2})?$/;


  constructor(imageId: string) {
    // example: RRB_0002_0667129492_604ECM_N0010052AUT_04096_00_2I3J01
    //          ZR5_0002_0667131617_423FDR_N0010052ZCAM00012_0630LUJ02
    //          ZLF_0002_0667132063_000FDR_N0010052AUT_04096_0260LUJ01
    //          NLR_0002_0667129713_685ECM_N0010052AUT_04096_00_2I3J03
    //          NLF_0009_0667755636_926ECM_N0030000NCAM05000_01_295J

    // const rgx = /^Sol-(\d+)M(\d+:\d+):\d+\.\d+$/;

    const els = imageId.match(ImageId.ImageIdRegex);
    if (els.length !== 16 && els.length !== 17) {
      console.error(`Matching image id failed for ${imageId}`);
      return undefined;
    }

    this.instrumentId = els[1];
    this.filter = els[2];
    this.primaryTimestamp = parseInt(els[3], 10);
    this.secondaryTimestamp = parseInt(els[4], 10);
    this.tertiaryTimestamp = parseInt(els[5], 10);
    this.productType = els[6];
    this.normalOrThumbnail = els[7];
    this.siteLocationCount = parseInt(els[8], 10);
    this.driveCount = parseInt(els[9], 10);
    this.sequenceIdInstrument = els[10];
    this.sequenceId = els[11];
    this.focalLength = parseInt(els[12], 10);
    this.downsamplingFlag = els[13];
    this.quality = els[14];
    this.producer = els[15];
    if (els[16]) {
      this.productVersion = parseInt(els[16], 10);
      if (isNaN(this.productVersion)) {
        console.warn(`Unexpected product version: ${els[16]}`);
      }
    }

    if (isNaN(this.primaryTimestamp) || isNaN(this.secondaryTimestamp) || isNaN(this.tertiaryTimestamp)) {
      console.warn(`Unexpected timestamp value: ${els[3]}, ${els[4]}, ${els[5]}`);
    }
    if (isNaN(this.siteLocationCount) || isNaN(this.driveCount)) {
      console.warn(`Unexpected site location or drive count: ${els[8]}, ${els[9]}`);
    }
    if (isNaN(this.focalLength)) {
      console.warn(`Unexpected focal length: ${els[12]}`);
    }
    if (this.normalOrThumbnail !== 'N' && this.normalOrThumbnail !== 'T') {
      console.warn(`Unexpected normalOrThumbnail value: ${els[1]}`);
    }
  }

  // 2-digit instrument id: ZL/ZR=Mastcam-Z Left/Right
  instrumentId: string;

  // 1-digit filter number, 0-7 or F or others, M for skycam
  filter: string;

  // 4-digit primary timestamp: mission sol number
  primaryTimestamp: number;

  // 10-digit secondary timestamp: sclk (= spacecraft clock time)
  secondaryTimestamp: number;

  // 3-digit tertiary timestamp: sclk (= spacecraft clock time) milliseconds
  tertiaryTimestamp: number;

  // 3-digit product type: FDR = final data record (final thing produced by JPL), other possibilites: EDR, ECM, EBY, EJP, EVD, ERD
  // supposedly more details to come about in upcoming documentation
  // ECV for descen cameras? ECM for rover engineering cameras? FDR for Mastcam-Z?
  productType: string;

  // normal or thumbnail flag: N or T
  normalOrThumbnail: string;

  // 3-digit site location count
  siteLocationCount: number;

  // 4-digit drive count position
  driveCount: number;

  // 9 digit sequence id, split in 4 (instrument) + 5 (id); instrument is AUT_ (sol 1-4 cruise software) or ZCAM (typical)
  sequenceIdInstrument: string;
  sequenceId: string;

  // 3-digit focal length indicator in mm
  focalLength: number;

  // 1-digit downsampling flag: 0=2^0 downsampling, 1=2^1 downsampling
  downsamplingFlag: string;

  // image compression quality:
  // LL = lossless? / LU = losslessly uncompressed / 00 = lossy JPEG thumbnail / 01-99 = lossy JPEG compressed quality level
  quality: string;

  // 1-digit producer: J = JPL, A = ASU
  producer: string;

  // 2-digit product version number
  productVersion: number;
}

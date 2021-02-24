export enum ImageResolution {
  Full = 4,
  Large = 3,
  Medium = 2,
  Small = 1
}

export function ImageResolutionToString(val: ImageResolution): string {
  switch (val) {
    case ImageResolution.Full:
      return 'XL';
    case ImageResolution.Large:
      return 'L';
    case ImageResolution.Medium:
      return 'M';
    case ImageResolution.Small:
      return 'S';
  }
}

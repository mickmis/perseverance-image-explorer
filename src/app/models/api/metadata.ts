// tslint:disable:variable-name

export class Metadata {

  // "mars2020"
  mission: string;

  // 0
  page: number;

  // "50"
  per_page: string;

  // 148
  total_images: number;

  // 148
  total_results: number;

  // "mars2020-images-list-1.1"
  type: string;

  // "No more images."
  error_message: string;

  nav: NavMetadata[];
  images: ImageMetadata[];
}

export class NavMetadata {

  // "Engineering Cameras"
  name: string;

  checkboxes: {

    // "Front Hazcam - Left"
    label: string;

    // "FRONT_HAZCAM_LEFT_A|FRONT_HAZCAM_LEFT_B"
    value: string;
  }[];
}

export class ImageMetadata {

  // "(0.415617,-0.00408664,-0.00947025,0.909481)"
  attitude: string;

  // "NASA's Mars Perseverance rover acquired this image of the area in back of it using its onboard Rear Right Hazard
  // Avoidance Camera. ↵↵ This image was acquired on Feb. 21, 2021 (Sol 2) at the local mean solar time of 15:37:11."
  caption: string;

  // "NASA/JPL-Caltech"
  credit: string;

  // "2021-02-21T23:12:58Z"
  date_received: string;

  // "Sol-00002M15:37:11.985"
  date_taken_mars: string;

  // "2021-02-21T02:16:26Z"
  date_taken_utc: string;

  // "52"
  drive: string;

  // "RRB_0002_0667129492_604ECM_N0010052AUT_04096_00_2I3J01"
  imageid: string;

  // "https://mars.nasa.gov/rss/api/?feed=raw_images&category=mars2020&feedtype=json
  // &id=RRB_0002_0667129492_604ECM_N0010052AUT_04096_00_2I3J01"
  json_link: string;

  // "https://mars.nasa.gov/mars2020/multimedia/raw-images/?id=RRB_0002_0667129492_604ECM_N0010052AUT_04096_00_2I3J01"
  link: string;

  // "Full" / "Thumbnail"
  sample_type: string;

  // 1
  site: number;

  // 2
  sol: number;

  // "Mars Perseverance Sol 2: Rear Right Hazard Avoidance Camera (Hazcam)"
  title: string;

  camera: ImageCamera;
  extended: ImageExtended;
  image_files: ImageFiles;
}

export class ImageCamera {

  // "2.0;0.0;(46.176,2.97867,720.521);(-0.701049,0.00940617,0.713051);(8.39e-06,0.0168764,-0.00743155);
  // (-0.00878744,-0.00869157,-0.00676256);(-1.05782,-0.466472,-0.724517);(-0.702572,0.0113481,0.711523);(-448.981,-528.002,453.359)"
  camera_model_component_list: string;

  // "CAHVORE"
  camera_model_type: string;

  // "(-1.05782,-0.466472,-0.724517)"
  camera_position: string;

  // "(-0.7838279435884001,0.600143487448691,0.15950407306054173)"
  camera_vector: string;

  // "UNK"
  filter_name: string;

  // "REAR_HAZCAM_RIGHT"
  instrument: string;
}

export class ImageExtended {

  // "(1280,960)"
  dimension: string;

  // "UNK"
  mastAz: string;

  // "UNK"
  mastEl: string;

  // "4"
  scaleFactor: string;

  // "667129493.453"
  sclk: string;

  // "(1,1,1280,960)"
  subframeRect: string;

  // "(0.0,0.0,0.0)"
  xyz: string;
}

export class ImageFiles {

  // "https://mars.nasa.gov/mars2020-raw-images/pub/ods/surface/sol/00002/ids/edr/browse/rcam/
  // RRB_0002_0667129492_604ECM_N0010052AUT_04096_00_2I3J01.png"
  full_res: string;

  // "https://mars.nasa.gov/mars2020-raw-images/pub/ods/surface/sol/00002/ids/edr/browse/rcam/
  // RRB_0002_0667129492_604ECM_N0010052AUT_04096_00_2I3J01_1200.jpg"
  large: string;

  // "https://mars.nasa.gov/mars2020-raw-images/pub/ods/surface/sol/00002/ids/edr/browse/rcam/
  // RRB_0002_0667129492_604ECM_N0010052AUT_04096_00_2I3J01_800.jpg"
  medium: string;

  // "https://mars.nasa.gov/mars2020-raw-images/pub/ods/surface/sol/00002/ids/edr/browse/rcam/
  // RRB_0002_0667129492_604ECM_N0010052AUT_04096_00_2I3J01_320.jpg"
  small: string;
}

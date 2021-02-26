export class Camera {
  name: string;
  searchQuery: string[];
}

export const NavCams: Camera = {
  name: 'Navigation',
  searchQuery: [
    '|NAVCAM_LEFT',
    '|NAVCAM_RIGHT'
  ]
};

export const FrontHazCams: Camera = {
  name: 'Front Hazcams',
  searchQuery: [
    '|FRONT_HAZCAM_LEFT_A',
    '|FRONT_HAZCAM_LEFT_B',
    '|FRONT_HAZCAM_RIGHT_A',
    '|FRONT_HAZCAM_RIGHT_B'
  ]
};

export const RearHazCams: Camera = {
  name: 'Rear Hazcams',
  searchQuery: [
    '|REAR_HAZCAM_LEFT',
    '|REAR_HAZCAM_RIGHT'
  ]
};

export const MastCams: Camera = {
  name: 'Mastcams',
  searchQuery: [
    '|MCZ_LEFT',
    '|MCZ_RIGHT'
  ]
};

export const ParachuteCams: Camera = {
  name: 'Parachute Up-Look',
  searchQuery: [
    '|EDL_PUCAM1',
    '|EDL_PUCAM2'
  ]
};

export const DescentCams: Camera = {
  name: 'Descent Down-Look',
  searchQuery: ['|EDL_DDCAM']
};

export const RoverUpCam: Camera = {
  name: 'Rover Up-Look',
  searchQuery: ['|EDL_RUCAM']
};

export const RoverDownCam: Camera = {
  name: 'Rover Down-Look',
  searchQuery: ['|EDL_RDCAM']
};

export const AllCams: Camera[] = [NavCams, FrontHazCams, RearHazCams, RoverDownCam]; // RoverUpCam, MastCams, ParachuteCams, DescentCams];

import Image from 'image-js';

export function combineRGB(red: Image, green: Image, blue: Image): Image {
  const combined = Image.createFrom(red, {});
  for (let i = 0 ; i < combined.width * combined.height ; i++) {
    combined.setPixel(i, [red.getPixel(i)[0], green.getPixel(i)[0], blue.getPixel(i)[0]]);
  }
  return combined;
}

// Compute indices of pixels in the image. Notes: division is integer; Wn = width of the new image. Assumes a BGGR pattern.
// Pattern:  |B|G|
//           |G|R|
// B : (i / Wn) * Wn * 4 + (i % Wn) * 2
// G1: (i / Wn) * Wn * 4 + (i % Wn) * 2 + 1
// G2: (i / Wn) * Wn * 4 + (i % Wn) * 2 + Wn * 2
// R : (i / Wn) * Wn * 4 + (i % Wn) * 2 + 1 + Wn * 2
export function demosaic(orig: Image): Image {
  const combined = Image.createFrom(orig, {width: orig.width / 2, height: orig.height / 2});
  for (let i = 0 ; i < combined.width * combined.height ; i++) {
    const C0 = Math.floor(i / combined.width) * combined.width * 4 + (i % combined.width) * 2;
    const C1 = C0 + 1;
    const C2 = C0 + combined.width * 2;
    const C3 = C2 + 1;

    combined.setPixel(i, [orig.getPixel(C0)[0], (orig.getPixel(C1)[0] + orig.getPixel(C2)[0]) / 2, orig.getPixel(C3)[0]]);
  }
  return combined;
}

// export function demosaicConvolution(): void {
//   // https://p5js.org/examples/image-convolution.html
// }
//
// function convolution(x: number, y: number, matrix, matrixsize: number, img) {
//   loadImage()
// }
//   let rtotal = 0.0;
//   let gtotal = 0.0;
//   let btotal = 0.0;
//   const offset = Math.floor(matrixsize / 2);
//   for (let i = 0; i < matrixsize; i++){
//     for (let j = 0; j < matrixsize; j++){
//
//       // What pixel are we testing
//       const xloc = (x + i - offset);
//       const yloc = (y + j - offset);
//       let loc = (xloc + img.width * yloc) * 4;
//
//       // Make sure we haven't walked off our image, we could do better here
//       loc = constrain(loc, 0 , img.pixels.length - 1);
//
//       // Calculate the convolution
//       // retrieve RGB values
//       rtotal += (img.pixels[loc]) * matrix[i][j];
//       gtotal += (img.pixels[loc + 1]) * matrix[i][j];
//       btotal += (img.pixels[loc + 2]) * matrix[i][j];
//     }
//   }
//   // Make sure RGB is within range
//   rtotal = constrain(rtotal, 0, 255);
//   gtotal = constrain(gtotal, 0, 255);
//   btotal = constrain(btotal, 0, 255);
//
//   // Return the resulting color
//   return color(rtotal, gtotal, btotal);

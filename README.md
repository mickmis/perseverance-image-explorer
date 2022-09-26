# Archived Project
**This project will not be updated anymore.**

# Perseverance Image Explorer

Perseverance Image Explorer is a web application that talks to the [NASA raw images API](https://mars.nasa.gov/mars2020/multimedia/raw-images/)
to explore, export and colorize the images taken by the Perseverance rover on Mars. It is implemented in Typescript using Angular v11.

## Upcoming
- parse and explain in a way that a human can understand a maximum of the metadata
- group images per observation
- better demosaicking algorithm: images should not be reduced to 1/4 of their original size
- attempt to stitch images together

## What's new
### 16/03/21 - update
- add full exploration of images: all images can be browsed with specific parameters
- add export features: CSV, JSON and flat URL list
- add pagination of images
- temporarily disable colorization of RBG images

### 26/02/21 - update
- add thumbnails of images
- add colorization of other type of image (images that can be demosaicked) 

### 24/02/21 - Initial version 
- display a filtered list of images per camera (only those that can be colorized)
- colorize images by combining red, green and blue components

# Contact
[Mickaël Misbach](https://github.com/mickmis) - [mickael@misba.ch](mailto:mickael@misba.ch)

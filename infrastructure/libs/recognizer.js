'use strict';

const AWS = require('aws-sdk');
const ImageModel = require('./models/image.model');
const atob = require('atob');
const recognition = new AWS.Rekognition();

class Recognizer {
  constructor() { }

  _getBinary(encodedFile) {

    var binaryImg = atob(encodedFile);
    var length = binaryImg.length;
    var ab = new ArrayBuffer(length);
    var ua = new Uint8Array(ab);
    for (var i = 0; i < length; i++) {
      ua[i] = binaryImg.charCodeAt(i);
    }

    return ab;
  }

  resolveLabels(encodedImage) {
    let imageBytes = this._getBinary(encodedImage);

    const params = {
      Image: {
        Bytes: imageBytes,
      },
      MaxLabels: 10,
      MinConfidence: 50,
    };

    return new Promise((resolve, reject) => {
      recognition.detectLabels(params, (err, data) => {
        if (err) {
          return reject(new Error(err));
        }
        console.log('Analysis labels:', data.Labels);
        return resolve(data.Labels);
      });
    });
  }

  saveLabels(encodedImage, labels) {

    const image = new ImageModel({
      roboRoverId: 'robo_rover',
      labels: labels,
      encodedImage: encodedImage
    });

    return image.save();
  }
}


module.exports = Recognizer;
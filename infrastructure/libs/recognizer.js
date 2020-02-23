'use strict';

const AWS = require('aws-sdk');
const ImageModel = require('./models/image.model');
const atob = require('atob');
const recognition = new AWS.Rekognition();

/**
 * Rocgnizer Class
 */
class Recognizer {
  constructor() { }

  /**
   * Convert image to binary
   * @param {string} encodedFile 
   */
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

  /**
   * Resolve image labels via Rekognition Service
   * @param {string} encodedImage 
   */
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

  /**
   * Save resolved labels and encoded image to DynamoDb
   * @param {any} encodedImage 
   * @param {any} labels 
   */
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
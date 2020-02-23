'use strict';

let { parseBody } = require('../../libs/helper');
let Recognizer = require('../../libs/recognizer');

let recognizer = new Recognizer();

module.exports.handler = async (event) => {

  let data = parseBody(event);

  try {
    let labels = await recognizer.resolveLabels(data.image);
    await recognizer.saveLabels(data.image, labels);

  } catch (e) {
    console.log(e);
  }

};

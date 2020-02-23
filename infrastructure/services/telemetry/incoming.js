'use strict';

let TelemetryModel = require('../../libs/models/telemetry.model');
let { parseEvent } = require('../../libs/helper');

module.exports.handler = async (event, context, callback) => {

  let data = parseEvent(event);
  let telemetry = new TelemetryModel(data);

  try {
    await telemetry.save();
    return callback(null);
  } catch (e) {
    console.log(e);
    return callback(e);
  }
};

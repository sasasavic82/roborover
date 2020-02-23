'use strict';
let _ = require('lodash');

let { parseBody, success, failure } = require('../../libs/helper');
let Commander = require('../../libs/commander');

let commander = new Commander({
  region: process.env.REGION
});

module.exports.handler = async (event) => {

  let data = parseBody(event);

  console.log(data);

  try {
    let ret = await commander.execute(data);
    return success(ret);
  }catch(e) {
    console.log(e);
    return failure(e);
  }

};
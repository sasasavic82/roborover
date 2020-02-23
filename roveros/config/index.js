const _ = require('lodash');
const defaults = require('./default')

module.exports = function environment(env) {
    const config = require('./' + (env || 'development') + '.js');
    return _.merge({}, defaults, config);
}
/**
 * An object containing a configuration for the AirConsoleShakeDetector constructor.
 * @typedef {object} Config
 * @property {Number} threshold - Threshold of the device movement
 * @property {Number} timeout - Time in ms of how often the shake event triggers
 * @property {Function} callback -
 *           The callback that gets called when
 */

/**
 * Recognizes shake-like behaviour of a device
 * @param {Config} opts - Constructor config.
 * @constructor
 */
function AirConsoleShakeDetector(opts) {
  opts = opts || {};
  this.threshold = opts.threshold || 5;
  this.timeout = opts.timeout == undefined ? 100 : opts.timeout;
  this.callback = opts.callback || function() { console.log ("Shaking ...") };
}

AirConsoleShakeDetector.prototype.onDeviceMotion = function(data) {
  if (this.last_x || this.last_y || this.last_z) {
    var dx = Math.abs(this.last_x - data.x);
    var dy = Math.abs(this.last_y - data.y);
    var dz = Math.abs(this.last_z - data.z);

    if (((dx > this.threshold) && (dy > this.threshold)) ||
        ((dx > this.threshold) && (dz > this.threshold)) ||
        ((dy > this.threshold) && (dz > this.threshold))) {
      var now = new Date().getTime();
      if (now - this.timeout > (this.last_callback || 0)) {
        this.last_callback = now;
        this.callback();
      }
    }
  }
  this.last_x = data.x;
  this.last_y = data.y;
  this.last_z = data.z;
};

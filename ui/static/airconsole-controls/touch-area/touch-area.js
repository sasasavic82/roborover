/**
 * An object containing a configuration for the TouchArea constructor.
 * @typedef {object} TouchAreaConfig
 * @property {TouchArea~touchCallback} touchstart -
 *           The callback that gets called when the TouchArea is touched
 * @property {TouchArea~touchCallback} touchmove -
 *           The callback that gets called when the TouchArea is moved
 * @property {TouchArea~touchCallback} touchend -
 *           The callback that gets called when the TouchArea is released
 * @property {boolean} log - Debug output iff a callback is not set.
 */

/**
 * A coordinate is an object with an x and y property.
 * @typedef {object} TouchArea~Offset
 * @param {number} x - The x offset. A value between 0 and 1;
 * @param {number} y - The y offset. A value between 0 and 1;
 */

/**
 * A callback when something happens on the TouchArea (start, move, end)
 * @callback TouchArea~touchCallback
 * @param {TouchArea~Offset} offset - The offset in the TouchArea.
 */


/**
 * An a touchable area that response to start, move, end.
 * @param {HTMLElement|string} el - The HTML container element or its ID.
 * @param {TouchAreaConfig} opts - Constructor config.
 * @constructor
 */
function TouchArea(el, opts) {
  var me = this;
  opts = opts || {}

  var log_cb = function(name) {
    return function (data) {
      if (!opts.log) {
        return;
      }
      if (window.console && window.console.log) {
        window.console.log("touch-area.js " + name + "(" +
                           Array.prototype.slice.call(arguments).join(", ") +
                           ");");
      }
    };
  };

  var start_cb = opts["touchstart"] || log_cb("touchstart");
  var move_cb = opts["touchmove"] || log_cb("touchmove");
  var end_cb = opts["touchend"] || log_cb("touchend");
  var last_pos = null;

  if (typeof el == "string") {
    el = document.getElementById(el);
  }

  me.container = el;

  me.container.addEventListener("touchstart", function(e) {
    var touch = e.targetTouches[0] || e.changedTouches[0] || e.touches[0];
    last_pos = me.getRelativePos(touch);
    start_cb(last_pos);
    e.preventDefault();
  });
  me.container.addEventListener("touchmove", function(e) {
    var touch = e.targetTouches[0] || e.changedTouches[0] || e.touches[0];
    last_pos = me.getRelativePos(touch);
    move_cb(last_pos);
    e.preventDefault();
  });
  me.container.addEventListener("touchend", function(e) {
    end_cb(last_pos);
    e.preventDefault();
  });
  var mouse_down = false;
  if (!('ontouchstart' in document.documentElement)) {
    me.container.addEventListener("mousedown", function(e) {
      last_pos = me.getRelativePos(e);
      start_cb(last_pos);
      mouse_down = true;
      e.preventDefault();
    });
    me.container.addEventListener("mousemove", function(e) {
      if (mouse_down) {
        last_pos = me.getRelativePos(e);
        move_cb(last_pos);
      }
      e.preventDefault();
    });
    me.container.addEventListener("mouseup", function(e) {
      end_cb(last_pos);
      mouse_down = false;
      e.preventDefault();
    })
  }
}

/**
 * Returns the page offset of an event
 * @param {Event} e - An event
 * @return {TouchArea~Coordinate}
 */
TouchArea.prototype.getRelativePos = function(e) {
  var me = this;
  var rect = me.container.getBoundingClientRect();
  var dx = (e.pageX - rect.left)/rect.width;
  var dy = (e.pageY - rect.top)/rect.height;
  return { "x": dx, "y": dy };
};
/**
 * An object containing a configuration for the Joystick constructor.
 * @typedef {object} JoystickConfig
 * @property {Function} touchstart -
 *           The callback that gets called when the Joystick is touched
 * @property {Joystick~touchMoveCallback} touchmove -
 *           The callback that gets called when the Joystick is moved
 * @property {Function} touchend -
 *           The callback that gets called when the Joystick is released
 * @property {number} distance - The maximum amount of pixels a joystick can be
 *                               moved. Default: 10
 * @property {number} min_delta - The minimum delta a joystick needs to have
 *                                moved before we call the callback.
 *                                Default: 0.25
 * @property {boolean} log - Debug output iff a callback is not set.
 */

/**
 * A coordinate is an object with an x and y property.
 * @typedef {object} Joystick~Offset
 * @param {number} x - The x offset. A value between -1 and 1;
 * @param {number} y - The y offset. A value between -1 and 1;
 */

/**
 * This callback is called when the direction of a DPad changes.
 * @callback Joystick~touchMoveCallback
 * @param {Joystick~Offset} offset - The offset of the joystick.
 */

/**
 * A coordinate is an object with an x and y property.
 * @typedef {object} Joystick~Coordinate
 * @param {number} x - The x coordinate
 * @param {number} y - The y coordinate
 */

/**
 * An analogue relative joystick.
 * @param {HTMLElement|string} el - The HTML container element or its ID.
 * @param {JoystickConfig} opts - Constructor config.
 * @constructor
 */
function JoystickRelative(el, opts) {
  var me = this;
  opts = opts || {};
  me.opts = opts;

  if (typeof el == "string") {
    el = document.getElementById(el);
  }
  me.container = el;
  me.base_stick = el.getElementsByClassName("joystick-relative-base-stick")[0];
  me.stick = el.getElementsByClassName("joystick-relative-stick")[0];

  me.container_bbox = null;
  me.max_size = 0;
  me.center = { x: 0, y: 0};
  me.core_center_radius_px = 0;
  me.is_touch_down = false;
  me.start_move_ts = null;
  me.was_center = false;

  // =====================================================================================

  var log_cb = function(name) {
    return function (data) {
      if (!opts.log) {
        return;
      }
      if (window.console && window.console.log) {
        window.console.log("joystick.js " + name + "(" +
                           Array.prototype.slice.call(arguments).join(", ") +
                           ");");
      }
    };
  };

  // =====================================================================================
  // EVENTS

  me.start_cb = opts["touchstart"] || log_cb("touchstart");
  me.move_cb = opts["touchmove"] || log_cb("touchmove");
  me.end_cb = opts["touchend"] || log_cb("touchend");

  var touch_enabled = "ontouchstart" in document.createElement("div");
  var event_down = touch_enabled ? 'touchstart' : 'mousedown';
  var event_up = touch_enabled ? 'touchend' : 'mouseup';
  var event_move = touch_enabled ? 'touchmove' : 'mousemove';
  var event_out = touch_enabled ? 'touchleave' : 'mouseout';

  me.container.addEventListener(event_down, me.onStart.bind(me));
  me.container.addEventListener(event_move, me.onMove.bind(me));
  me.container.addEventListener(event_up, me.onEnd.bind(me));

  this.initElementSizes();
  window.addEventListener('resize', me.initElementSizes.bind(me));
}

JoystickRelative.Area = {
  Inner: 'inner',
  Middle: 'middle',
  Outer: 'outer'
};

JoystickRelative.prototype.initElementSizes = function() {
  var me = this;
  me.container_bbox = me.container.getBoundingClientRect();
  me.max_size = Math.min(me.container_bbox.width, me.container_bbox.height);
  me.inner_radius_percent = me.opts.inner_radius_percent || 90;
  var base_stick_size_percent = me.opts.base_stick_size_percent || 55;
  var stick_size_percent = me.opts.stick_size_percent || 20;
  me.center = {
    x: ((me.container_bbox.width) / 2),
    y: ((me.container_bbox.height) / 2)
  };

  // BASE STICK
  if (me.base_stick) {
    var base_stick_radius = Math.round((me.max_size * base_stick_size_percent) / 100);
    var margin = (-base_stick_radius / 2) + "px";
    me.base_stick.style.width = base_stick_radius + "px";
    me.base_stick.style.height = base_stick_radius + "px";
    me.base_stick.style.marginLeft = margin;
    me.base_stick.style.marginTop = margin;
    me.core_center_radius_px = base_stick_radius / 2;
    me.placeBaseStick(me.center.x, me.center.y);
  }

  // STICK
  if (me.stick) {
    var stick_radius = Math.round((base_stick_radius * stick_size_percent) / 100);
    var margin = (-stick_radius / 2) + "px";
    me.stick.style.width = stick_radius + "px";
    me.stick.style.height = stick_radius + "px";
    me.stick.style.marginLeft = margin;
    me.stick.style.marginTop = margin;
    me.placeStick(me.center.x, me.center.y);
  }

  // Inner "Non-DPAD" circle
  me.inner_radius_size_px = ((me.max_size * me.inner_radius_percent) / 100) / 2;
  var inner_ele = me.container.getElementsByClassName("joystick-inner-radius")[0];
  var r = me.inner_radius_size_px;
  inner_ele.style.left = (me.center.x - r) + "px";
  inner_ele.style.top = (me.center.y - r) + "px";
  inner_ele.style.width = r * 2 + "px";
  inner_ele.style.height = r * 2 + "px";
};

JoystickRelative.prototype.getBaseStickCenter = function() {
  var container_bbox = this.container_bbox;
  var bbox = this.base_stick.getBoundingClientRect();
  return {
    x: bbox.left - container_bbox.left + bbox.width / 2,
    y: bbox.top - container_bbox.top + bbox.height / 2
  };
};

/**
 * Gets called when the Joystick gets touched
 * @param {HTMLEvent} e - The input event
 */
JoystickRelative.prototype.onStart = function(e) {
  var me = this;
  me.start_move_ts = new Date().getTime();
  var touch_point = me.getRelativePos(e);

  //
  var distance_to_center = me.getDistanceBetweenTwoPoints(me.center, touch_point);
  var is_in_center = me.isInCenter(touch_point);
  if (!is_in_center) {
    var angle = me.getAngleBetweenTwoPoints(me.center, touch_point);
    var distance_perc = Math.min((me.core_center_radius_px * distance_to_center) / 100, 100);
    var stick_distance_px = ((me.base_stick.offsetWidth / 2) * distance_perc) / 100;
    var base_center = touch_point;
    var stick_pos_x = base_center.x - Math.cos(angle) * stick_distance_px;
    var stick_pos_y = base_center.y - Math.sin(angle) * stick_distance_px;
    me.placeBaseStick(stick_pos_x, stick_pos_y);
    me.placeStick(touch_point.x, touch_point.y);
  } else {
    me.placeStick(touch_point.x, touch_point.y);
  }

  me.is_touch_down = true;
  var swipe_vector = me.getSwipeVector(touch_point, this.getBaseStickCenter());
  me.start_cb(swipe_vector);
  e.preventDefault();
};

/**
 * Gets called when the Joystick is moved.
 * @param {HTMLEvent} e - The input event
 */
JoystickRelative.prototype.onMove = function(e) {
  var me = this;
  e.preventDefault();
  if (!me.is_touch_down) return;
  var touch_point = me.getRelativePos(e);
  var in_base_stick = me.isWithinBaseStick(touch_point);
  var is_in_center = !me.was_center && me.isInCenter(touch_point);
  if (is_in_center) {
    return;
  } else {
    me.was_center = true;
  }

  if (!in_base_stick) {
    me.placeStick(touch_point.x, touch_point.y);
    this.adjustBaseStick(touch_point);
  } else {
    me.placeStick(touch_point.x, touch_point.y);
  }
  var swipe_vector = me.getSwipeVector(touch_point, me.getBaseStickCenter());
  me.move_cb(swipe_vector);
};

/**
 * Gets called when the the Joystick is released.
 * @param {HTMLEvent} e - The input event
 */
 JoystickRelative.prototype.onEnd = function(e) {
  var me = this;
  me.is_touch_down = false;
  me.end_cb();
  e.preventDefault();
};

JoystickRelative.prototype.isWithinBaseStick = function(touch_point) {
  var distance = this.getDistanceBetweenTwoPoints(touch_point, this.getBaseStickCenter());
  return distance <= this.core_center_radius_px;
};

JoystickRelative.prototype.isInCenter = function(touch_point) {
  var me = this;
  var is_center = false;
  var base_center = this.getBaseStickCenter();
  var distance_base_center = me.getDistanceBetweenTwoPoints(base_center, me.center);
  var distance_stick_center = me.getDistanceBetweenTwoPoints(touch_point, me.center);
  if (distance_base_center <= 2 &&
      distance_stick_center <= 20) {
    is_center = true;
  }
  return is_center;
};

JoystickRelative.prototype.adjustBaseStick = function(touch_point) {
  var me = this;
  var angle = me.getAngleBetweenTwoPoints(touch_point, me.getBaseStickCenter());
  var radius = me.core_center_radius_px - 2;
  var base_point = {
    x: touch_point.x + Math.cos(angle) * radius,
    y: touch_point.y + Math.sin(angle) * radius
  };
  me.placeBaseStick(base_point.x, base_point.y);
};

JoystickRelative.prototype.placeBaseStick = function(x, y) {
  var bbox = this.container_bbox;
  this.placeRelative(x, y, this.base_stick, bbox);
};

JoystickRelative.prototype.placeStick = function(x, y) {
  var bbox = this.base_stick.getBoundingClientRect();
  // Place center
  if (x === undefined || y === undefined) {
    x = bbox.left + bbox.width / 2;
    y = bbox.top + bbox.height / 2;
  }
  this.placeRelative(x, y, this.stick, bbox);
};

/**
 * Places the relative joystick element.
 * @param {number} dx - The x offset in pixels
 * @param {number} dy - The y offset in pixels
 */
 JoystickRelative.prototype.placeRelative = function(dx, dy, ele, bbox) {
  var me = this;
  var cbox = me.container_bbox;
  var child_bbox = ele.getBoundingClientRect();
  var child_radius = child_bbox.width / 2;

  if (dx - child_radius < bbox.left) {
    dx = bbox.left - cbox.left + child_radius;
  }
  if (dx + child_radius > bbox.right) {
    dx = bbox.right - child_radius;
  }
  if (dy - child_radius < bbox.top) {
    dy = bbox.top - cbox.top + child_radius;
  }
  if (dy + child_radius > bbox.bottom) {
    dy = bbox.bottom - child_radius;
  }

  ele.style.left = (dx) + "px";
  ele.style.top = (dy) + "px";
};

/**
 * Returns the page offset of an event
 * @param {Event} e - An event
 * @return {Joystick~Coordinate}
 */
JoystickRelative.prototype.getRelativePos = function(e) {
  var pos = this.getEventPoint(e);
  var rect = this.container_bbox;
  var x = (pos.x - rect.left - window.scrollX);
  var y = (pos.y - rect.top - window.scrollX);
  return { x: x, y: y };
};

/**
 * Returns true if we swiped more than min swiped distance
 * @param {Event} e - An event
 * @return {object|null}
 */
 JoystickRelative.prototype.getSwipeVector = function(touch_point, center) {
  var pos = touch_point;
  var vec = center;
  var swipe_vector = null;

  // Check if distance has been exceeded and calculate direction vector
  var distance = this.getDistanceBetweenTwoPoints(pos, vec);
  swipe_vector = this.getNormalizedVector({
    x: pos.x - vec.x,
    y: pos.y - vec.y
  });

  var angle = Math.atan2(swipe_vector.y, swipe_vector.x);
  if (angle < 0) {
    angle += 2 * Math.PI;
  }
  swipe_vector.distance = distance;
  swipe_vector.angle = angle;
  swipe_vector.degree = Math.round(angle * 180 / Math.PI);
  if (this.start_move_ts) {
    var time_delta = (+new Date()) - this.start_move_ts;
    swipe_vector.speed = Math.round(distance / (time_delta / 1000), 10);
  }
  return swipe_vector;
};

/**
 * Returns the event point coordinates considering both touch and mouse events
 * @param {Event} e - An event
 * @return {DPad~Coordinate}
 */
JoystickRelative.prototype.getEventPoint = function(e) {
  var out = { x: 0, y: 0 };
  if(e.touches && (e.type == 'touchstart' || e.type == 'touchmove' ||
    e.type == 'touchend' || e.type == 'touchcancel')) {
    var touch = e.targetTouches[0] || e.changedTouches[0] || e.touches[0];
    out.x = touch.pageX;
    out.y = touch.pageY;
  } else if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' ||
             e.type == 'mouseover'|| e.type=='mouseout' || e.type=='mouseenter' ||
             e.type=='mouseleave') {
    out.x = e.pageX;
    out.y = e.pageY;
  }
  return out;
};

/**
 * Returns the distance between two points
 * @param {Point} p1 - Format {x, y}
 * @param {Point} p2 - Format {x, y}
 * @return {Number}
 */
JoystickRelative.prototype.getDistanceBetweenTwoPoints = function(p1, p2) {
  return Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));
};

/**
 * Returns the angle between two points in radians
 * @param {DPad~Coordinate} p1
 * @param {DPad~Coordinate} p2
 * @return {Number}
 */
JoystickRelative.prototype.getAngleBetweenTwoPoints = function(p1, p2) {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
};

/**
 * Returns a normlized vector
 * @param {Vector} vector
 * @return {Object}
 */
JoystickRelative.prototype.getNormalizedVector = function(vec) {
  var len = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
  return {
    x: (vec.x / len),
    y: (vec.y / len)
  }
};

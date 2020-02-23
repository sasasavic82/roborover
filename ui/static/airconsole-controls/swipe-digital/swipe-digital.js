/**
 * An object containing a configuration for the SwipeDigital constructor.
 * @typedef {object} Config
 * @property {SwipeDigital~onTrigger} onTrigger - The callback which gets triggered when
 *            the min amount of pixel has been swiped.
 * @property {Function} touchstart -
 *           The callback that gets called when the SwipeDigital is touched
 * @property {SwipeDigital~touchEndCallback} touchend -
 *           The callback that gets called when the SwipeDigital is released
 *           The first param is the event object. The second a boolean if swipe
 *           was triggered.
 * @property {number|undefined} min_swipe_distance - amount of pixels
 *           which the user needs to move or tap the SwipeDigital before triggering a
 *           direction. E.g: 20
 * @property {SwipeDigital~ALLOWED_DIRECTIONS|undefined} allowed_directions - If to allow
             4 directions, 8 directions or simply vertical or horizontal
 * @property {boolean} log - Debug output iff a callback is not set.
 */

/**
 * This callback is called when the amount of pixels swiped exceeds the
 * min_swipe_distance
 * @callback SwipeDigital~onTrigger
 * @param {SwipeDigital~ActiveDirection} directions - An object. Active directions are true
 *         E.g {left: true, top: false, ... }
 */

/**
 * A 4-way or 8-way relative swipe area, which triggers after the user swiped a specified
 * amount of pixel.
 * @param {HTMLElement|string} el - The HTML container element or its ID.
 * @param {Config} opts - Constructor config.
 * @constructor
 */
var SwipeDigital = function(el, opts) {
  opts = opts || {}
  this.min_swipe_distance = opts.min_swipe_distance || 30;
  this.allowed_directions = opts.allowed_directions || SwipeDigital.ALLOWED_DIRECTIONS.FOURWAY;
  this.is_touch_down = false;
  this.has_triggered_for_current_swipe = false;
  this.start_position = {
    x: 0,
    y: 0
  };
  this.active_directions = {
    down: false,
    up: false,
    left: false,
    right: false
  };

  if (typeof el == "string") {
    el = document.getElementById(el);
  }
  this.container = el;

  var log_cb = function(name) {
    return function (data) {
      if (!opts.log) {
        return;
      }
      if (window.console && window.console.log) {
        window.console.log("swipe-area.js " + name + "(" +
                           Array.prototype.slice.call(arguments).join(", ") +
                           ");");
      }
    };
  };

  this.start_cb = opts["touchstart"] || log_cb("touchstart");
  this.move_cb = opts["touchmove"] || log_cb("touchmove");
  this.end_cb = opts["touchend"] || log_cb("touchend");
  this.trigger_cb = opts["onTrigger"] || log_cb("trigger");
  this.bindEvents();
};

SwipeDigital.ALLOWED_DIRECTIONS = {
  FOURWAY: 'fourway', // UP, DOWN, LEFT, RIGHT
  EIGHTWAY: 'eightway', // UP, DOWN, LEFT, RIGHT but up to 2 at the same time
  HORIZONTAL: 'horizontal', // LEFT or RIGHT
  VERTICAL: 'vertical' // UP or DOWN
};

/**
 * Direction up
 * @constant
 * @type {string}
 */
 SwipeDigital.UP = "up";

/**
 * Direction down
 * @constant
 * @type {string}
 */
 SwipeDigital.DOWN = "down";

/**
 * Direction left
 * @constant
 * @type {string}
 */
 SwipeDigital.LEFT = "left";

/**
 * Direction right
 * @constant
 * @type {string}
 */
 SwipeDigital.RIGHT = "right";

SwipeDigital.prototype = {

  /**
   * Binds touch and mouse events to handlers
   */
  bindEvents: function() {
    this.container.addEventListener("touchstart", this.onTouchStart.bind(this));
    this.container.addEventListener("touchmove", this.onTouchMove.bind(this));
    this.container.addEventListener("touchend", this.onTouchEnd.bind(this));
    //
    if (!("ontouchstart" in document.createElement("div"))) {
      this.container.addEventListener("mousedown", this.onTouchStart.bind(this));
      this.container.addEventListener("mousemove", this.onTouchMove.bind(this));
      this.container.addEventListener("mouseup", this.onTouchEnd.bind(this));
    }
  },

  /**
   * Triggered on touch start
   * @param {Event} e - An event
   */
  onTouchStart: function(e) {
    this.is_touch_down = true;
    this.setStartPosition(e);
    this.start_cb(e);
    e.preventDefault();
    this.container.className += " button-active";
  },

  /**
   * Triggered on touch move
   * @param {Event} e - An event
   */
  onTouchMove: function(e) {
    if (this.is_touch_down) {
      this.move_cb(e);
      if (this.has_triggered_for_current_swipe) return;
      var has_directions = this.distanceExceeded(e);
      if (has_directions) {
        this.has_triggered_for_current_swipe = true;
        this.trigger_cb(this.active_directions);
      }
    }
    e.preventDefault();
  },

  /**
   * Triggered on touch end
   * @param {Event} e - An event
   */
  onTouchEnd: function(e) {
    this.is_touch_down = false;
    this.end_cb(e, this.has_triggered_for_current_swipe);
    this.has_triggered_for_current_swipe = false;
    this.container.className = this.container.className.replace(/ button\-active/g, "");
    e.preventDefault();
  },

  /**
   * Sets the start position point
   * @param {Event} e - An event
   */
  setStartPosition: function(e) {
    var pos = this.getRelativePos(e);
    this.start_position = {
      x: pos.x,
      y: pos.y
    };
  },

  /**
   * Resets all active directions
   */
  resetActiveDirections: function() {
    for(var dir in this.active_directions) {
      this.active_directions[dir] = false;
    }
  },

  /**
   * Returns true if we swiped more than min swiped distance
   * @param {Event} e - An event
   * @return {Boolean}
   */
  distanceExceeded: function(e) {
    this.resetActiveDirections();
    var pos = this.getRelativePos(e);
    var vec = this.start_position;
    var has_directions = false;

    if (this.allowed_directions ===
        SwipeDigital.ALLOWED_DIRECTIONS.HORIZONTAL) {
      pos.y = vec.y;
    }
    if (this.allowed_directions ===
        SwipeDigital.ALLOWED_DIRECTIONS.VERTICAL) {
      pos.x = vec.x;
    }

    // Check if distance has been exceeded
    var distance = this.getDistanceBetweenTwoPoints(pos, vec);
    if (distance >= this.min_swipe_distance) {
      // Calculate reference angle between start vector and current pos in radian
      // to get the swipe direction
      var angle = Math.atan2(pos.y - vec.y, pos.x - vec.x);
      if (angle < 0) {
        angle += 2 * Math.PI;
      }
      var diagonal_extension = (
          this.allowed_directions == SwipeDigital.ALLOWED_DIRECTIONS.EIGHTWAY ?
          Math.PI / 8 : 0);

      if (angle <= Math.PI/4 + diagonal_extension ||
          angle > Math.PI*7/4-diagonal_extension) {
        has_directions = true;
        this.active_directions[SwipeDigital.RIGHT] = true;
      }

      if (angle >= Math.PI*3/4 - diagonal_extension &&
          angle < Math.PI*5/4 + diagonal_extension) {
        has_directions = true;
        this.active_directions[SwipeDigital.LEFT] = true;
      }

      if (angle >= Math.PI/4 - diagonal_extension &&
          angle < Math.PI*3/4 + diagonal_extension) {
        has_directions = true;
        this.active_directions[SwipeDigital.DOWN] = true;
      }

      if (angle >= Math.PI*5/4 - diagonal_extension &&
          angle < Math.PI*7/4 + diagonal_extension) {
        has_directions = true;
        this.active_directions[SwipeDigital.UP] = true;
      }
    }
    return has_directions;
  },

  /**
   * Returns the page offset of an event
   * @param {Event} e - An event
   * @return {Joystick~Coordinate}
   */
  getRelativePos: function(e) {
    var pos = this.getEventPoint(e);
    var rect = this.container.getBoundingClientRect();
    var x = pos.x - rect.left - window.scrollX;
    var y = pos.y - rect.top - window.scrollY;
    return { x: x, y: y };
  },

  /**
   * Returns the event point coordinates considering both touch and mouse events
   * @param {Event} e - An event
   * @return {DPad~Coordinate}
   */
  getEventPoint: function(e) {
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
  },

  /**
   * Returns the distance between two points
   * @param {Point} p1 - Format {x, y}
   * @param {Point} p2 - Format {x, y}
   * @return {Number}
   */
  getDistanceBetweenTwoPoints: function(p1, p2) {
    return Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));
  }

};

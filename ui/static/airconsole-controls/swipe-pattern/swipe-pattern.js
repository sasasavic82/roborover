/**
 * An object containing a configuration for the SwipePattern constructor.
 * @typedef {object} SwipePatternConfig
 * @property {Function} onTouchCircle -
 *           The callback that gets called when a circle was touched
 * @property {Function} touchend -
 *           The callback that gets called when the SwipePattern is released
 * @property {number} circles - A list of SwipePattern~Circle
 * @property {SwipePattern~Style} style - A configuration style object
 */

/**
 * A circle is an object with an x, y and radius property.
 * @typedef {object} SwipePattern~Circle
 * @param {number} x - The x coordinate
 * @param {number} y - The y coordinate
 * @param {number} radius - The radius of the circle
 * @param {mixed} id - (Optional) The id to identify the circle
 * @param {object} style - (Optional) The style object to style a circle individually
 *                         {fill_color <Color>, stroke_width <Number> ,stroke_color <Color>}
 */

/**
 * A coordinate is an object with an x and y property.
 * @typedef {object} SwipePattern~Coordinate
 * @param {number} x - The x coordinate
 * @param {number} y - The y coordinate
 */

/**
 * A style object to set a global style for circles and lines
 * @typedef {object} SwipePattern~Style
 * @param {object} circle - Styles applied to all circles ({fill_color, stroke_width,stroke_color})
 * @param {number} line - Style to apply to lines ({stroke_width, stroke_color})
 */

/**
 * A pattern of circles, which you can connect by swiping.
 * @param {HTMLElement|string} el - The HTML container element or its ID.
 * @param {SwipePatternConfig} opts - Constructor config.
 * @constructor
 */
var SwipePattern = function(el, opts) {
  var me = this;
  opts = opts || {}
  //
  this.container = el;
  this.touchend_cb = opts.touchend || null;
  this.onTouchCircle = opts.onTouchCircle || null;
  this.style = opts.style || {
    circle: {
      fill_color: '#222222',
      stroke_color: "#ADEE00",
      stroke_width: 2
    },
    line: {
      stroke_color: "#54D7FF",
      stroke_width: 8
    }
  };
  //
  this.scale = 1;
  this.circle_opts = opts.circles || [];
  this.circles = [];
  this.touched_circles = [];
  this.current_line = null;
  this.canvas = null;
  this.ctx = null;
  this.is_mousedown = false;
  //
  this.setup(opts);
};

SwipePattern.prototype = {

  /**
   * Setups up canvas and circles
   * @param {Object} opts - Passed opts of the constructor
   */
  setup: function(opts) {
    this.canvas = document.createElement("canvas");
    var container_rect = this.container.getBoundingClientRect();
    this.canvas.className = 'swipe-pattern-canvas';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");
    this.bindEvents();
    this.build();
  },

  build: function() {
    this.clearTouchedCircles();
    this.createCircleObjects(this.circle_opts);
    this.drawCircles();
  },

  checkResize: function(most_right_circle, most_bottom_circle) {
    var need_width = most_right_circle.x + most_right_circle.radius + 10;
    var need_height = most_bottom_circle.y + most_bottom_circle.radius + 10;
    var container_rect = this.container.getBoundingClientRect();
    var parent_rect = container_rect;
    // We need to scale
    if (need_width > container_rect.width || need_height > container_rect.height) {
      this.canvas.width = Math.max(need_width, container_rect.width);
      this.canvas.height = Math.max(need_height, container_rect.height);
      var scale = Math.min(container_rect.width / (need_width), container_rect.height / need_height);
      this.canvas.style.transformOrigin = "left top";
      this.canvas.style.webkitTransform = "scale(" + scale + ", " + scale + ")";
      this.canvas.style.transform = "scale(" + scale + ", " + scale + ")";
      this.canvas.style.msTransform = "scale(" + scale + ", " + scale + ")";
      this.canvas.style.OTransform = "scale(" + scale + ", " + scale + ")";
      this.scale = scale;
    } else {
      this.canvas.width = Math.min(need_width, container_rect.width);
      this.canvas.height = Math.min(need_height, container_rect.height);
      parent_rect = this.container.parentNode.getBoundingClientRect();
    }

    var offset_y = Math.max(0, (parent_rect.height - container_rect.height) / 2);
    this.container.style.marginTop = offset_y + "px";
  },

  /**
   * Bind input events to handlers
   */
  bindEvents: function() {
    this.container.addEventListener("touchstart", this.onTouchStartHandler.bind(this));
    this.container.addEventListener("touchmove", this.onTouchMoveHandler.bind(this));
    this.container.addEventListener("touchend", this.onTouchEndHandler.bind(this));

    // Mouse fallback
    if (!("ontouchstart" in document.createElement("div"))) {
      this.container.addEventListener("mousedown", this.onTouchStartHandler.bind(this));
      this.container.addEventListener("mousemove", this.onTouchMoveHandler.bind(this));
      this.container.addEventListener("mouseup", this.onTouchEndHandler.bind(this));
    }

    window.addEventListener('resize', this.build.bind(this));
  },

  /**
   * Returns circle object if touch point is touching a circle
   * @return {SwipePattern~Circle}
   */
  mousePointInCircle: function(point) {
    var is_in = null;
    for (var i = 0; i < this.circles.length; i++) {
      var circle = this.circles[i];
      if (this.pointInCircle(point, circle)) {
        is_in = circle;
        break;
      }
    }
    return is_in;
  },

  /**
   * Check if to add a circle to the touched circles
   * @param {SwipePattern~Circle} circle
   */
  addConnectionLine: function(circle) {
    var last_circle = this.touched_circles[this.touched_circles.length - 1];
    // Set next link if it is not the same circle
    if ((last_circle && last_circle.id !== circle.id) || !last_circle) {
      this.addTouchedCircle(circle);
      if (last_circle) {
        this.current_line = null;
        this.drawConnections();
      }
    }
  },

  /**
   * Adds a touched circle to the touched circles list
   * @param {SwipePattern~Circle} circle
   */
  addTouchedCircle: function(circle) {
    var circle_data = {
      id: circle.id,
      x: circle.x,
      y: circle.y,
      radius: circle.radius
    };
    this.touched_circles.push(circle_data);
    if (this.onTouchCircle) {
      this.onTouchCircle(circle_data);
    }
  },

  /**
   * Called on touch start
   * @param {Event} e
   */
  onTouchStartHandler: function(e) {
    this.is_mousedown = true;
    this.update();
    e.preventDefault();
  },

  /**
   * Called on touch move
   * @param {Event} e
   */
  onTouchMoveHandler: function(e) {
    if (this.is_mousedown) {
      var point = this.getRelativePos(e);
      var circle = this.mousePointInCircle(point);
      if (circle) {
        this.addConnectionLine(circle);
      } else {
        this.current_line = {x: point.x, y: point.y};
      }
    }
    e.preventDefault();
  },

  /**
   * Called on touch end
   * @param {Event} e
   */
  onTouchEndHandler: function(e) {
    this.is_mousedown = false;
    if (this.touchend_cb) {
      this.touchend_cb(this.touched_circles);
    }
    this.clearTouchedCircles();
    e.preventDefault();
  },

  clearTouchedCircles: function() {
    this.touched_circles = [];
    this.clearCanvas();
    this.drawCircles();
  },

  // ======================================================

  /**
   * Clears the canvas
   */
  clearCanvas: function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },

  /**
   * Draw method to draw all objects
   */
  draw: function() {
    this.clearCanvas();
    this.drawCircles();
    this.drawConnections();
    this.drawDragLine();
  },

  /**
   * Draw the current line
   */
  drawDragLine: function() {
    var last_circle = this.touched_circles[this.touched_circles.length - 1];
    if (last_circle && this.current_line) {
      this.drawLine(last_circle, this.current_line);
    }
  },

  /**
   * Update tick method
   */
  update: function() {
    if (!this.is_mousedown) return;
    this.draw();
    requestAnimationFrame(this.update.bind(this));
  },

  /**
   * Draws all circles
   */
  drawCircles: function() {
    for (var i = 0; i < this.circles.length; i++) {
      var circle = this.circles[i];
      this.drawCircle(circle);
    }
  },

  /**
   * Draws all connections
   * @param {Array|undefined} connects - A list of line segments or default the touched circles
   */
  drawConnections: function(connections) {
    connections = connections || this.touched_circles;
    for (var i = 0; i < connections.length; i++) {
      var circle = connections[i];
      if (i === 0) continue;
      var prev = connections[i - 1];
      if (prev) {
        this.drawLine(circle, prev);
      }
    }
  },

  /**
   * Creates circle objects
   * @param {Array} circles - A list of circles
   */
  createCircleObjects: function(circles) {
    var most_right = null;
    var most_bottom = null;
    for (var i = 0; i < circles.length; i++) {
      var p = circles[i];
      var opts = {
        id: p.id || (i + 1),
        x: p.x,
        y: p.y,
        radius: p.radius || 30,
        style: p.style || null
      };
      if (!most_bottom || p.y > most_bottom.y) {
        most_bottom = opts;
      }
      if (!most_right || p.x > most_right.x) {
        most_right = opts;
      }
      this.circles.push(opts);
    }
    this.checkResize(most_right, most_bottom);
  },

  /**
   * Returns true if a sequence of ids has been touched
   * @param {Array} sequence - A list of circle ids: E.g. [1, 5, 7] (or own specified ids)
   * @param {Boolean} order_matters - If true check if the order is the same as in the
   *                                  touched circles, or (false) just check if these
   *                                  circles have been touched.
   * @return {Boolean}
   */
  pathIsTouched: function(sequence, order_matters) {
    if (!this.touched_circles.length) return false;
    var len = sequence.length;
    var counter = 0;
    var result = false;
    for (var i = 0; i < sequence.length; i++) {
      // Order matters
      if (order_matters) {
        if (this.touched_circles[i]) {
          if (sequence[i] === this.touched_circles[i].id) {
            counter++;
          }
        }
        result = counter === len;
      // Order does not matter, just check if they are touched
      } else {
        for (var t = 0; t < this.touched_circles.length; t++) {
          if (this.touched_circles[t].id === sequence[i]) {
            counter++;
            break;
          }
        }
        result = counter === len && this.touched_circles.length == len;
      }
    }
    return result;
  },

  // ======================================================

  /**
   * Draws a circle on the canvas
   * @param {SwipePatter~Circle} circle
   */
  drawCircle: function(circle) {
    this.ctx.beginPath();
    this.ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false);
    var style = circle.style || this.style.circle;
    this.ctx.fillStyle = style.fill_color;
    this.ctx.fill();
    this.ctx.lineWidth = style.stroke_width;
    this.ctx.strokeStyle = style.stroke_color;
    this.ctx.stroke();
  },

  /**
   * Draws a line between two points
   * @return {SwipePattern~Coordinate} start
   * @return {SwipePattern~Coordinate} end
   */
  drawLine: function(start, end) {
    var style = this.style.line;
    this.ctx.beginPath();
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.closePath();
    this.ctx.lineWidth = style.stroke_width;
    // set line color
    this.ctx.strokeStyle = style.stroke_color;
    this.ctx.stroke();
  },

  /**
   * Returns point
   * @param {Event} e
   * @return {SwipePattern~Coordinate}
   */
  getRelativePos: function(e) {
    var pos = this.getEventPoint(e);
    var rect = this.canvas.getBoundingClientRect();
    var x = (pos.x - rect.left - window.scrollX) / this.scale;
    var y = ( pos.y - rect.top - window.scrollY) / this.scale;
    return { x: x, y: y };
  },

  /**
   * Returns true if a point is in a circle
   * @return {SwipePattern~Coordinate} point
   * @param {SwipePattern~Circle} circle
   */
  pointInCircle: function(point, circle) {
    var distance = Math.pow(circle.x - point.x, 2) + Math.pow(circle.y - point.y, 2);
    return distance <= (circle.radius * circle.radius);
  },

  /**
   * Returns the event point coordinates considering both touch and mouse events
   * @param {Event} e - An event
   * @return {SwipePattern~Coordinate}
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
  }

};

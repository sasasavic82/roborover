/**
 * A generator for an AirConsole controller with 3-sections left, middle, right - in which
 * you can place input elements such as DPad, Joystick and Buttons. On an input event it
 * sends a message to the AirConsole.Screen
 * @constructor
 */
var CtrlGenerator = (function() {
  var id_counter = 0;
  var airconsole_obj = null;
  var rate_limiter = null;
  var debug = false;
  var generated_config = {
    left: null,
    middle: null,
    right: null
  };
  var left_ele = document.getElementById('left');
  var middle_ele = document.getElementById('middle');
  var right_ele = document.getElementById('right');

  var Side = {
    left: 'left',
    middle: 'middle',
    right: 'right'
  };

  var Element = {
    left: left_ele,
    middle: middle_ele,
    right: right_ele
  };

  var Type = {
    EMPTY: {
      label: 'EMPTY',
      class_name: null
    },
    DPadRelative: {
      label: 'DPadRelative',
      class_name: 'DPad'
    },
    DPad: {
      label: 'DPad',
      class_name: 'DPad'
    },
    Joystick: {
      label: 'Joystick',
      class_name: 'Joystick'
    },
    ButtonVertical: {
      label: 'ButtonVertical',
      class_name: 'Button'
    },
    ButtonMiddle: {
      label: 'ButtonMiddle',
      class_name: 'Button'
    },
    SwipeDigital: {
      label: 'SwipeDigital',
      class_name: 'SwipeDigital'
    },
    SwipeAnalog: {
      label: 'SwipeAnalog',
      class_name: 'SwipeAnalog'
    },
    SwipePattern: {
      label: 'SwipePattern',
      class_name: 'SwipePattern'
    }
  };

  var GeneratorMap = {};
  GeneratorMap[Type.DPad.label] = generatePad;
  GeneratorMap[Type.DPadRelative.label] = generatePadRelative;
  GeneratorMap[Type.Joystick.label] = generatePad;
  GeneratorMap[Type.ButtonVertical.label] = generateButtonVertical;
  GeneratorMap[Type.ButtonMiddle.label] = generateButtonsMiddle;
  GeneratorMap[Type.SwipeDigital.label] = generateSwipeArea;
  GeneratorMap[Type.SwipeAnalog.label] = generateSwipeArea;
  GeneratorMap[Type.SwipePattern.label] = generateSwipePattern;
  GeneratorMap[Type.EMPTY.label] = function() {};

  /**
   * Helper function to clone an element (deep clone)
   * @param {Type.~} type - The element type
   * @return {HTMLElement}
   */
  function cloneElement(type) {
    var ele = document.getElementById('template-' + type.label).cloneNode(true);
    ele.id = type.label + "-" + (++id_counter);
    return ele;
  }

  function generatePadRelative(config, ele, side_options, side_id) {
    generatePad(config, ele, side_options, side_id, true);
  };

  /**
   * Create DPad or Joystick
   * @param {Object} config
   * @param {Element.~} ele - The side element (left, middle or right)
   * @param {Options} side_options - All options of the side
   */
  function generatePad(config, ele, side_options, side_id, is_relative) {
    is_relative = is_relative || false;
    var dpad_ele = cloneElement(config.type);
    ele.appendChild(dpad_ele);

    var params = config.opts || {};
    var id = config.key || config.type.label.toLowerCase() + '-' + side_id;

    params.relative = params.is_relative || is_relative;

    if (config.type.class_name === Type.DPad.class_name) {
      if (!params.directionchange) {
        params.directionchange = function(key, pressed) {
          sendInputEvent(id, pressed, { direction: key });
        }
      }
    }

    if (config.type.class_name === Type.Joystick.class_name) {
      if (!params.touchmove) {
        params.touchmove = function(point) {
          sendInputEvent(id, true, point);
        }
      }

      if (!params.touchend) {
        params.touchend = function(event, was_swipe) {
          sendInputEvent(id, false, { "was_swipe": was_swipe });
        }
      }
    }

    var obj = new window[config.type.class_name](dpad_ele, params);
    params.key = id;
    generated_config[side_id] = {
      ele: dpad_ele,
      obj: obj,
      params: params
    };
  }

  /**
   * Create swipe pattern element
   * @param {Object} config
   * @param {Element.~} ele - The side element (left, middle or right)
   * @param {Options} side_options - All options of the side
   */
  function generateSwipePattern(config, parent_ele, side_options, side_id) {
    var swipe_ele = cloneElement(config.type);
    parent_ele.appendChild(swipe_ele);

    var params = config.opts || {};
    var id = config.key || config.type.label.toLowerCase() + '-' + side_id;

    if (!params.onTouchCircle) {
      // Only on touchend
      params.onTouchCircle = function(circle) {
        //sendInputEvent(id, true, circle);
      }
    }

    if (!params.touchend) {
      params.touchend = function(touched_circles) {
        sendInputEvent(id, false, touched_circles);
      }
    }

    if (!params.circles) {
      params.circles = [
        {x: 50, y: 60},
        {x: 150, y: 60},
        {x: 250, y: 60},
        {x: 50, y: 150},
        { x: 150, y: 150},
        {x: 250, y: 150},
        {x: 50, y: 240},
        {x: 150, y: 240},
        {x: 250, y: 240}
      ];
    }

    var obj = new window[config.type.class_name](swipe_ele, params);
    params.key = id;
    generated_config[side_id] = {
      ele: swipe_ele,
      obj: obj,
      params: params
    };

    // Center
    // var parent_rect = parent_ele.getBoundingClientRect();
    // var ele_rect = swipe_ele.getBoundingClientRect();
    // if (parent_rect.height > ele_rect.height) {
    //   var offset_y = (parent_rect.height - ele_rect.height) / 2;
    //   swipe_ele.style.marginTop = offset_y + "px";
    // }
  }

  /**
   * Create swipe area element
   * @param {Object} config
   * @param {Element.~} ele - The side element (left, middle or right)
   * @param {Options} side_options - All options of the side
   */
  function generateSwipeArea(config, ele, side_options, side_id) {
    var swipe_ele = cloneElement(config.type);
    ele.appendChild(swipe_ele);

    var params = config.opts || {};
    var id = config.key || config.type.label.toLowerCase() + '-' + side_id;

    if (!params.onTrigger) {
      params.onTrigger = function(param_obj) {
        sendInputEvent(id, true, param_obj);
      }
    }

    if (!params.touchend) {
      params.touchend = function() {
        sendInputEvent(id, false);
      }
    }

    var obj = new window[config.type.class_name](swipe_ele, params);
    params.key = id;
    generated_config[side_id] = {
      ele: swipe_ele,
      obj: obj,
      params: params
    };
  }

  /**
   * Create button elements
   * @param {Object} config
   * @param {Element.~} ele - The side element (left, middle or right)
   * @param {Options} side_options - All options of the side
   */
  function generateButtonVertical(config, ele, side_options, side_id) {
    var num_of_buttons = side_options.length;
    var height = Math.round(100 / num_of_buttons);
    var button_ele = cloneElement(config.type);
    button_ele.style.height = height + "%";
    if (num_of_buttons === 1) {
      button_ele.className = "button-300-300";
    }

    var button_text = button_ele.getElementsByClassName('button-text')[0];
    button_text.innerHTML = config.label;
    ele.appendChild(button_ele);

    // AirConsole send methods
    var params = config.opts || {};

    if (!params.down) {
      params.down = function() {
        sendInputEvent(config.key, true);
      }
    }
    if (!params.up) {
      params.up = function() {
        if (config.on_up_message) {
          sendInputEvent(config.key, false);
        }
      }
    }

    var obj = new window[config.type.class_name](button_ele, params);
    if (!generated_config[side_id] || generated_config[side_id] === Type.EMPTY) {
      generated_config[side_id] = [];
    }
    params.key = config.key;
    generated_config[side_id].push({
      ele: button_ele,
      obj: obj,
      params: params
    });
  }

  /**
   * Generates middle buttons
   * @param {Array} opts - List of button option objects
   * @param {Element.~} parent_ele - The middle dom node
   */
  function generateButtonsMiddle(opts, parent_ele) {
    var num_of_buttons = opts.length;
    var step = 100 / num_of_buttons;
    var type = Type.ButtonMiddle;

    for (var i = 0; i < num_of_buttons; i++) {
      var bttn = opts[i];
      var button_ele = cloneElement(type);
      var button_text = button_ele.getElementsByClassName('button-text')[0];
      button_text.innerHTML = bttn.label;
      parent_ele.appendChild(button_ele);
      button_ele.style.top = (step * i) + "%";
      button_ele.style.height = (step) + "%";

      var params = bttn.opts || {};
      (function(bttn) {
        if (!params.down) {
          params.down = function() {
            sendInputEvent(bttn.key, true);
          }
        }
        if (!params.up) {
          params.up = function() {
            if (bttn.on_up_message) {
              sendInputEvent(bttn.key, false);
            }
          }
        }
        var obj = new Button(button_ele, params);
      })(bttn);
    }
  };

  /**
   * Send AirConsole message
   * @param {String} key - An identifier for the input element
   * @param {Boolean} pressed - If pressed or released
   * @param {Options} params - Additional params
   */
  function sendInputEvent(key, pressed, params) {
    params = params || {};
    var message = {};
    message[key] = {
      pressed: pressed,
      message: params
    };

    if (!airconsole_obj) {
      console.warn("You have to call CtrlGenerator.setAirConsole and pass the airconsole instance!");
    } else {
      if (debug) {
        console.info("Send", message);
      }
      rate_limiter.message(airconsole_obj.SCREEN, message);
    }
  }

  return {
    Type: Type,
    Element: Element,
    sendInputEvent: sendInputEvent,
    getGeneratedObjects: function() {
      return generated_config;
    },

    /**
     * Set to true to have debug output in the console
     * @param {Boolean} state
     */
    debug: function(state) {
      debug = state;
      if (state) {
        console.info("CTRL DEBUG MODE ACTIVATED - press some buttons :)");
      }
      return this;
    },

    /**
     * Sets the airconsole object
     * @param {AirConsole} airconsole - The instanciated AirConsole object
     */
    setAirConsole: function(airconsole) {
      airconsole_obj = airconsole;
      rate_limiter = new RateLimiter(airconsole);
      return this;
    },

    /**
     * Empties all parent elements
     */
    clear: function() {
      id_counter = 0;
      for (var ele in Element) {
        Element[ele].innerHTML = "";
      }
      generated_config = {};
    },

    /**
     * Generates the controller by passed config
     * @param {Object} config
     */
    generate: function (config) {
      this.clear();
      for (var side in config) {
        var opts = config[side];
        var ele = Element[side];

        if (!opts) continue;
        if (!(opts instanceof Array)) {
          opts = [opts];
        }

        if (side !== Side.middle) {
          for (var i = 0; i < opts.length; i++) {
            var opt = opts[i];
            if (!opt || opt === Type.EMPTY) continue;
            if (!opt.type || !GeneratorMap[opt.type.label]) {
              throw "You passed an unknow type in the config properties. Use one of CtrlGenerator.Type.*";
            }
            GeneratorMap[opt.type.label](opt, ele, opts, side);
          }
        } else {
          GeneratorMap[Type.ButtonMiddle.label](opts, ele);
        }
      }
    }
  };
})();

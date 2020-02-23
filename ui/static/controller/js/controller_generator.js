var ControllerGenerator = function(context) {
  this.views = [];
  this.template_cache = {};
  this.container = jQuery('#controller-container');
  this.context = context;
  this.last_build_data = null;
  this.data_structure = ControllerGenerator.DataStructure.Js;
  this.vm = new AirConsoleViewManager();
};

ControllerGenerator.Context = {
  AirConsole: 'airconsole',
  Editor: 'editor'
};

ControllerGenerator.DataStructure = {
  Default: 'default',
  String: 'string',
  KeyValue: 'key_value'
};

ControllerGenerator.prototype.setDataStructure = function (data_structure) {
  this.data_structure = data_structure;
};

ControllerGenerator.prototype.resetContainer = function () {
  this.container.removeClass('portrait').removeClass('landscape');
  this.container.empty();
};

ControllerGenerator.prototype.toggleContainerClass = function (class_name) {
  this.container.toggleClass(class_name);
};

/**
 * Overwrite. Handles input events
 */
ControllerGenerator.prototype.onInputEvent = function (id, data) {
  throw "You have to overwrite the onInputEvent() method";
};

ControllerGenerator.prototype.setCurrentView = function (view_id) {
  this.vm.show(view_id);
};

ControllerGenerator.prototype.setupViews = function(selected_view_id) {
  this.vm.views = {};
  this.vm.setupViews();
  this.vm.current_view_id = null;
  if (selected_view_id) {
    this.setCurrentView(selected_view_id);
  }
};

ControllerGenerator.prototype.applyData = function(data) {
  if (!data) throw "No data to apply. Did you also copy the script tag data?!";

  this.container.addClass(data.orientation || 'portrait');

  var views = data.views;
  for (var i = 0; i < views.length; i++) {
    var view = views[i];
    var sections = view.sections;
    for (var s = 0; s < sections.length; s++) {
      var section = sections[s];
      var elements = section.elements;
      for (var e = 0; e < elements.length; e++) {
        var element = elements[e];
        this.applyInputElement(element);
      }
    }
  }

  this.setupViews();
};

ControllerGenerator.prototype.applyInputElement = function (element) {
  var self = this;

  var opts = element.options.constructor_fn || {};
  if (element.key === "button") {
    self.createButtonElement(element, opts);
  }
  //
  if (element.key === "dpad_absolute" || element.key === "dpad_relative") {
    self.createDPadElement(element, opts);
  }
  //
  if (element.key == "swipe_analog" || element.key == "swipe_digital") {
    self.createSwipeElement(element, opts);
  }
};

// =======================================================================================


ControllerGenerator.prototype.build = function(data) {
  var self = this;
  var views = data.views;
  var container = this.container;
  var selected_view_id = data.selected_view_id;
  var sections_len = 0;
  this.resetContainer();
  container.addClass(data.orientation);
  var has_elements = false;

  for (var i = 0; i < views.length; i++) {
    var view = views[i];
    self.getElementHtml('view', view, function(compiled_view) {
      container.append(compiled_view);
      var sections = view.sections;
      if (view.id === selected_view_id) {
        sections_len = sections.length;
      }
      for (var s = 0; s < sections.length; s++) {
        var section = sections[s];
        var elements = section.elements;
        if (view.id === selected_view_id) {
          has_elements = elements.length;
        }
        for (var e = 0; e < elements.length; e++) {
          var element = elements[e];
          self.buildInputElement.call(self, view, section, element);
        }
      }
    });
  }

  // For Portrait mode we need to set the height of each section
  var section_height = data.orientation === 'landscape' ? '100%' : (98 / sections_len) + "%";
  $('.section').height(section_height);
};

ControllerGenerator.prototype.buildInputElement = function (view, section, element) {
  var self = this;
  var section_ele = $("#" + section.id);

  this.getElementHtml(element.tmpl, element, function(compiled_html) {
    if (!compiled_html) throw "Could not load or complite template " + element.tmpl;
    var opts = element.options.constructor_args || {};
    section_ele.append(compiled_html);
    //
    if (element.key === "button") {
      self.createButtonElement(element, opts);
    }
    //
    if (element.key === "dpad_absolute" || element.key === "dpad_relative") {
      self.createDPadElement(element, opts);
    }
    //
    if (element.key == "swipe_analog" || element.key == "swipe_digital") {
      self.createSwipeElement(element, opts);
    }
  });
};

ControllerGenerator.prototype.createButtonElement = function (element, opts) {
  var self = this;
  opts.down = function(key, pressed) {
    var data = { pressed: true };
    for (var i = 0; i < element.options.message_data.length; i++) {
      var msg = element.options.message_data[i];
      if (msg.key) {
        data[msg.key] = msg.value;
      }
    }
    self.onInputEvent(element.id, data);
  };
  if (element.options.send_onrelease) {
    opts.up = function() {
      self.onInputEvent(element.id, { pressed: false });
    };
  }
  new Button(element.id, opts);
};

ControllerGenerator.prototype.createSwipeElement = function (element, opts) {
  var self = this;

  if (!opts.slider_vertical) {
    opts.onTrigger = function(direction) {
      self.onInputEvent(element.id, { direction: direction });
    };
  }
  opts.touchstart = function() {
    self.onInputEvent(element.id, { pressed: true });
  };
  opts.touchend = function(event, had_directions) {
    self.onInputEvent(element.id, { had_directions: had_directions, pressed: false });
  };

  if (opts.slider_vertical) {
    opts.touchmove = function(e) {
      if (this.is_touch_down) {
        var bbox = this.container.getBoundingClientRect();
        var half_height = (bbox.height / 2);
        var center_y = bbox.top + half_height;
        var pos = this.getRelativePos(e);
        var delta = center_y - pos.y;
        var norm_y = Math.round((delta * 100) / half_height);
        self.onInputEvent(element.id, { y: norm_y });
      }
    };
  }

  //
  if (element.key == "swipe_analog") {
    new SwipeAnalog(element.id, opts);
  }
  //
  if (element.key == "swipe_digital") {
    // opts.touchmove = function() {
    //   self.onInputEvent(element.id, {});
    // };
    new SwipeDigital(element.id, opts);
  }
};

ControllerGenerator.prototype.createDPadElement = function (element, opts) {
  opts["relative"] = element.key === "dpad_relative" ? true : false;
  var self = this;

  opts.directionchange = function(key, pressed) {
    self.onInputEvent(element.id, {key: key, pressed: pressed });
  };
  opts.touchstart = function() {
    self.onInputEvent(element.id, { pressed: true });
  };
  opts.touchend = function(had_direction) {
    self.onInputEvent(element.id, { had_direction: had_direction, pressed: false });
  };
  new DPad(element.id, opts);
};

ControllerGenerator.prototype.getElementHtml = function (file, element_data, cb) {
  this.loadTemplate(file, function(raw_html) {
    var template = Handlebars.compile(raw_html);
    var compiled_html = template(element_data || {});
    cb(compiled_html);
  });
};

ControllerGenerator.prototype.loadTemplate = function (file, cb) {
  if (!file) throw "File param missing to loadTemplate";
  var self = this;
  if (self.template_cache[file] && cb) {
    cb(self.template_cache[file]);
  } else {
    jQuery.get("controller/templates/_" + file + ".html", function(template) {
      self.template_cache[file] = template;
      if (cb) {
        cb(template);
      }
    }, 'html');
  }
};

ControllerGenerator.prototype.preloadTemplates = function (cb) {
  var templates = ['view', 'button', 'dpad', 'swipe_analog', 'swipe_digital'];
  var loaded = 0;
  for (var i = 0; i < templates.length; i++) {
    this.loadTemplate(templates[i], function() {
      loaded++;
      if (loaded === templates.length && cb) {
        cb();
      }
    });
  }
};

ControllerGenerator.prototype.onUpdate = function(data) {
  if (data.action === 'build') {
    this.build(data.json);
    this.setupViews(data.selected_view_id);
  }
  if (data.action === "select_view") {
    this.setCurrentView(data.json.selected_view_id);
  }
  if (data.action === 'set_data_structure') {
    this.setDataStructure(data.data_structure);
  }
  if (data.action === 'export') {
    var html = this.container.html();
    window.parent.postMessage({
      action: 'export',
      html: html
    }, "*");
  }
};

ControllerGenerator.prototype.onMessage = function(event) {
  var data = event.data;
  if (data && data.ctrl_generator) {
    this.last_build_data = data;
    this.onUpdate(data);
  }
};

ControllerGenerator.prototype.onAirConsoleMessage = function(device_id, data) {
  if (data.show_view_id) {
    this.setCurrentView(data.show_view_id);
  }
  if (data.container_class) {
    this.toggleContainerClass(data.container_class);
  }
};

ControllerGenerator.prototype.formatMessage = function(id, data) {
  var msg = {};
  var content = {
    element: id,
    data: data || {}
  };

  if (this.data_structure === ControllerGenerator.DataStructure.String) {
    msg = {
      message: JSON.stringify(content)
    };
  } else if (this.data_structure === ControllerGenerator.DataStructure.KeyValue) {
    msg = {};
    msg[id] = data;
  } else {
    msg = content;
  }

  return msg;
};



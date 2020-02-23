// ========================================================
// DEFAULT OUTPUT DEFINED HERE
// ========================================================
var outputAddScript = function(path) {
  return '<script type="text/javascript" src="' + path + '"></script>' + "\n";
};

var outputAddStyle = function(path) {
  return '<link rel="stylesheet" href="' + path + '">' + "\n";
};

var base_folder = 'airconsole-controls/';

var output = "";
output = "<html>\n<head>\n";
output += '<meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1.0, maximum-scale=1.0"/>';
output += outputAddStyle(base_folder + 'button/button.css');
output += outputAddStyle(base_folder + 'dpad/dpad.css');
output += outputAddStyle(base_folder + 'joystick/joystick.css');
output += outputAddStyle(base_folder + 'ctrl-generator/controller.css');
output += "</head>\n<body>\n";
output += $('#gamepad_code').html();
output += "\n";
output += $('#templates').html();
output += "\n";
output += outputAddScript('https://www.airconsole.com/api/airconsole-1.3.0.js');
output += outputAddScript(base_folder + 'rate-limiter/rate-limiter.js');
output += outputAddScript(base_folder + 'dpad/dpad.js');
output += outputAddScript(base_folder + 'joystick/joystick.js');
output += outputAddScript(base_folder + 'button/button.js');
output += outputAddScript(base_folder + 'swipe-digital/swipe-digital.js');
output += outputAddScript(base_folder + 'swipe-analog/swipe-analog.js');
output += outputAddScript(base_folder + 'swipe-pattern/swipe-pattern.js');
output += outputAddScript(base_folder + 'ctrl-generator/ctrl-generator.js');
output += '<script type="text/javascript">'+ "\n";
output += '{{CONFIG_CODE}}';
output += "\n" + '</script>';
output += "</body></html>";

// ========================================================
// UI GENERATOR
// ========================================================
var UICtrlGenerator = (function(ctrl_generator) {

  var ctrl_generator = ctrl_generator;
  var ui_selects_ele = $('.ui_select');
  var code_output = $('#output');
  var middle_bttn_label = $('#middle_bttn_label');
  var middle_bttn_add = $('#middle_bttn_add');
  var middle_bttn_remove = $('#middle_bttn_remove');

  // A default config
  var ctrl_config = {
    left: {
      type: CtrlGenerator.Type.DPad,
    },
    middle: [
      {
        label: 'START',
        key: 'start'
      },
      {
        label: 'RESET',
        key: 'reset'
      },
      {
        label: 'PIZZA',
        key: 'pizza'
      }
    ],
    right: [
      {
        type: CtrlGenerator.Type.ButtonVertical,
        label: "Defend",
        key: "a"
      },
      {
        type: CtrlGenerator.Type.ButtonVertical,
        label: "Shoot",
        key: "b",
        on_up_message: true
      }
    ]
  };

  var clear = function() {
    ctrl_config = {
      left: null,
      middle: [],
      right: null
    };
    ui_selects_ele.each(function() {
      var $ele = $(this);
      $ele.find('option').first().attr('selected', 'selected');
    });
    generate();
  };

  var printCode = function() {
    var code = 'var airconsole = new AirConsole({orientation: AirConsole.ORIENTATION_LANDSCAPE});' + "\n";
    code += 'CtrlGenerator.setAirConsole(airconsole);' + "\n";
    code += "CtrlGenerator.generate(" + JSON.stringify(ctrl_config) + ");";
    var output_code = output.replace(/{{CONFIG_CODE}}/, code);
    code_output.val(output_code);
  };

  var generate = function () {
    ctrl_generator.generate(ctrl_config);
    printCode();
  };

  var resetButtonForm = function(side_id) {
    var form_ele = $('.' + side_id + '_form');
    var label = form_ele.find('.button_form_label').val('');
    var key = form_ele.find('.button_form_key').val('');
  };

  var addButtonToCtrl = function(label, key, has_up_event, side_id, selected_type, side_ele) {
    if (!key) {
      key = prompt("The button needs a key to identify the message. E.g. 'shoot' or 'start'");
    }
    var bttn_data = {
      type: ctrl_generator.Type[selected_type],
      label: label,
      key: key,
      on_up_message: has_up_event
    };

    if (!ctrl_config[side_id] || ctrl_config[side_id] === ctrl_generator.Type.EMPTY) {
      ctrl_config[side_id] = [];
    }

    ctrl_config[side_id].push(bttn_data);
    generate();
    resetButtonForm(side_id);
    showInfo(side_ele, selected_type, side_id);
  };

  var addButtonForm = function(form_container_ele, side_id, selected_type, side_ele) {
    var form_ele = $('#template_button_form').clone();
    form_ele.attr("id", "");
    form_ele.addClass(side_id + '_form');
    form_container_ele.append(form_ele);
    form_ele.show();

    form_container_ele.find('.add_bttn').on('click', function() {
      var label = form_ele.find('.button_form_label').val();
      var key = form_ele.find('.button_form_key').val();
      var has_up_event = form_ele.find('.button_form_on_button_up').eq(0).is(":checked");
      addButtonToCtrl(label, key, has_up_event, side_id, selected_type, side_ele);
    });
  };

  var showInfo = function(side_ele, selected_type, side_id) {
    var info_ele = $('#info-' + selected_type).clone();
    var info_container = side_ele.find('.info_container');

    var current_config = ctrl_generator.getGeneratedObjects()[side_id];

    if (current_config instanceof Array) {

    } else {
      if (current_config && current_config.params) {
        info_ele.find('.key').html(current_config.params.key);
      }
    }

    info_container.html('').append(info_ele);
    info_ele.show();
  };

  var onSelectChange = function() {
    var $ele = $(this);
    var side_id = $ele.attr('data-id');
    var selected_type = $ele.find(":selected").val();

    // Clear form ele container
    var side_ele = $ele.parent();
    var form_ele = $ele.parent().find('.form_container').eq(0);
    form_ele.html('');

    // DPad or Joystick
    if (selected_type === ctrl_generator.Type.DPad.label ||
        selected_type === ctrl_generator.Type.DPadRelative.label ||
        selected_type === ctrl_generator.Type.Joystick.label ||
        selected_type === ctrl_generator.Type.SwipeDigital.label ||
        selected_type === ctrl_generator.Type.SwipeAnalog.label ||
        selected_type === ctrl_generator.Type.SwipePattern.label) {
      ctrl_config[side_id] = {
        type: ctrl_generator.Type[selected_type]
      };

      // ButtonVertical
    } else if (selected_type === 'ButtonVertical') {
      ctrl_config[side_id] = ctrl_generator.Type.EMPTY;
      addButtonForm(form_ele, side_id, selected_type, side_ele);

    // EMPTY
    } else {
      ctrl_config[side_id] = ctrl_generator.Type.EMPTY;
    }
    generate();
    showInfo(side_ele, selected_type, side_id);
  };

  var onMiddleButtonAdd = function () {
    var label = middle_bttn_label.val();
    ctrl_config['middle'].push({
      label: label,
      key: label
    });
    generate();
    middle_bttn_label.val('');
  };

  var prepareSelectTypes = function() {
    ui_selects_ele.each(function() {
      var $ele = $(this);
      for (var type in ctrl_generator.Type) {
        var type_obj = ctrl_generator.Type[type];
        if (type_obj.label === ctrl_generator.Type.ButtonMiddle.label) continue;
        var opt = $('<option value=' + type_obj.label + '>' + type_obj.label + '</option>');
        var side_id = $ele.attr('data-id');
        if (type_obj.label === ctrl_config[side_id].type ||
            (ctrl_config[side_id] instanceof Array && type_obj.label === 'ButtonVertical')) {
          opt.attr('selected', 'selected');
          //showInfo($ele.parent(), type, side_id);
        }
        $ele.append(opt);
      }
    });

    ui_selects_ele.on('change', onSelectChange);
  };

  middle_bttn_add.on('click', onMiddleButtonAdd);
  middle_bttn_remove.on('click', function() {
    ctrl_config['middle'] = [];
    generate();
  });

  $(".get_started_container").on('click', function() {
    $(this).addClass('hide');
    $('.generator_container').removeClass('hide');
    clear();
  });

  (function() {
    prepareSelectTypes();
  })();

  return {
    ctrl_config: ctrl_config,
    generate: generate
  };

})(CtrlGenerator);

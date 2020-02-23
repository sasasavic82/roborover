jQuery(document).ready(function() {
  var context = location.hash === "#editor" ? ControllerGenerator.Context.Editor : ControllerGenerator.Context.AirConsole;
  var is_airconsole_ctx = context === ControllerGenerator.Context.AirConsole;
  var generator = new ControllerGenerator(context);
  var parsed_data = {};
  var airconsole = null;

  // ==========================================
  // AIRCONSOLE
  // ==========================================
  if (is_airconsole_ctx) {

    // Construct2, send handshake message to the contruct2 game
    function sendHandshake() {
      airconsole.message(AirConsole.SCREEN, {
        handshake: true
      });
    };

    if (!ctrl_data) {
      throw "Controller data is missing. Did you copy all the export data?";
    }

    parsed_data = JSON.parse(ctrl_data);

    airconsole = new AirConsole({
      orientation: parsed_data.orientation || AirConsole.ORIENTATION_PORTRAIT
    });

    airconsole.onReady = function() {
      generator.applyData(parsed_data);
      if (parsed_data.selected_view_id) {
        generator.setCurrentView(parsed_data.selected_view_id);
      }
      // Construct2
      sendHandshake();
    };

    airconsole.onMessage = function(device_id, data) {
      generator.onAirConsoleMessage(device_id, data);
      // Construct2
      if (data.handshake) {
        sendHandshake();
      }
    };

  // ==========================================
  // EDITOR
  // ==========================================
  } else {
    window.addEventListener('message', generator.onMessage.bind(generator));
    generator.preloadTemplates(function() {
      if (generator.last_build_data) {
        generator.onUpdate(generator.last_build_data);
      }
    });
  }

  /**
   * Gets called whenever an input element was pressed
   * @param {String} id
   * @param {Object} data
   */
  generator.onInputEvent = function(id, data) {
    var msg = this.formatMessage(id, data);
    if (is_airconsole_ctx) {
      airconsole.message(AirConsole.SCREEN, msg);
    } else {
      window.parent.postMessage({
        action: 'log',
        element_id: id,
        msg: msg
      }, "*");
    }
  }
});

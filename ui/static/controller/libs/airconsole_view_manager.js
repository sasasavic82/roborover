/**
 * A view manager
 * @constructor
 */
var AirConsoleViewManager = function() {
  this.views = {};
  this.current_view_id = null;
  this.class_start = 'default-view';
};

AirConsoleViewManager.prototype = {

  /**
   * Called to setup the <div class="view"></div>
   * @private
   */
  setupViews: function() {
    var start_view_id = null;
    var views = document.querySelectorAll('.view');
    for (var i = 0; i < views.length; i++) {
      var view = views[i];
      var id = view.id;
      this.views[id] = view;
      var is_start = view.className.indexOf(this.class_start) > -1;
      if (is_start) {
        start_view_id = id;
      }
    }
    this.hideAll();
    if (start_view_id) {
      this.show(start_view_id);
    }
  },

  /**
   * Shows a view and hides all others
   * @param {String} view - The view id
   */
  show: function(id) {
    var state = false;
    if (this.current_view_id !== id) {
      var view = this.views[id];
      if (view) {
        this.current_view_id = id;
        this.hideAll();
        view.style.display = "flex";
        state = true;
      } else {
        console.warn("Could not find view with ID:", id);
      }
    }
    return state;
  },

  /**
   * Hides all views
   */
  hideAll: function() {
    for (var key in this.views) {
      this.views[key].style.display = "none";
    }
  }

};

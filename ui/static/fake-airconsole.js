/**
 * This is a fake AirConsole for debugging
 * @constructor
 */
function AirConsole() {
  this.data = undefined;
  this.log_div = document.createElement("div");
  this.log_div.style.height = "50%";
  this.log_div.style.minHeight = "300px";
  this.log_div.style.border = "1px solid #777777";
  this.log_div.style.backgroundColor = "#eee";
  this.log_div.style.overflow = "scroll";
  this.log_div.style.padding = "5px";
  this.log_div.style.fontFamily = "sans-serif";
  this.log_div.innerHTML = "<b>AirConsole Log</b>";
  document.body.appendChild(this.log_div);
}

AirConsole.SCREEN = 0;

AirConsole.prototype.message = function(device_id, data) {
  this.log("Message to Device " + device_id, data);
};

AirConsole.prototype.setCustomDeviceState = function(data) {
  this.data = data;
  this.log("Setting Custom Device State", data);
}

AirConsole.prototype.getCustomDeviceState = function() {
  return this.data;
}

AirConsole.prototype.log = function(call, data) {
  this.log_div.innerHTML += "<div style='margin-top:3px; padding-top: 3px; border-top: 1px solid #aaa'>" +
      call + "</div><pre style='margin: 0px'>" +
      JSON.stringify(data, null, 2) + "</pre>";
  this.log_div.scrollTop = this.log_div.scrollHeight;
}

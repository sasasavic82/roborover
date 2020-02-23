# AirConsole Shake-Detector

Observes device motions and triggers when a shake-like behaviour of the device was recognized.

The AirConsole API (from 1.3) provides a ``onDeviceMotion()`` method, which passes device
motion data. With the AirConsoleShakeDetector you can detect a shake event.

## HTML

```html
  <script type="text/javascript" src="airconsole-controls/shake-detector/airconsole-shake-detector.js"></script>
```

## Javascript - Controller

```javascript
  var airconsole = new AirConsole();

  var shake_detector = new AirConsoleShakeDetector({
    // Threshold of moving the device
    threshold: 5,
    // Time in ms of how often the shake event triggers (ever 100 ms)
    timeout: 100,
    // Function to call when a shake was recognized
    callback: function() {
      console.log("Shake it ...");
    }
  });

  // The shake state data is provided by the AirConsole API function:
  airconsole.onDeviceMotion = function(o) {
    shake_detector.onDeviceMotion(o);
  };
```

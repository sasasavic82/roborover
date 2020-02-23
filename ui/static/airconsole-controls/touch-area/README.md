# TouchArea
A generic touch area.

## Example

[Live Demo](https://rawgit.com/AirConsole/airconsole-controls/master/examples/touch-area.html) -
[Source](https://github.com/AirConsole/airconsole-controls/blob/master/examples/touch-area.html)

## Javascript
```javascript
  // The first argument can be an html element or and element id. The second argument are options.
  var my_toucharea = new TouchArea("my-touch-area-element-id", {

    // position: {x: float, y: float} is the position of the joystick. Values are between -1 and 1
                                      Example use: console.log(position.x,  position.y);
    "touchstart": function(position) {},
    
    "touchmove": function(position) {},

    "touchend": function(position) {},
  });
```
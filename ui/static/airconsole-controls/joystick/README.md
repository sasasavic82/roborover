# Joystick
An analogue relative joystick.

## Example

![alt text](https://github.com/airconsole/airconsole-controls/raw/master/examples/joystick.png "Button Example")

[Live Demo](https://rawgit.com/AirConsole/airconsole-controls/master/examples/joystick.html) -
[Source](https://github.com/AirConsole/airconsole-controls/blob/master/examples/joystick.html)

## General

You need to place & size the joystick explicitly. It needs to have position **relative/absolute/fixed**.

For example:
```html
<style type=text/css>
  #your-button {
    position: absolute;
    left: 0px;
    top: 0px;
    width: 50%;
    height: 50%;
  }
</style>
```

## Javascript
```javascript
  // The first argument can be an html element or and element id. The second argument are options.
  var my_joystick = new Joystick("my-joystick", {
    // Gets called when the joystick is touched
    "touchstart": function() {},
    
    // Gets called when the joystick is moved.
    // position: {x: float, y: float} is the position of the joystick. Values are between -1 and 1
                                      Example use: console.log(position.x,  position.y);
    "touchmove": function(position) {},
    
    // Gets called when the joystick is not touched anymore.
    "touchend": function() {},
    
    // (Optional) distance: The maximum distance in pixels the joystick can be moved.
    "distance": 10,
    
    // (Optional) min_delta: The minimum delta a joystick needs to have moved before
    //                       the callback gets called.
    "min_delta": 0.25
  });
```

## Styles

The main button element gets the css class ```button-active``` when it is pressed.

### Optional default styles

There are no default styles at this point.

**It is highly recommended that you make the main button element as big as possible, even if it has the wrong aspect ratio. The image wont be skewed because the images are displayed as css ```background-image``` with ```background-size: contain```.**

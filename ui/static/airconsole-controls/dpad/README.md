# DPad
A 4-way or 8-way absolute or relative-swipe DPad usually used for movement, but also great if you want to have 4 buttons on a controller.

## Example

![alt text](https://github.com/airconsole/airconsole-controls/raw/master/examples/dpad.png "DPad Example")

[Live Demo](https://rawgit.com/AirConsole/airconsole-controls/master/examples/dpad.html) -
[Source](https://github.com/AirConsole/airconsole-controls/blob/master/examples/dpad.html)

## General

You need to place & size the dpads explicitly. It needs to have position **relative/absolute/fixed**.

For example:
```html
<style type=text/css>
  #your-dpad {
    position: absolute;
    left: 0px;
    top: 0px;
    width: 40%;
    height: 100%;
  }
</style>
```

## Javascript
```javascript
  // The first argument can be an html element or and element id. The second argument are options.
  new DPad("my-dpad", {
      // Set to true if you want to have a relative swipe dpad
      "relative": false,
      // Gets called when the dpad direction changes.
      // Key is one of: DPad.UP, DPad.DOWN, DPad.LEFT, DPad.RIGHT.
      // Pressed is a boolean, true if the direction is active.
      "directionchange": function(key, pressed) {},

      // Gets called when the DPad is touched.
      "touchstart": function() {},

      // Gets called when the DPad is released.
      // had_direction is a boolean that tells you if at lease one direction was active.
      //               can be used to determine if it was just a "tap" on the DPad.
      "touchend": function(had_direction) {},

      // (Optional) distance which the user needs to move before triggering a direction.
      "distance": {x: 10, y:10},

      // (Optional) diagonal: If true, diagonal movement are possible and it becomes a 8-way DPad:
      //                      For exmaple UP and RIGHT at the same time.
      "diagonal": false
    });
```

## Styles

The main dpad element gets the css class ```dpag-active``` when it is touched.
The sub-divs with class ```dpad-arrow-up```, ```dpad-arrow-down```, ```dpad-arrow-left```,```dpad-arrow-right```
get the class ```dpad-arrow-active``` when the direction is active.

### Optional default styles

If you include ```dpad.css``` you will get a default DPad styled like in the example above if used like this:

```html
<div id="my-dpad">
  <div>
    <div class="dpad-arrow dpad-arrow-up"></div>
    <div class="dpad-arrow dpad-arrow-down"></div>
    <div class="dpad-arrow dpad-arrow-left"></div>
    <div class="dpad-arrow dpad-arrow-right"></div>
  </div>
</div>
```

or for a swipe-dpad:

```html
<div id="my-dpad">
  <div>
    <div class="dpad-instructions">SWIPE</div>
    <div class="dpad-arrow dpad-arrow-up"></div>
    <div class="dpad-arrow dpad-arrow-down"></div>
    <div class="dpad-arrow dpad-arrow-left"></div>
    <div class="dpad-arrow dpad-arrow-right"></div>
  </div>
</div>
```

**It is highly recommended that you make the main dpad element as big as possible, even if it has the wrong aspect ratio. The image wont be skewed because the images are displayed as css ```background-image``` with ```background-size: contain```.**

### Switch between DPad relative and absolute

Call the ``toggleMode()`` method if you want to turn your absolute Dpad into a relative Dpad (or the other way).

```javascript
  // Switch from Tap to Swipe:
  absolute_dpad.toggleMode(DPad.SWIPE); // Or DPad.TAP
```

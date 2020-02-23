# Button
A simple button that works well for touch devices and local debugging.

## Example

![alt text](https://github.com/airconsole/airconsole-controls/raw/master/examples/button.png "Button Example")

[Live Demo](https://rawgit.com/AirConsole/airconsole-controls/master/examples/button.html) -
[Source](https://github.com/AirConsole/airconsole-controls/blob/master/examples/button.html)

## General

You need to place & size the button explicitly. It needs to have position **relative/absolute/fixed**.

For example:
```html
<style type=text/css>
  #your-button {
    position: absolute;
    left: 0px;
    top: 0px;
    width: 40%;
    height: 50%;
  }
</style>
```

## Javascript
```javascript
  // The first argument can be an html element or and element id. The second argument are options.
  new Button("your-button", {
    "down": function() {
      // The callback function for when the button is pressed
    },
    "up": function() {
      // The callback function for when the button is released
    }
  });
```

## Styles

The main button element gets the css class ```button-active``` when it is pressed.

### Optional default styles

If you include ```button.css``` you will get the following default styles:

A 80 pixel round button that can be used like this:
```html
<div class=button-80><div class=button-text>X</div></div>
```

A 300x150 pixel rectangular button that can be used like this:
```html
<div class=button-300-150><div class=button-text>X</div></div>
```

A 300x300 pixel rectangular button that can be used like this:
```html
<div class=button-300-300><div class=button-text>X</div></div>
```

**It is highly recommended that you make the main button element as big as possible, even if it has the wrong aspect ratio. The image wont be skewed because the images are displayed as css ```background-image``` with ```background-size: contain```.**

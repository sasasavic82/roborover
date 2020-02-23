# AirConsole Controls
Here you'll find components to build controllers for [AirConsole](http://www.airconsole.com/).


## Button
A simple button that works well for touch devices and local debugging.

## DPad
A 4-way or 8-way relative swipe DPad usually used for movement, *but also great if you want to have 4 buttons on a controller*.

## Joystick
An analogue relative joystick.

## Rate Limiter
The Rate Limiter helps you to send less than 10 messages per second.

## SwipeAnalog
A relative-swipe pad which returns a direction vector {x, y}.

## SwipeDigital
A 4-way or 8-way relative swipe pad which returns a map of
active swipe directions. E.g. ``{ left: true, right: false, up: false, down: false }``.

## SwipePattern
A pattern of circles, which you can connect by swiping (like Android unlock swipe pattern).

## ShakeDetector
Evaluates ``AirConsole.onDeviceMotion`` for shake-like-events of a device.

## TouchArea
A generic touch area.

## Examples
See examples for how to use these components.

![alt text](https://github.com/airconsole/airconsole-controls/raw/master/examples/example-controller.png "Example Controller")

[Live Demo](https://rawgit.com/AirConsole/airconsole-controls/master/examples/example-controller.html) -
[Documentation](https://github.com/AirConsole/airconsole-controls/blob/master/examples/README.md)

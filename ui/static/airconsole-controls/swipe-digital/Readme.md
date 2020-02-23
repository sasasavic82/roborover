# SwipeDigital

A 4-way or 8-way relative-swipe pad which does not trigger on touchend, but when a certain
amount of pixel has been swiped. Other than SwipeAnalog, SwipeDigital returns a map of
active swipe directions ('left', 'top', ...).

## Example

[Live Demo](https://rawgit.com/AirConsole/airconsole-controls/master/examples/swipe-area.html)

## Javascript

```javascript
  // The first argument can be an html element or and element id. The second argument are options.
  new SwipeDigital("my-swipe-area", {
      // Gets called when the amount of pixels swiped has been exceeded
      // Param is active directions {down: <Boolean>, left: <Boolean>, up: <Boolean>, right: <Boolean>}
      "onTrigger": function(direction_map) {},
      // Gets called when the SwipeDigital is touched.
      "touchstart": function(event) {},
      // Gets called when the SwipeDigital is released. If had_directions is false, it was just a tap.
      "touchend": function(event, had_directions) {},
      // (Optional) Minimum distance (px) to swipe until triggering the onTrigger function
      "min_swipe_distance": 30,
      // (Optional) allowed_directions: FOURWAY, EIGHTWAY, HORIZONTAL or VERTICAL
      "allowed_directions": SwipeDigital.ALLOWED_DIRECTIONS.ALL
    });
```

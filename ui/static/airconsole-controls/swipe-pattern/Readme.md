# SwipePattern

A pattern of circles, which you can connect by swiping.

## Example

[Live Demo](https://rawgit.com/AirConsole/airconsole-controls/master/examples/swipe-pattern.html)

## Javascript

```javascript
  // The first argument can be an html element or and element id. The second argument are options.
  new SwipePattern("my-swipe-container", {
      // Coordinates and options of the circle list
      circles: [
        [
          { x: 50, y: 60 },
          {
            id: 'myCustomId',
            radius: 30,
            x: 150, // Mandatory
            y: 150, // Mandatory
            // Custom style for this circle
            style: {
              fill_color: '#f1c40f'
            }
          },
        ]
      ],
      // Gets called when the swipe area is released. Passes all touched circles
      "touchend": function(touched_circles) {},
      // Called when a circle has been touched
      "onTouchCircle": function(circle) {}
    });
```

# RateLimiter
The Rate Limiter helps you to send less than 10 messages per second.

## Example

[Live Demo](https://rawgit.com/AirConsole/airconsole-controls/master/examples/rate-limiter.html) -
[Source](https://github.com/AirConsole/airconsole-controls/blob/master/rate-limiter/rate-limiter.js) -
[Joystick example](https://rawgit.com/AirConsole/airconsole-controls/master/examples/joystick.html)

## General

The RateLimiter can be used for messages and Custom Device States.

It sends data immediately in the beginning and then starts
rate limiting if the rate is too high: It merges the data together and
sends it in intervals so the rate limit is not exceeded.


## Merging data
This is how the merging works when requests start being rate limited:
If you send `{ "a": 1, "b": 2 }` and then `{"a": 3, "c": 4}`, the actual rate
limited message is merged to `{ "a": 3, "b": 2, "c": 4 }`.

Note that all fields are present, but "a" was overwritten by a later
call while "b" was untouched by the later call and "c" was added
by the later call.


## Custom Device States that are up-to-date
Also note that because data might be delayed through rate limiting,
custom device states might not be immediately updated in the airconsole
object. Just use RateLimiter.getCustomDeviceState(device_id) instead which
merges the pending data of device states and returns up-to-date data.

## Javascript
```javascript
  var airconsole = new AirConsole();
  var rateLimiter = new RateLimiter(airconsole);
  rateLimiter.message(AirConsole.SCREEN, {"msg": "Hi Screen!"});
  rateLimiter.setCustomDeviceState({"key", "value"});
  rateLimiter.setCustomDeviceStateProperty("key", "value");
  rateLimiter.getCustomDeviceState(); // always returns up-to-date state
```

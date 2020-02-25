# RoboRover

![Alt text](./docs/mars-rover.png)

----

RoboRover is a two-wheeled robot equipped with a pan/tilt camera and sensors, controlled via REST APIs through AWS IoT 
infrastructure and integrated into AWS Rekognition (object detection & classification) service.

RoboRover was originally meant to be part of an introductory course to Robotics, Machine Learning, Cloud and APIs but due
to unforseen circumstances, that is no longer the case.

Instead, I've decided to open source the entire codebase. This will serve as a great introduction to robotics, cloud, machine learning,
HTTP REST APIs, IoT and a bunch of other interesting general software engineering concepts and algorithms.

----

## Project Structure

RoboRover comes in two parts:

1. The base hardware; and
2. Software components

### Hardware

RoboRover is built upon an existing robotics platform from [Dexter] Industries, and can be purchased here in it's entirety: [GoPiGo3]. 
The base kit costs around `$100` and includes the most essential components (without the Raspberry Pi):

- Primary controller board
- Chassis (frame, wheels, hardware)
- Motors
- Encoders
- Power battery pack & cables

You can purchase the complete kit for `$200` that comes with additional hardware:

- Raspberry Pi 3
- Camera / Distance Sensor Mounts
- Distance Sensor
- microSD Card
- Power Supply wall adapter
- Ethernet cable

**You can buy the individual parts from the manifacturer, particularly if you have your own Raspberry Pi 3 (or 4).**

### Additional Hardware

The original kit comes only with a distance sensor, so you will have to purchase some additional hardware if you want to give your RoboRover some eyes :)

#### Pan / Tilt 2-Axis Servo Package and Pi Camera

- Raspberry Pi [Camera]

![Alt text](./docs/pi-cam.png)

- [Servo] Motor Package

![Alt text](./docs/spt50.png)

The single servo motor setup will only give your camera single axis `pan` capabilities, so if you'd like to have `tilt` capabilites too, you will
need to purchase an additional Servo Motor Package. I recommend getting a `pan\tilt` combo kit mount. Here is an example kit: [PanTiltKit]

#### Environment Sensor

If you'd like to purchase additional sensors, you may do so from Dexter Industries website. I've purchased the Temperature Humidity Pressure sensor,
and data captured will be offloaded as part of the `telemetry payload`. They have other sensors, however, you will need to extend my original code-base
and expose those measurements if you wish to do so.

![Alt text](./docs/TempHumPress.png)

### Software


### Requirements

* NodeJS v10


## Support

For support, please please raise a support ticket or reach out on [LinkedIn] :)

[PanTiltKit]: https://www.servocity.com/spt50
[Servo]: https://shop.dexterindustries.com/shop/sensors-accessories/sensors-actuators/servo-package
[Camera]: https://shop.dexterindustries.com/shop/sensors-accessories/sensors-actuators/raspberry-pi-camera
[Dexter]: https://www.dexterindustries.com/
[GoPiGo3]: https://www.dexterindustries.com/gopigo3/
[Serverless]: https://serverless.com/
[LinkedIn]: https://www.linkedin.com/in/sasasavic/

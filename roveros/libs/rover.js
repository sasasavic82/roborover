const { EasyGopigo3 } = require('node-gopigo3');
const _ = require('lodash');
const PiCamera = require('pi-camera');
const { encodeFile } = require('./common');
const Queue = require('./queue');

let request = require('request');

const COMMANDS = ['forward', 'backward', 'stop', 'left', 'right', 'tilt', 'pan', 'drive_cm', 'drive_degrees', 'left_eye', 'right_eye', 'set_speed', 'image', 'bulk'];



class RoverCommand {

    constructor(gpg) {
        this.gpg = gpg;
    }

    getControllerInstance() {
        return this.gpg;
    }

    kill() {
        this.gpg.stop();
        this.gpg.resetAll();
    }

}

class Rover {

    constructor(config) {
        this.config = config;
        this.gpg = new EasyGopigo3();
        this.distanceSensor = undefined;
        this.servoHorizontal = undefined;
        this.servoVertical = undefined;

        this.commandQueue = new Queue();
        this.queueInterval = undefined;

        this.stopVehicle = this._stopVehicle.bind(this);

        try {
            this.distanceSensor = this.gpg.initDistanceSensor();
        } catch (e) {
            console.log('error', '[ROVER_INIT]', JSON.stringify(e));
        }

        try {
            this.servoHorizontal = this.gpg.initServo();
            this.servoVertical = this.gpg.initServo('SERVO2');
        } catch (e) {
            console.log('error', '[ROVER_INIT]', JSON.stringify(e));
        }

        this.camera = new PiCamera({
            mode: 'photo',
            width: 640,
            height: 480,
            nopreview: true,
            output: `${__dirname}/../images/captured.jpg`
        });

        this._listenInternal();
    }

    getRoverInstance() {
        return this.gpg;
    }

    kill() {
        this.gpg.stop();
        this.gpg.resetAll();
        clearInterval(this.queueInterval);
    }

    getAllTelemetry() {

        let volt = this.gpg.volt();
        let speed = this.gpg.getSpeed();
        let distance = this.distanceSensor ? this.distanceSensor.read() : -1; //this.distanceSensor.read();

        return {
            voltage: volt,
            speed: speed,
            distance: distance
        }
    }

    execute({ type, attributes }) {

        if (!_.includes(COMMANDS, type)) return;

        if (type == 'bulk' && _.isArray(attributes))
            _.each(attributes, (item) => this.commandQueue.add(item));

        if(!_.isArray(attributes))
            this.commandQueue.add({type, attributes})

    }

    _executeInternal(command) {
        if (!_.includes(COMMANDS, command.type)) return;

        let delay;
        let distance;
        let speed;
        let rotation;

        switch (command.type) {
            case 'forward':
                delay = parseInt(command.attributes.delay);
                this.gpg.forward();
                if (delay > 0) setTimeout(this.stopVehicle, delay);
                console.log('debug', '[EXECUTE]', `Executed ${command.type} with a delay of ${delay}`);
                break;

            case 'backward':
                delay = parseInt(command.attributes.delay);
                this.gpg.backward();
                if (delay > 0) setTimeout(this.stopVehicle, delay);
                console.log('debug', '[EXECUTE]', `Executed ${command.type} with a delay of ${delay}`);
                break;

            case 'stop':
                this._stopVehicle();
                console.log('debug', '[EXECUTE]', `Executed ${command.type}`);
                break;

            case 'left':
                delay = parseInt(command.attributes.delay);
                this.gpg.left();
                if (delay > 0) setTimeout(this.stopVehicle, delay);
                console.log('debug', '[EXECUTE]', `Executed ${command.type} with a delay of ${delay}`);
                break;

            case 'right':
                delay = parseInt(command.attributes.delay);
                this.gpg.right();
                if (delay > 0) setTimeout(this.stopVehicle, delay);
                console.log('debug', '[EXECUTE]', `Executed ${command.type} with a delay of ${delay}`);
                break;

            case 'drive_cm':
                distance = parseInt(command.attributes.distance);
                this.gpg.driveCm(distance, () => this._stopVehicle());
                console.log('debug', '[EXECUTE]', `Executed ${command.type} with a distance of ${distance}`);
                break;
            case 'pan':
                rotation = parseInt(command.attributes.rotation);
                this.servoHorizontal.rotateServo(rotation);
                this.commandQueue.unblock();
                console.log('debug', '[EXECUTE]', `Executed ${command.type} with a rotation of ${rotation} degrees.`);
                break;
            case 'tilt':
                rotation = parseInt(command.attributes.rotation);
                this.servoVertical.rotateServo(rotation);
                console.log('debug', '[EXECUTE]', `Executed ${command.type} with a rotation of ${rotation} degrees.`);
                this.commandQueue.unblock();
                break;
            case 'drive_degrees':
                distance = parseInt(command.attributes.distance);
                this.gpg.driveDegrees(distance, () => this._stopVehicle());
                console.log('debug', '[EXECUTE]', `Executed ${command.type} with a distance of ${distance}`);
                break;

            case 'left_eye': break;
            case 'right_eye': break;
            case 'set_speed':
                speed = parseInt(command.attributes.speed);
                this.gpg.setSpeed(speed);
                console.log('debug', '[EXECUTE]', `Executed ${command.type} with speed of ${speed}`);
                this.commandQueue.unblock();
                break;

            case 'image':
                this.camera.snap()
                    .then((result) => {
                        console.log('debug', '[EXECUTE]', `Executed ${command.type}.`);
                        let encoded = encodeFile(`${__dirname}/../images/captured.jpg`);
                        return encoded;
                    }).then((encoded) => {
                        request.post(this.config.api.recognition, {
                            json: {
                                image: encoded
                            }
                        }, (err) => {
                            if (err) return console.log(err);
                            this.commandQueue.unblock();
                            console.log('debug', '[POST]', `Sent file to recogniser.`);
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                        this.commandQueue.unblock();
                    });
                break;

            case 'bulk': 
                _.each(command, (item) => this.commandQueue.add(item));
            break;
            default: break;
        }
    }

    _stopVehicle() {
        this.gpg.stop();
        console.log('debug', '[EXECUTE]', `Executing stop after elapsed time`);
        this.commandQueue.unblock();
    }

    _listenInternal() {
        this.queueInterval = setInterval(() => {

            if(!this.commandQueue.waitForMessage()) 
                return;

            this.commandQueue.block();
            let command = this.commandQueue.remove();
            this._executeInternal(command);      

        }, 100);
    }

}

module.exports = Rover;
let { Iot, IotData } = require('aws-sdk');
let _ = require('lodash');
let { v4 } = require('uuid');
let { capitalizeFirstLetter } = require('./helper');
// Priority
const Priority = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
};

const CommandType = {
    FORWARD: 'forward',
    BACKWARD: 'backward',
    STOP: 'stop',
    LEFT: 'left',
    RIGHT: 'right',
    DRIVE_CM: 'drive_cm',
    DRIVE_DEGREES: 'drive_degrees',
    LEFT_EYE: 'left_eye',
    RIGHT_EYE: 'right_eye',
    WAYPOINTS: 'waypoints',
    SET_SPEED: 'set_speed',
    IMAGE: 'image',
    BULK: 'bulk',
    PAN: 'pan',
    TILT: 'tilt'
};

const VERSION = '1.0';
const QOS = 0;


class Commander {
    constructor({ region = 'ap-southeast-2', topicPrefix = 'roborover/control' }) {

        this.region = region;
        this.topicPrefix = topicPrefix;
        this.endpoint = undefined;
        this.iotData = undefined;

        const iot = new Iot({ region: region });

        iot.describeEndpoint({}, (err, data) => {
            if(err) 
                throw new Error(err);

            this.endpoint = data.endpointAddress;
            this.iotData = new IotData({ endpoint: data.endpointAddress });
        });
    }

    _buildCommandTopic(command) {
        return [this.topicPrefix, command].join('/');
    }

    _buildBase({ priority, topic, type, data }) {

        let outerPayload = {}
        outerPayload['topic'] = topic;
        outerPayload['qos'] = QOS;

        let innerPayload = {}
        innerPayload['commandId'] = v4();
        innerPayload['version'] = VERSION;
        innerPayload['timestamp'] = Date.now();
        innerPayload['priority'] = priority;
        innerPayload['type'] = type;
        innerPayload['attributes'] = data;

        outerPayload['payload'] = JSON.stringify(innerPayload);

        console.log(outerPayload);

        return outerPayload;
    }

    _buildCommandData(commandData, commandType, priority = Priority.LOW) {

        const commandTopic = this._buildCommandTopic(commandType);
        const data = this._buildBase({ priority: priority, topic: commandTopic, type: commandType, data: commandData});
        return data;
    }

    _publish(data) {
        return new Promise((resolve, reject) => {
            this.iotData.publish(data, (err) => {
                if (err) return reject(err);
                return resolve(
                    JSON.parse(data.payload));
            });
        })
    }

    isInitialized(withError = false) {
        const isInitialized = this.endpoint !== undefined;

        if(withError && !isInitialized)
            throw 'Commander not initialized';

        return isInitialized;
    }

    setSpeed(speed) {
        this.isInitialized(true);
        return this._publish(this._buildCommandData({ speed: speed }, CommandType.SET_SPEED));
    }

    forward(delay = 0) {
        this.isInitialized(true);
        return this._publish(this._buildCommandData({ delay: delay }, CommandType.FORWARD));
    }

    backward(delay = 0) {
        this.isInitialized(true);
        return this._publish(this._buildCommandData({ delay: delay }, CommandType.BACKWARD));
    }

    right(delay = 0) {
        this.isInitialized(true);
        return this._publish(this._buildCommandData({ delay: delay }, CommandType.RIGHT));
    }

    left(delay = 0) {
        this.isInitialized(true);
        return this._publish(this._buildCommandData({ delay: delay }, CommandType.LEFT));
    }

    stop() {
        this.isInitialized(true);
        return this._publish(this._buildCommandData({}, CommandType.STOP));
    }

    drive(distance = 50) {
        this.isInitialized(true);
        return this._publish(this._buildCommandData({ distance: distance }, CommandType.DRIVE_CM));        
    }

    driveDegrees(degrees = 360) {
        this.isInitialized(true);
        return this._publish(this._buildCommandData({ distance: distance }, CommandType.DRIVE_DEGREES));           
    }

    pan(rotation = 90) {
        this.isInitialized(true);
        return this._publish(this._buildCommandData({ rotation: rotation }, CommandType.PAN));
    }

    tilt(rotation = 90) {
        this.isInitialized(true);
        return this._publish(this._buildCommandData({ rotation: rotation }, CommandType.TILT));
    }

    image() {
        this.isInitialized(true);
        return this._publish(this._buildCommandData({}, CommandType.IMAGE));
    }

    commands(commands) {
        this.isInitialized(true);
        return this._publish(this._buildCommandData(commands, CommandType.BULK));
    }

    execute(data) {
        if(typeof this[data.type] != 'function' || data.type.toLowerCase() == 'execute')
            throw `Command ${data.type} doesn't exist.`

        let values;

        if(data.type === 'commands') {
            values = data.attributes;
            return this['commands'].call(this, values);
        }
        else
            values = _.values(data.attributes);

        return this[data.type].call(this, ...values);
    }

}

module.exports = Commander;
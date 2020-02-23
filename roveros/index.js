const _ = require('lodash');
const awsIot = require('aws-iot-device-sdk');
const program = require('commander');

const Rover = require('./libs/rover');

let config;
let device;
let interval;

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', () => {

    if(rover)
        rover.kill();
    clearInterval(interval);
    
    process.exit(0);
});

program
  .version('1.0.0')
  .option('-d, --development', 'Development environment')
  .option('-e, --endpoint [endpoint]', 'AWS IoT Endpoint where the Pi\'s will connect to')
  .option('-c, --clientId [clientId]', 'Unique Client ID')
  .parse(process.argv);


if(!program.development)
    config = require('./config')('production');
else
    config = require('./config')('development');


if (program.endpoint) 
    config.iot.endpoint = program.endpoint;

if (program.clientId)
    config.iot.clientId = program.clientId;

console.log(config);

let rover = new Rover(config);

config['baseEvent'] = {
    longitude: 33.3,
    latitude: 44.4,
    humidity: 84,
    pressure: 1003,
    temperature: 18,
    last_command: undefined
}



let telemetryInterval = () => {
    if(!device || !rover) return;

    let telemetryData = rover.getAllTelemetry();
    let event = _.assign(config.baseEvent, telemetryData);

    device.publish(config.iot.topic.telemetry,
        JSON.stringify(event), (err) => {
            if(!err) console.log('debug', '[EVENT]: ' + JSON.stringify(event));
        });
}

function bootstrap(cfg) {

    device = awsIot.device({
        keyPath: `certs/private.key`,
        certPath: `certs/cert.pem`,
        caPath: 'certs/root-CA.crt',
        clientId: cfg.iot.clientId,
        host: cfg.iot.endpoint,
        debug: cfg.log == 'debug' ? true : false
    });
    
    device.subscribe([cfg.iot.topic.control, '#'].join('/'));

    device.on('connect', () => {
        console.log(`Connected to ${cfg.iot.endpoint}`);
        interval = setInterval(telemetryInterval, cfg.sensors.pollingInterval);
    });
    
    device
        .on('message', function (topic, payload) {

            let data = JSON.parse(payload.toString());

            console.log('debug', '[MESSAGE]:', topic, data);

            config['baseEvent'].last_command = data;

            if(topic.includes('control')) {
                try {
                    let { type, attributes } = data;
                    rover.execute({type, attributes});
                }catch(e) {
                    console.log(e);
                }
            }

        });
    
    device
        .on('close', function () {
            console.log('debug', `[CLOSE]: ${cfg.iot.endpoint}`);
        });
    device
        .on('reconnect', function () {
            console.log('debug', `[RECONNECT]: ${cfg.iot.endpoint}`);
        });
    device
        .on('offline', function () {
            console.log('debug', `[OFFLINE]: ${cfg.iot.endpoint}`);
        });
    device
        .on('error', function (error) {
            console.log('error', error);
        });

    return device;

}

bootstrap(config);
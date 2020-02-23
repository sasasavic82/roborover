
module.exports = {
    'api': {
        'recognition': require('./bootstrap.json').recognition_endpoint
    },
    'iot': {
        'endpoint': require('./bootstrap.json').endpoint, //process.env.AWS_IOT_ENDPOINT || 'a1o1xryvmqvun7.iot.ap-southeast-2.amazonaws.com',
        'clientId': process.env.CLIENT_ID || 'roborover_abc123',
        'topic': {
            'telemetry': 'roborover/telemetry/event',
            'control': 'roborover/control'
        }
    },
    'deviceSerial': process.env.SERIAL_NO,
    'sensors': {
        'enabled': true,
        'pollingInterval': 120000, // 5 sec polling interval
    },
    'log': 'debug'
}

module.exports = {
    'api': {
        'recognition': require('./bootstrap.json').recognition_endpoint
    },
    'iot': {
        'endpoint': require('./bootstrap.json').endpoint,
        'clientId': process.env.CLIENT_ID || 'roborover_abc123',
        'topic': {
            'telemetry': 'roborover/telemetry/event',
            'control': 'roborover/control'
        }
    },
    'deviceSerial': process.env.SERIAL_NO,
    'sensors': {
        'enabled': true,
        'pollingInterval': 30000, // 30 sec polling interval
    },
    'log': 'debug'
}
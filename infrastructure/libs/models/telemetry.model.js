const dynamoose = require('dynamoose');
const { v4 } = require('uuid');

const DEFAULTS = {
    tableName: process.env.TELEMETRY_TABLE,
    region: process.env.REGION,
    schemaOptions: {
        create: false,
        update: false,
        waitForActive: false,
        saveUnknown: true
    }
};

dynamoose.AWS.config.update({
    region: DEFAULTS.region
})

const TelemetrySchema = new dynamoose.Schema({
    telemetryId: {
        type: String,
        hashKey: true,
        default: function() {
            return v4();
        }
    },
    timestamp: {
        type: Number,
        default: function() {
            return Date.now();
        }
    },
    voltage: Number,
    distance: Number,
    speed: Number,
    longitude: Number,
    latitude: Number,
    humidity: Number,
    pressure: Number,
    temperature: Number,
    last_command: Object
});

let TelemetryModel = dynamoose.model(DEFAULTS.tableName, TelemetrySchema, DEFAULTS.schemaOptions);

module.exports = TelemetryModel;

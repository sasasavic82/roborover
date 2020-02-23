const dynamoose = require('dynamoose');

const DEFAULTS = {
    tableName: process.env.IMAGE_TABLE,
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

const ImageSchema = new dynamoose.Schema({
    roboRoverId: {
        type: String,
        hashKey: true
    },
    labels: Object,
    imagePath: String
});

let ImageModel = dynamoose.model(DEFAULTS.tableName, ImageSchema, DEFAULTS.schemaOptions);

module.exports = ImageModel;

function buildResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true 
        },
        body: JSON.stringify(body)
    }
}

function parseBody(event) {
    return JSON.parse(event.body);
}

function success(body) {
    return buildResponse(200, body);
}

function failure(body) {
    return buildResponse(500, body);
}

function notfound(body) {
    return buildResponse(404,body);
}

function notmodified(body) {
    return buildResponse(304, body)
}


function parameterValue(event, param) {
    return event.pathParameters[param];
}

function path(event, param) {
    return event.path[param];
}

function parseEvent(event) {
    return typeof event === 'object' ? event : JSON.parse(event);
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = {
    parseBody,
    success,
    failure,
    notfound,
    notmodified,
    parameterValue,
    path,
    parseEvent,
    capitalizeFirstLetter
}
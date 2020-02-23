// Enable strict mode.
'use strict';

// Load the JVSBME680 module.
const { BME680 } = require('jvsbme680');

// Initialize the BME680 object.
const bme680 = new BME680();

/**
 * Pauses code execution.
 * 
 * @param {number} duration The duration (in milliseconds).
 * @returns {Promise} A promise that is resolved when the duration has elapsed.
 */
function sleep(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
}

/**
 * Measures the gas resistance (Ohms), humidity (%RH), pressure (hPa) and temperature (degrees C).
 * The measurement is performed simultaneously and then logged to the console.
 * 
 * @async
 * @param {number} interval The measurement interval (in milliseconds).
 */
async function measureAll(interval) {
    // Indefinitely measure the gas resistance, humidity, pressure and temperature at the set interval.
    while (true) {
        try {
            const { gasResistance, humidity, pressure, temperature } = await bme680.read();
            console.log(`\nGas resistance (Ohms): ${gasResistance}`);
            console.log(`Humidity (%RH): ${humidity}`);
            console.log(`Pressure (hPa): ${pressure}`);
            console.log(`Temperature (degrees C): ${temperature}`);

            // Wait for the specified interval to elapse, before remeasuring.
            await sleep(interval);
        } catch(err) {
            console.error(`\nFailed to read data: ${err}`);
        }
    }
}

// Measure the gas resistance, humidity, and temperature at a one second interval.
measureAll(1000)
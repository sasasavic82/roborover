let exec = require('child_process').exec;
let fs = require('fs');

function getSerial(){
    return new Promise((resolve, reject) => {
        exec('cat /proc/cpuinfo | grep Serial', (err, stdout) => {
            if(err) return reject(new Error(err));
            const serialNo = stdout.split(':')[1].trim();
            return resolve(serialNo);
        })
    })
}

function encodeFile(imagePath) {
    let fileRead = fs.readFileSync(imagePath);
    return new Buffer(fileRead).toString('base64');
}

module.exports = {
    getSerial,
    encodeFile
}



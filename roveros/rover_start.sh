#!/bin/bash

ENV=${1:-development}
SERIAL_NO=$(cat /proc/cpuinfo | grep Serial | awk '{print $3}')

export CLIENT_ID=roborover_${SERIAL_NO}
export SERIAL_NO=${SERIAL_NO}
export NODE_ENV=$ENV

node index.js

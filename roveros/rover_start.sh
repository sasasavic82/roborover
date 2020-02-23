#!/bin/bash

ENV=${1:-development}
#ENDPOINT=$(aws iot describe-endpoint --query endpointAddress --output text)
#HOSTNAME=$(uname -a | awk '{print $2}')
SERIAL_NO=$(cat /proc/cpuinfo | grep Serial | awk '{print $3}')

#export AWS_IOT_ENDPOINT=${ENDPOINT}
export CLIENT_ID=roborover_${SERIAL_NO}
#export HOSTNAME=${HOSTNAME}
export SERIAL_NO=${SERIAL_NO}
export NODE_ENV=$ENV

node index.js

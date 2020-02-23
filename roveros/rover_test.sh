#!/bin/bash

ENV=development
#ENDPOINT=$(aws iot describe-endpoint --query endpointAddress --output text)
SERIAL_NO=test1234
CLIENT_ID=roborover_test1234

#export AWS_IOT_ENDPOINT=${ENDPOINT}
export CLIENT_ID=${CLIENT_ID}
export SERIAL_NO=${SERIAL_NO}
export NODE_ENV=$ENV

node index.js -d -c ${CLIENT_ID}

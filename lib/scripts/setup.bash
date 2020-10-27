
function remove_build_directory() {
    log "remove_build_directory" "removing previous build directories..." "info" 
    rm -rf ./build
    mkdir ./build
}

function create_certificates() {

    # Check to see if root CA file exists, download if not

    log "create_certificates" "creating certificates..." "info" 

    if [ ! -f ./roveros/certs/root-CA.crt ]; then
        log "create_certificates" "downloading AWS IoT Root CA certificate from Symantec..." "info"
        mkdir ./roveros/certs
        curl https://www.amazontrust.com/repository/AmazonRootCA1.pem > ./roveros/certs/root-CA.crt
    else
        log "create_certificates" "root-CA already exists ... continuing" "info" 
    fi

    # generate cert and key
    if [ ! -f ./roveros/certs/cert.pem ]; then

        log "create_certificates" "generating AWS IoT keys and certificates..." "info" 

        CERTIFICATE_ARN=$(aws iot create-keys-and-certificate --set-as-active --certificate-pem-outfile=./roveros/certs/cert.pem --public-key-outfile=./roveros/certs/public.key --private-key-outfile=./roveros/certs/private.key --query certificateArn --output text)

        if [ $? -ne 0 ]; then
            log "create_certificates" "unable to get Certificate ARN for Policy Attachment...Exiting." "fail" 
            exit 255
        fi

        log "create_certificates" "attaching Policy default-roborover-policy to ${CERTIFICATE_ARN} ARN..." "info" 

        aws iot attach-policy --policy-name "default-roborover-policy-${ENV}" --target ${CERTIFICATE_ARN}

    else
        log "create_certificates" "cert.pem already exists ... continuing" "info" 
    fi

    log "create_certificates" "certification process completed" "ok" 

}

function setup_endpoints() {

    log "setup_endpoints" "setting up endpoints..." "info" 

    ENDPOINT=$(aws iot describe-endpoint --endpoint-type iot:Data-ATS --query endpointAddress --output text)

    # Check to see if anything was returned
    if [ $? -ne 0 ]; then
        log "setup_endpoints" "unable to find AWS IoT Endpoint..." "fail" 
        exit 255
    fi

    API_MODEL=$(aws apigateway get-rest-apis --query 'items[?contains(name, `roborover-infrastructure`) == `true`].id' --output text)

    # Check to see if anything was returned
    if [ $? -ne 0 ]; then
        log "setup_endpoints" "unable to find AWS API Gateway Endpoint for Image Recognition" "fail" 
        exit 255
    fi

    ROBOROVER_RECOGNITION_ENDPOINT="https://${API_MODEL}.execute-api.${REGION}.amazonaws.com/${ENV}/api/recognize"
    ROBOROVER_CONTROL_ENDPOINT="https://${API_MODEL}.execute-api.${REGION}.amazonaws.com/${ENV}/api/control"

    export ROBOROVER_RECOGNITION_ENDPOINT
    export ROBOROVER_CONTROL_ENDPOINT

    log "setup_endpoints" "built Rekognition endpoint: ${ROBOROVER_RECOGNITION_ENDPOINT}" "ok" 
    log "setup_endpoints" "built RoboRover Control endpoint: ${ROBOROVER_CONTROL_ENDPOINT}" "ok"

}

function bootstrap() {
    
    ENV=${1:-dev}

    log "bootstrap" "bootstrapping RoboRover..." "info" 

    touch ./roveros/config/bootstrap.json
    touch ./basestation/static/envs/.env.${ENV}

    echo "{
        \"endpoint\": \"${ENDPOINT}\",
        \"recognition_endpoint\": \"${ROBOROVER_RECOGNITION_ENDPOINT}\"
    }" > ./roveros/config/bootstrap.json

    #echo "var config = { \"control_endpoint\": \"${ROBOROVER_CONTROL_ENDPOINT}\", \"recognition_endpoint\": \"${ROBOROVER_RECOGNITION_ENDPOINT}\" }" > ./ui/static/lib/config.js

    echo 
"ROBOROVER_CONTROL_ENDPOINT=${ROBOROVER_CONTROL_ENDPOINT}
RECOGNITION_ENDPOINT=${ROBOROVER_RECOGNITION_ENDPOINT}" > ./basestation/static/envs/.env.${ENV}

    # Zip it
    zip -r ./build/roborover.zip ./roveros -x ./roveros/node_modules/**\* ./roveros/*.git*

    log "bootstrap" "completed bootstrap" "ok" 
}



function clean_build() {
    log "clean_build" "cleaning previous versions of RoboRover roverOS" "info" 

    sshpass -p $DEFAULT_RASPBERRYPI_PASSWORD ssh -tt "$ROBOROVER_USERNAME@$ROBOROVER_HOSTNAME" -q << EOT
rm -rf rovertemp
rm -rf roveros
mkdir rovertemp
exit
EOT

    log "clean_build" "completed cleaning previous RoboRover roverOS" "ok" 
}

function copy_build() {
    log "copy_build" "copying build to $ROBOROVER_HOSTNAME:rovertemp/ ..." "info"
    sshpass -p $DEFAULT_RASPBERRYPI_PASSWORD scp ./build/roborover.zip "$ROBOROVER_USERNAME@$ROBOROVER_HOSTNAME:rovertemp/"
    log "copy_build" "build copied" "ok" 
}

function install_build() {
    log "install_build" "installing roverOS..." "info"

    sshpass -p $DEFAULT_RASPBERRYPI_PASSWORD ssh -tt "$ROBOROVER_USERNAME@$ROBOROVER_HOSTNAME" -q << EOT
pkill -f rover_start
pkill -f index.js
cd rovertemp
unzip roborover.zip
mv roveros /home/pi
cd /home/pi/roveros
npm install
sh rover_start.sh >>roborover.log 2>&1 &
exit
EOT

    log "install_build" "roverOS installed" "ok" 
}

function start_roveros() {
    log "start_roveros" "starting roverOS..." "info"

    sshpass -p $DEFAULT_RASPBERRYPI_PASSWORD ssh -tt "$ROBOROVER_USERNAME@$ROBOROVER_HOSTNAME" -q << EOT
pkill -f rover_start
pkill -f index.js
cd roveros
sh rover_start.sh >>roborover.log 2>&1 &
exit
EOT

    log "start_roveros" "started roverOS" "ok" 
}

function stop_roveros() {
    log "start_roveros" "starting roverOS..." "info"

    sshpass -p $DEFAULT_RASPBERRYPI_PASSWORD ssh -tt "$ROBOROVER_USERNAME@$ROBOROVER_HOSTNAME" -q << EOT
pkill -f rover_start
pkill -f index.js
exit
EOT

    log "start_roveros" "started roverOS" "ok" 
}

function start_stream_rover() {
    log "start_stream_rover" "starting streaming..." "info"

    sshpass -p $DEFAULT_RASPBERRYPI_PASSWORD ssh -tt "$ROBOROVER_USERNAME@$ROBOROVER_HOSTNAME" -q << EOT
pkill -f streaming.py
cd roveros/live
python3 streaming.py >>roborover.log 2>&1 &
exit
EOT

    log "start_stream_rover" "started roverOS" "ok" 
}

function stop_stream_rover() {
    log "start_stream_rover" "stop streaming..." "info"

    sshpass -p $DEFAULT_RASPBERRYPI_PASSWORD ssh -tt "$ROBOROVER_USERNAME@$ROBOROVER_HOSTNAME" -q << EOT
pkill -f streaming.py
exit
EOT

    log "start_stream_rover" "started roverOS" "ok" 
}

function setup_refresh() {
    ENV=${1:-dev}
    REGION=${2:-$DEFAULT_AWS_REGION}

    export AWS_DEFAULT_REGION=$REGION 

    if logged_into_aws; then
        create_certificates
        setup_endpoints
    else
        exit 255
    fi

}

function setup_roborover() {

    ENV=${1:-dev}
    REGION=${2:-$DEFAULT_AWS_REGION}

    export AWS_DEFAULT_REGION=$REGION

    log "setup_roborover" "running RoboRover setup..." "info"

    remove_build_directory

    if logged_into_aws; then
        create_certificates
        setup_endpoints
    else
        exit 255
    fi

    bootstrap $ENV

    if check_roborover_online; then     
        clean_build
        copy_build
        install_build
    else
        exit 255
    fi

    log "setup_roborover" "completed RoboRover setup" "ok"

}

function deploy_roborover() {

    ENV=${1:-dev}
    REGION=${2:-$DEFAULT_AWS_REGION}

    if logged_into_aws; then
        cd infrastructure
        log "deploy_roborover" "installing infrastructure dependencies" "info"
        npm install
        log "deploy_roborover" "deploying RoboRover infrastructure" "info"
        serverless deploy --region $REGION --stage $ENV -v 
        log "deploy_roborover" "deployed RoboRover infrastructure" "ok"
    else
        cd $CURRENT_DIR
        exit 255
    fi

    cd $CURRENT_DIR

}

function deploy_basestation() {

    ENV=${1:-dev}
    REGION=${2:-$DEFAULT_AWS_REGION}

    if logged_into_aws; then
        cd ui
        log "deploy_basestation" "deploying RoboRover basestation" "info"
        serverless deploy --region $REGION --stage $ENV -v
        log "deploy_basestation" "deployed RoboRover basestation" "ok"
    else
        cd $CURRENT_DIR
        exit 255
    fi

    cd $CURRENT_DIR

}

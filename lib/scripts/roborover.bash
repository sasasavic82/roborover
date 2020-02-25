
function run_api() {
    
    local command=${1}
    local val=${2}

    local data="{ \"type\": \"${command}\", \"attributes\": { \"rotation\": ${val} } }"

    log "run_api" "calling: $ROBOROVER_CONTROL_ENDPOINT" "debug"
    log "run_api" "payload: $data" "debug"

    response=$(curl --header "Content-Type: application/json" --request POST --data "${data}" $ROBOROVER_CONTROL_ENDPOINT --silent)

    if [ $? -ne 0 ]; then
        log "run_api" "unable to connect to RoboRover control API" "fail"
        exit 255
    fi

    log "run_api" "successful response: $response" "ok" 
}

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


function stack_commands() {
    # Store arguments in an array
    local commands=("$@")

    # Check if the number of elements in the array is even
    if (( ${#commands[@]} % 2 != 0 )); then
        echo "Error: The number of arguments must be even."
        return 1
    fi

    # Iterate through the array in pairs
    for (( i=0; i<${#commands[@]}; i+=2 )); do
        command=${commands[$i]}
        arg=${commands[$i+1]}
        log "stack_commands" "executing: $command $arg" "debug"
        run_api $command $arg
    done
}


# ascii art
function ascii() {
    cat <<"EOF"

    ____        __          ____                      
   / __ \____  / /_  ____  / __ \____ _   _____  _____
  / /_/ / __ \/ __ \/ __ \/ /_/ / __ \ | / / _ \/ ___/
 / _, _/ /_/ / /_/ / /_/ / _, _/ /_/ / |/ /  __/ /    
/_/ |_|\____/_.___/\____/_/ |_|\____/|___/\___/_/     
                                                      

EOF

}

# Do logging

LOG_TYPE=( "ok" "fail" "warning" "info" "debug" )

function log() {

    local func=${1}
    local message=${2}
    local type=${3:-ok}

    local prefix

    if [[ ! " ${LOG_TYPE[@]} " =~ " ${type} " ]]; then
        echo -e "${RT} unknown log type $type"
        exit 1
    fi

    if [ "$type" == "ok" ]; then 
        prefix="${GT}"
    elif [ "$type" == "fail" ]; then  
        prefix="${RT}"
    elif [ "$type" == "warning" ]; then
        prefix="${YT}"
    elif [ "$type" == "debug" ]; then
        prefix="${YT}"
    else 
        prefix="-"
    fi 

    echo -e "$prefix ($func) $message"

}

function validate() {

    echo "endpoint: $ROBOROVER_CONTROL_ENDPOINT"

    if [ -z "$ROBOROVER_CONTROL_ENDPOINT" ]; then
        log "validate" "RoboRover control API env variable ROBOROVER_CONTROL_ENDPOINT not set. run ./runbot setup" "fail"
        exit 255
    fi   
}

function logged_into_aws() {

    local account=$(aws sts get-caller-identity --query Account --output text)

    if [ $? -ne 0 ]; then
        log "logged_into_aws" "failed logging into AWS" "fail"
        false
        return
    fi

    log "logged_into_aws" "successfully logged into AWS account $account" "ok"
    
    true
    return
}

function check_roborover_online() {
    
    log "check_roborover_online" "checking if RoboRover is online at host: $ROBOROVER_HOSTNAME ..." "info"

    ping -c 5 $ROBOROVER_HOSTNAME

    if [ $? -ne 0 ]; then
        log "check_roborover_online" "RoboRover is currently not online" "fail"
        false
        return
    fi

    true
    return
}
const useRoborover = ({ onRequestCompleted = () => { } }) => {

    const ROBOROVER_CONTROL_ENDPOINT = process.env.REACT_APP_ROBOROVER_CONTROL_ENDPOINT;
  
    const _prepareRequest = (data, method = "POST") => {
      return {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      };
    }
  
    const sendCommands = (commands) => {
      fetch(ROBOROVER_CONTROL_ENDPOINT, _prepareRequest({
        type: "commands",
        attributes: commands
      }))
        .then(response => response.json())
        .then(data => onRequestCompleted({
          type: "command_executed",
          response: data
        }));
    }
  
    return {
      sendCommands
    }
  }

  export default useRoborover;
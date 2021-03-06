import React, { useState } from 'react';
import { Button, Card, CardBody, CardFooter, CardImg, Row, Col, Label, CardHeader } from "reactstrap";
import Select from "react-select";
import { v4 } from "uuid";
import _ from "lodash";
import Iframe from 'react-iframe'

import { components, componentSelection } from "./commands";
import { updateArrayByKey } from '../../common';
import TransactionItem from './TransactionItem';
import useRoborover from '../../hooks/useRoborover';


const Cockpit = ({ }) => {

  const [commands, setCommands] = useState([]);
  const [executed, setExecuted] = useState([]);

  const { sendCommands } = useRoborover({
    onRequestCompleted: ({ type, response }) => {
      switch (type) {
        case "command_executed":
          let executedCopy = Object.assign([], executed);
          executedCopy.push(response);
          setExecuted(executedCopy);
          break;
      }
    }
  })

  const onCommandSelected = ({ command }) => {
    setCommands(
      updateArrayByKey({
        commandId: v4(),
        command,
        rawCommand: {}
      }, commands, "commandId", true)
    );
  }

  const runMission = () => {
    let rawCommands = _.map(commands, (c) => c.rawCommand);
    sendCommands(rawCommands);
  }

  const commandChanged = (command) => {
    setCommands(
      updateArrayByKey(command, commands, "commandId")
    );
  }

  const onRemove = (commandId) => {
    let commandsCopy = Object.assign([], commands);
    _.remove(commandsCopy, (cmd) => cmd.commandId == commandId);
    setCommands(commandsCopy);
  }

  const createCommandComponent = ({ commandId, command }) => {
    let ComponentReference = components[command];
    if (!ComponentReference)
      throw Error("component doesn't exist");
    return <ComponentReference key={commandId} commandId={commandId} onRemove={onRemove} onCommandChanged={commandChanged} />
  }

  const reset = () => {
    setCommands([]);
  }

  return (
    <Card>
      <CardHeader>
        <h3>RoboRover Live Cam</h3>
      </CardHeader>
      <CardHeader className="pl-2">
        <Iframe url={process.env.REACT_APP_ROBOROVER_STREAM}
          width="640px"
          height="480px"
          id="myId"
          display="block"
          overflow="hidden"
          position="relative" />
      </CardHeader>
      <CardFooter>
        <Row>
          <Col sm="12">
            <Select
              closeMenuOnSelect={true}
              defaultValue={null}
              options={componentSelection}
              onChange={(e) => onCommandSelected({ type: e.label, command: e.value })}
            />
          </Col>
        </Row>
      </CardFooter>
      <CardBody className="border-top">
        {_.map(commands, ({ command, commandId }) => createCommandComponent({ command, commandId }))}
      </CardBody>
      <CardFooter className="border-top p-3">
        <Button className="float-right ml-2" onClick={runMission} disabled={commands.length == 0} color="success">Run Mission</Button>
        <Button className="float-right" onClick={reset} disabled={commands.length == 0} color="warning">Reset
            </Button>
      </CardFooter>
      <CardBody className="border-top">
        {_.map(executed, (ex) => <TransactionItem key={ex.commandId} response={ex} />)}
      </CardBody>
    </Card>
  );
};

export default Cockpit;

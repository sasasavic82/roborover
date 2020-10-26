import React, { useState, useRe } from 'react';
import { Button, Card, CardBody, CardFooter, CardImg, Row, Col, Label } from "reactstrap";
import Select from "react-select";
import { v4 } from "uuid";
import _ from "lodash";

import img4 from '../../assets/images/big/img4.jpg';

import { components, componentSelection } from "./commands";
import { updateArrayByKey } from '../../common';

const Cockpit = ({ }) => {

  const [commands, setCommands] = useState([]);

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
    console.log(rawCommands);
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
      <CardImg top width="100%" src={img4} alt="Card image cap" />
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
        {_.map(commands, ({ command, commandId }) => createCommandComponent({ command, commandId}))}
      </CardBody>
      <CardFooter className="border-top p-3">
        <Button className="float-right ml-2" onClick={runMission} disabled={commands.length == 0} color="success">Run Mission</Button>
        <Button className="float-right" onClick={reset} disabled={commands.length == 0} color="warning">Reset
            </Button>
      </CardFooter>
    </Card>
  );
};

export default Cockpit;

import React, { useEffect, useState } from "react";
import { Badge, Col, Input, Row } from "reactstrap";
import _, { set } from "lodash"

const Drive = ( {commandId, onRemove = () => {}, onCommandChanged = () => {}}) => {
    
    const [command, setCommand] = useState({
        type: "drive_cm",
        attributes: {
            distance: 10
        }
    });

    const onChange = (e) => {
        setCommand((prev) => ({ ...prev, attributes: { distance: e.target.value  }}))
    }

    const update = () => {
        onCommandChanged({
            commandId,
            command: command.type,
            rawCommand: command
        });
    }

    useEffect(() => {
        update();
    }, [])

    useEffect(() => {
        update();
    }, [command])

    return (
            <Row className="border-bottom pb-2">
                <Col xs="1">
                    <h1><i className="fas fa-car text-dark" /></h1>
                </Col>
                <Col xs="2">
                    <h2 className="font-medium float-left mt-0">Drive</h2>
                </Col>
                <Col xs="6">
                    <Input className="mt-2" value={command.attributes.distance} type="range" min={1} max={10000} onChange={onChange} />
                </Col>
                <Col xs="2">
                    <h3><Badge color="dark">{command.attributes.distance} cm</Badge></h3>
                </Col>
                <Col xs="1">
                    <i className="fas fa-window-close text-danger float-right mt-2" onClick={() => onRemove(commandId)} />
                </Col>
            </Row>
    );
}

export default Drive;
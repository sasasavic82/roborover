import React, { useEffect, useState } from "react";
import { Badge, Col, Input, Row } from "reactstrap";
import _, { set } from "lodash"

const Pan = ( {commandId, onRemove = () => {}, onCommandChanged = () => {}}) => {
    
    const [command, setCommand] = useState({
        type: "pan",
        attributes: {
            rotation: 90
        }
    });

    const onChange = (e) => {
        setCommand((prev) => ({ ...prev, attributes: { rotation: e.target.value }}))
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
                    <h1><i className="fas fa-arrows-alt-h text-info" /></h1>
                </Col>
                <Col xs="2">
                    <h2 className="font-medium float-left mt-0">Pan</h2>
                </Col>
                <Col xs="6">
                    <Input className="mt-2" value={command.attributes.rotation} type="range" min={0} max={160} onChange={onChange} />
                </Col>
                <Col xs="2">
                    <h3><Badge color="info">{command.attributes.rotation} degrees</Badge></h3>
                </Col>
                <Col xs="1">
                    <i className="fas fa-window-close text-danger float-right mt-2" onClick={() => onRemove(commandId)} />
                </Col>
            </Row>
    );
}

export default Pan;
import React, { useEffect, useState } from "react";
import { Badge, Col, Input, Row } from "reactstrap";
import _, { set } from "lodash"

const Right = ( {commandId, onRemove = () => {}, onCommandChanged = () => {}}) => {
    
    const [command, setCommand] = useState({
        type: "right",
        attributes: {
            delay: 1000
        }
    });

    const onChange = (e) => {
        setCommand((prev) => ({ ...prev, attributes: { delay: e.target.value }}))
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
                    <h1><i className="fas fa-arrow-right text-success" /></h1>
                </Col>
                <Col xs="2">
                    <h2 className="font-medium float-left mt-0">Right</h2>
                </Col>
                <Col xs="6">
                    <Input className="mt-2" value={command.attributes.delay} type="range" step={200} min={500} max={60000} onChange={onChange} />
                </Col>
                <Col xs="2">
                    <h3><Badge color="success">{command.attributes.delay} msec</Badge></h3>
                </Col>
                <Col xs="1">
                    <i className="fas fa-window-close text-danger float-right mt-2" onClick={() => onRemove(commandId)} />
                </Col>
            </Row>
    );
}

export default Right;
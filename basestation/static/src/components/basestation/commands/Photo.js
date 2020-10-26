import React, { useEffect, useState } from "react";
import { Badge, Col, Input, Row } from "reactstrap";
import _, { set } from "lodash"

const Photo = ( {commandId, onRemove = () => {}, onCommandChanged = () => {}}) => {
    
    const [command] = useState({
        type: "image",
        attributes: {}
    });

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
                    <h1><i className="fas fa-camera text-secondary" /></h1>
                </Col>
                <Col xs="2">
                    <h2 className="font-medium float-left mt-0">Photo</h2>
                </Col>
                <Col xs="6">
                    
                </Col>
                <Col xs="2">
                    <h3><Badge color="secondary">photo</Badge></h3>
                </Col>
                <Col xs="1">
                    <i className="fas fa-window-close text-danger float-right mt-2" onClick={() => onRemove(commandId)} />
                </Col>
            </Row>
    );
}

export default Photo;
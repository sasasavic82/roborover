import React, { useState } from 'react';
import { Row, Col, Card, CardBody, CardTitle, Nav, CardHeader, Input, Button } from 'reactstrap';
import {
  NavLink,
  Redirect,
  Route,
  Switch,
  useLocation,
} from 'react-router-dom';

import { BasestaionHeader, BasestationFooter, Cockpit } from "../../components/basestation"

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const tokens = {
  "unconference2020": true,
  "admin": true
}

const settingsRoutes = [
  {
    default: true,
    name: 'Cockpit',
    path: '/basestation/cockpit',
    component: Cockpit,
  }
];

const BasestationView = () => {

  const location = useLocation();
  const [password, setPassword] = useState("");
  const [auth, setAuth] = useState(false);


  const verifyPassword = () => {
    if(tokens[password] === undefined)
      return setAuth(false);
    return setAuth(true);
  }

  const activeRoute = (routeName) => {
    return location.pathname.indexOf(routeName) > -1 ? 'selected' : '';
  };



  return (
    <div className="page-wrapper d-block">
      <BasestaionHeader />
      {!auth ? (
          <Row className="page-content container-fluid justify-content-center">
            <Col sm="8"> 
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value) } />
            </Col>
            <Col sm="4">
                  <Button onClick={verifyPassword} color="success">
                    Unlock
                  </Button>
            </Col>
          </Row>
      ) : (
          <Row className="page-content container-fluid justify-content-center">
            <Col md="2">
              <Card>
                <CardHeader>
                  <CardTitle>RoboRover Basestation</CardTitle>
                </CardHeader >
                <CardBody>
                  <div className="sidebar-nav">
                    <Nav vertical>
                      {settingsRoutes.map((route) => (
                        <li
                          key={route.name}
                          className={`${activeRoute(route.path)} sidebar-item`}
                          style={{ width: 'auto' }}
                        >
                          <NavLink
                            to={route.path}
                            className="sidebar-link"
                            activeClassName="active"
                            style={{ color: '#212529' }}
                          >
                            <i className={route.icon} /> {route.name}
                          </NavLink>
                        </li>
                      ))}
                    </Nav>
                  </div>
                </CardBody>
              </Card >
            </Col >
            <Col md="7">
              <Switch>
                {settingsRoutes.map((route) => (
                  <Route key={route.name} path={route.path} component={route.component} />
                ))}
                <Redirect to={settingsRoutes.find((route) => route.default).path} />
              </Switch>
            </Col>
          </Row >
        )}

      <BasestationFooter />
    </div >
  );
};

export default BasestationView;

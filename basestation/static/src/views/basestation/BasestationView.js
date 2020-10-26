import React from 'react';
import { Row, Col, Card, CardBody, CardTitle, Nav, CardHeader } from 'reactstrap';
import {
  NavLink,
  Redirect,
  Route,
  Switch,
  useLocation,
} from 'react-router-dom';

import { BasestaionHeader, BasestationFooter, Cockpit } from "../../components/basestation"

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
  const activeRoute = (routeName) => {
    return location.pathname.indexOf(routeName) > -1 ? 'selected' : '';
  };

  return (
    <div className="page-wrapper d-block">
      <BasestaionHeader />
      <Row className="page-content container-fluid justify-content-center">
        <Col md="2">
          <Card>
            <CardHeader>
              <CardTitle>RoboRover Basestation</CardTitle>
            </CardHeader>
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
          </Card>
        </Col>
        <Col md="6">
          <Switch>
            {settingsRoutes.map((route) => (
              <Route key={route.name} path={route.path} component={route.component} />
            ))}
            <Redirect to={settingsRoutes.find((route) => route.default).path} />
          </Switch>
        </Col>
      </Row>
      <BasestationFooter />
    </div>
  );
};

export default BasestationView;

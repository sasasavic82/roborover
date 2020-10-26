import React from 'react';
import { Nav, Navbar, NavItem, NavLink } from 'reactstrap';

const BasestationHeader = () => {
  return (
    <div className="topbar">
      <Navbar className="top-navbar navbar-light">
        <Nav navbar>
          <NavItem>
            <NavLink href="/basestation">
              <i className="mdi mdi-view-dashboard" /> RoboRover Basestation
            </NavLink>
          </NavItem>
        </Nav>
      </Navbar>
    </div>
  );
};

export default BasestationHeader;

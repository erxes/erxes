import React from 'react';
import {
  Row,
  Col,
  Tabs,
  Tab,
  ButtonGroup,
  Button,
  DropdownButton,
  MenuItem,
} from 'react-bootstrap';
import { NameCard } from '../../../common';
import { Wrapper } from '/imports/react-ui/layout/components';
import Sidebar from './Sidebar.jsx';
import Conversations from './Conversations.jsx';
import Notes from './Notes.jsx';


function Details() {
  const user1 = {
    emails: [
      { address: 'boldkhuu.b@nmma.co' },
    ],
    details: {
      fullName: 'Болдхүү Батбаатар',
    },
  };

  const header = (
    <Wrapper.Header
      title="Customers"
      description="Lovely customers are here"
    >
      <MenuItem href="#">Action</MenuItem>
      <MenuItem href="#">Action</MenuItem>
      <MenuItem href="#">Action</MenuItem>
      <MenuItem divider />
      <MenuItem href="#">Action</MenuItem>
    </Wrapper.Header>
  );

  const actionBar = (
    <Row>
      <Col sm={6}>
        <NameCard user={user1} />
      </Col>

      <Col sm={6}>
        <div className="pull-right">
          <ButtonGroup bsSize="small">
            <Button>Send message</Button>
            <Button>Add tag</Button>
            <DropdownButton
              title=""
              id="others-dropdown"
              bsSize="small"
              pullRight
            >
              <MenuItem eventKey="1">Dropdown link</MenuItem>
              <MenuItem eventKey="2">Dropdown link</MenuItem>
            </DropdownButton>
          </ButtonGroup>
        </div>
      </Col>
    </Row>
  );

  const content = (
    <Tabs animation={false}>
      <Tab eventKey={1} title="Conversations">
        <Conversations />
        <Conversations />
      </Tab>
      <Tab eventKey={2} title="Internal notes (3)">
        <Notes />
      </Tab>
    </Tabs>
  );

  const right = (
    <div>
      <div className="flex-topbar">
        <div className="avatar-container pull-left mr-10 bg-white">
          <div className="name-letters">
            <span>A.B</span>
          </div>
        </div>

        <div className="text-bold">Anar-Erdene Batjargal</div>
        <div>anarerdene.b@nmtec.co</div>
        <div className="divider"></div>

        <ul className="clear">
          <li>
            <span className="text-bold">User ID:</span>
            #12355
          </li>
          <li>
            <span className="text-bold">Company:</span>
            The New Media Group
          </li>
          <li>
            <span className="text-bold">Phone/Mobile:</span>
            +976 11 365555
          </li>
          <li>
            <span className="text-bold">Segment:</span>
            Important
          </li>
          <li>
            <span className="text-bold">User ID:</span>
            #12355
          </li>
          <li>
            <span className="text-bold">Company:</span>
            The New Media Group
          </li>
          <li>
            <span className="text-bold">Phone/Mobile:</span>
            +976 11 365555
          </li>
          <li>
            <span className="text-bold">Segment:</span>
            Important
          </li>
        </ul>
      </div>
      <div className="box last">
        <h3>Companies (5)</h3>
        <a href="/companies/detail/234324">
          <div className="avatar-container pull-left mr-10">
        <div className="name-letters">
          <span>A.B</span>
        </div>
      </div>
          <div className="text-bold">Голден Саякэл Эшиа ХХК</div>
      <div>Company last seen: a year ago</div>
      <div className="divider"></div>
        </a>
        <a href="/companies/detail/234324">
          <div className="avatar-container pull-left mr-10">
        <div className="name-letters">
          <span>A.B</span>
        </div>
      </div>
          <div className="text-bold">Голден Саякэл Эшиа ХХК</div>
      <div>Company last seen: a year ago</div>
      <div className="divider"></div>
        </a>
        <a href="/companies/detail/234324">
          <div className="avatar-container pull-left mr-10">
        <div className="name-letters">
          <span>A.B</span>
        </div>
      </div>
          <div className="text-bold">Голден Саякэл Эшиа ХХК</div>
      <div>Company last seen: a year ago</div>
      <div className="divider"></div>
        </a>
        <a href="/companies/detail/234324">
          <div className="avatar-container pull-left mr-10">
        <div className="name-letters">
          <span>A.B</span>
        </div>
      </div>
          <div className="text-bold">Голден Саякэл Эшиа ХХК</div>
      <div>Company last seen: a year ago</div>
        </a>
      </div>
    </div>
  );

  return (
    <div>
      <Wrapper
        header={header}
        sidebar={<Sidebar />}
        actionBar={actionBar}
        content={content}
        right={right}
      />
    </div>
  );
}

export default Details;

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown, MenuItem } from 'react-bootstrap';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wrapper } from '/imports/react-ui/layout/components';
import { Pagination, NameCard } from '/imports/react-ui/common';

const propTypes = {
  customers: PropTypes.array.isRequired,
  integrations: PropTypes.array.isRequired,
  customer: PropTypes.object.isRequired,
  loadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
};

class Sidebar extends Component {
  constructor(props) {
    super(props);
  }

  renderButtons() {
    return (
      <div className="action-btn">
        <Dropdown id="contact-user" pullRight>
          <Button bsStyle="success">
            <i className="icon ion-chatbox" /> Send an messanger message
          </Button>
          <Dropdown.Toggle bsStyle="success" />
          <Dropdown.Menu>
            <MenuItem header>Twitter</MenuItem>
            <MenuItem eventKey="1">Mention</MenuItem>
            <MenuItem eventKey="2">Send a direct message</MenuItem>
            <MenuItem header>Facebook</MenuItem>
            <MenuItem eventKey="3">Send a message</MenuItem>
            <MenuItem eventKey="4" divider />
            <MenuItem eventKey="3">Block</MenuItem>
            <MenuItem eventKey="3">Delete</MenuItem>
            <MenuItem eventKey="3">Resubscribe to email</MenuItem>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    );
  }

  renderSidebarContent() {
    const { customers, hasMore, loadMore } = this.props;

    return (
      <Pagination hasMore={hasMore} loadMore={loadMore}>
        <ul className="conversations-list">
          {customers.map(c => (
            <li className="simple-row text-normal" key={c._id}>
              <div className="column">
                <input type="checkbox" />
              </div>
              <div className="column">
                <NameCard
                  url={FlowRouter.path('customers/details', { id: c._id })}
                  avatarSize={36}
                  customer={c}
                  singleLine
                />
              </div>
            </li>
          ))}
        </ul>
      </Pagination>
    );
  }

  render() {
    const Sidebar = Wrapper.Sidebar;
    const { Title } = Sidebar.Section;

    return (
      <Sidebar size="wide" fixedContent={this.renderButtons()}>
        <Sidebar.Section className="full">
          <Title>CONTACTS</Title>
          {this.renderSidebarContent()}
        </Sidebar.Section>
      </Sidebar>
    );
  }
}

Sidebar.propTypes = propTypes;

export default Sidebar;

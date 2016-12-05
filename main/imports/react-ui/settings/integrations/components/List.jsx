import React, { PropTypes, Component } from 'react';
import { Table, Button, MenuItem, Dropdown } from 'react-bootstrap';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wrapper } from '/imports/react-ui/layout/components';
import { ModalTrigger } from '/imports/react-ui/common';
import Sidebar from '../../Sidebar.jsx';
import { InAppMessaging } from '../containers';
import Row from './Row.jsx';


const propTypes = {
  integrations: PropTypes.array.isRequired,
  brands: PropTypes.array.isRequired,
  removeIntegration: PropTypes.func.isRequired,
};

class List extends Component {
  constructor(props) {
    super(props);

    this.renderIntegrations = this.renderIntegrations.bind(this);
  }

  renderIntegrations() {
    const { brands, integrations, removeIntegration } = this.props;

    return integrations.map(integration =>
      <Row
        key={integration._id}
        integration={integration}
        brands={brands}
        removeIntegration={removeIntegration}
      />
    );
  }

  render() {
    const trigger = (
      <MenuItem eventKey="1">
        <i className="ion-plus-circled" /> Add in app messaging
      </MenuItem>
    );

    const actionBarLeft = (
      <Dropdown id="integration-dropdown">
        <Dropdown.Toggle bsStyle="link">
          <i className="ion-plus-circled" /> Add integrations
        </Dropdown.Toggle>
        <Dropdown.Menu className="integration-menu">
          <ModalTrigger title="Add in app messaging" trigger={trigger}>
            <InAppMessaging />
          </ModalTrigger>
          <MenuItem eventKey="2" href={FlowRouter.path('settings/integrations/twitter')}>
            <i className="ion-plus-circled" /> Add twitter
          </MenuItem>
          <MenuItem eventKey="3" href={FlowRouter.path('settings/integrations/facebook')}>
            <i className="ion-plus-circled" /> Add facebook page
          </MenuItem>
        </Dropdown.Menu>
      </Dropdown>
    );

    const actionBar = <Wrapper.ActionBar left={actionBarLeft} />;

    const content = (
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Kind</th>
            <th>Brand</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {this.renderIntegrations()}
        </tbody>
      </Table>
    );

    const breadcrumb = [
      { title: 'Settings', link: '/settings/integrations' },
      { title: 'Integrations' },
    ];

    return (
      <div>
        <Wrapper
          header={<Wrapper.Header breadcrumb={breadcrumb} />}
          leftSidebar={<Sidebar />}
          actionBar={actionBar}
          content={content}
        />
      </div>
    );
  }
}

List.propTypes = propTypes;

export default List;

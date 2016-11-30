import React, { PropTypes, Component } from 'react';
import { Table, Button } from 'react-bootstrap';
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
      <Button bsStyle="link">
        <i className="ion-plus-circled" /> Add in app messaging
      </Button>
    );

    const actionBarLeft = (
      <div>
        <ModalTrigger title="Add in app messaging" trigger={trigger}>
          <InAppMessaging />
        </ModalTrigger>
        <Button bsStyle="link" href={FlowRouter.path('settings/integrations/twitter')}>
          <i className="ion-plus-circled" /> Add twitter
        </Button>
        <Button bsStyle="link" href={FlowRouter.path('settings/integrations/facebook')}>
          <i className="ion-plus-circled" /> Add facebook
        </Button>
      </div>
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

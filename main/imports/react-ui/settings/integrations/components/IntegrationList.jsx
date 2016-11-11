import React, { PropTypes, Component } from 'react';
import { Button, Table } from 'react-bootstrap';
import { Wrapper } from '/imports/react-ui/layout/components';
import { ModalTrigger } from '/imports/react-ui/common';
import Sidebar from '../../Sidebar.jsx';
import { IntegrationForm } from '../components';
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
        <i className="ion-plus-circled" /> New integration
      </Button>
    );

    const actionBarLeft = (
      <ModalTrigger title="New integration" trigger={trigger}>
        <IntegrationForm brands={this.props.brands} />
      </ModalTrigger>
    );

    const actionBar = (
      <Wrapper.ActionBar left={actionBarLeft} />
    );

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

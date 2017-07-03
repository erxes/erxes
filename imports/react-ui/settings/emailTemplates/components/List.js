import React, { PropTypes, Component } from 'react';
import { Button, Table } from 'react-bootstrap';
import { Wrapper } from '/imports/react-ui/layout/components';
import { ModalTrigger } from '/imports/react-ui/common';
import { Form } from '../containers';
import Sidebar from '../../Sidebar';
import Row from './Row';

const propTypes = {
  objects: PropTypes.array.isRequired,
  removeEmailTemplate: PropTypes.func.isRequired,
};

class List extends Component {
  constructor(props) {
    super(props);

    this.renderObjects = this.renderObjects.bind(this);
  }

  renderObjects() {
    const { objects, removeEmailTemplate } = this.props;

    return objects.map(emailTemplate =>
      <Row
        key={emailTemplate._id}
        emailTemplate={emailTemplate}
        removeEmailTemplate={removeEmailTemplate}
      />,
    );
  }

  render() {
    const trigger = (
      <Button bsStyle="link">
        <i className="ion-plus-circled" /> New email template
      </Button>
    );

    const actionBarLeft = (
      <ModalTrigger title="New email template" trigger={trigger}>
        <Form emailTemplate={{}} />
      </ModalTrigger>
    );

    const actionBar = <Wrapper.ActionBar left={actionBarLeft} />;

    const content = (
      <Table>
        <thead>
          <tr>
            <th width="140" />
            <th>Name</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {this.renderObjects()}
        </tbody>
      </Table>
    );

    const breadcrumb = [
      { title: 'Settings', link: '/settings/email-templates' },
      { title: 'Email templates' },
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

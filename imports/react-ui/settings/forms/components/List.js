import React, { PropTypes, Component } from 'react';
import { Button, Table } from 'react-bootstrap';
import { Wrapper } from '/imports/react-ui/layout/components';
import { ModalTrigger, Pagination } from '/imports/react-ui/common';
import Sidebar from '../../Sidebar';
import { Form } from '../containers';
import Row from './Row';

const propTypes = {
  forms: PropTypes.array.isRequired,
  removeForm: PropTypes.func.isRequired,
  duplicateForm: PropTypes.func.isRequired,
  loadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
};

class List extends Component {
  constructor(props) {
    super(props);

    this.renderForms = this.renderForms.bind(this);
  }

  renderForms() {
    const { forms, removeForm, duplicateForm } = this.props;

    return forms.map(form => (
      <Row key={form._id} form={form} removeForm={removeForm} duplicateForm={duplicateForm} />
    ));
  }

  render() {
    const { loadMore, hasMore } = this.props;

    const trigger = (
      <Button bsStyle="link">
        <i className="ion-plus-circled" /> New form
      </Button>
    );

    const actionBarLeft = (
      <ModalTrigger title="New form" trigger={trigger}>
        <Form />
      </ModalTrigger>
    );

    const actionBar = <Wrapper.ActionBar left={actionBarLeft} />;

    const content = (
      <Pagination loadMore={loadMore} hasMore={hasMore}>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Description</th>
              <th width="135">Created At</th>
              <th width="180" className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {this.renderForms()}
          </tbody>
        </Table>
      </Pagination>
    );

    const breadcrumb = [{ title: 'Settings', link: '/settings/forms' }, { title: 'Forms' }];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Sidebar />}
        actionBar={actionBar}
        content={content}
      />
    );
  }
}

List.propTypes = propTypes;

export default List;

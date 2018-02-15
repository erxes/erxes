import React, { Component } from 'react';
import { Wrapper } from 'modules/layout/components';
import {
  ModalTrigger,
  Button,
  Table,
  Tip,
  Icon
} from 'modules/common/components';
import { Form } from '/';
import { ActionButtons, TableRow } from '../../styles';

class List extends Component {
  renderEditForm(props) {
    return <Form {...props} />;
  }

  renderEditAction() {
    const editTrigger = (
      <Button btnStyle="link">
        <Tip text="Edit">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return (
      <ModalTrigger title="Edit" trigger={editTrigger}>
        {this.renderEditForm()}
      </ModalTrigger>
    );
  }

  render() {
    const breadcrumb = [
      { title: 'Settings', link: '/settings' },
      { title: 'Product & Service' }
    ];

    const trigger = (
      <Button btnStyle="success" size="small" icon="plus">
        Add Product / Service
      </Button>
    );

    const actionBarRight = (
      <ModalTrigger title="Add Product / Service" trigger={trigger}>
        {this.renderEditForm()}
      </ModalTrigger>
    );

    const content = (
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Description</th>
            <th>SKU</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <TableRow>
            <td>Product Name 1</td>
            <td>Product Type 1</td>
            <td>Product DescriptionProduct Description</td>
            <td>SKU</td>
            <td width="5%">
              <ActionButtons>
                {this.renderEditAction()}
                <Tip text="Delete">
                  <Button btnStyle="link" icon="close" />
                </Tip>
              </ActionButtons>
            </td>
          </TableRow>
          <TableRow>
            <td>Product Name 2</td>
            <td>Product Type 2</td>
            <td>Product DescriptionProduct Description</td>
            <td>SKU</td>
            <td width="5%">
              <ActionButtons>
                {this.renderEditAction()}
                <Tip text="Delete">
                  <Button btnStyle="link" icon="close" />
                </Tip>
              </ActionButtons>
            </td>
          </TableRow>
        </tbody>
      </Table>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        actionBar={<Wrapper.ActionBar right={actionBarRight} />}
        content={content}
      />
    );
  }
}

export default List;

import React, { Component } from 'react';
import { Wrapper } from 'modules/layout/components';
import {
  Button,
  Table,
  ActionButtons,
  Tip,
  Icon,
  ModalTrigger,
  Pagination
} from 'modules/common/components';

class Lead extends Component {
  renderEditAction() {
    const editTrigger = (
      <Button btnStyle="link">
        <Tip text="Edit">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return (
      <ModalTrigger size="large" title="Edit" trigger={editTrigger}>
        <div>hi</div>
      </ModalTrigger>
    );
  }

  render() {
    const actionBarRight = (
      <Button btnStyle="success" size="small" icon="plus">
        Create lead flow
      </Button>
    );

    const content = (
      <Table hover>
        <thead>
          <tr>
            <th width="30%">Name</th>
            <th width="15%">Views</th>
            <th width="15%">Conversion rate</th>
            <th width="15%">Contacts gathered</th>
            <th width="20%">Created at</th>
            <th width="5%" />
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>data</td>
            <td>0</td>
            <td>0.00%</td>
            <td>0</td>
            <td>3 hours ago</td>
            <td>
              <ActionButtons>
                {this.renderEditAction()}
                <Tip text="Delete">
                  <Button btnStyle="link" icon="close" />
                </Tip>
              </ActionButtons>
            </td>
          </tr>
          <tr>
            <td>data</td>
            <td>0</td>
            <td>0.00%</td>
            <td>0</td>
            <td>3 hours ago</td>
            <td>
              <ActionButtons>
                {this.renderEditAction()}
                <Tip text="Delete">
                  <Button btnStyle="link" icon="close" />
                </Tip>
              </ActionButtons>
            </td>
          </tr>
          <tr>
            <td>data</td>
            <td>0</td>
            <td>0.00%</td>
            <td>0</td>
            <td>3 hours ago</td>
            <td>
              <ActionButtons>
                {this.renderEditAction()}
                <Tip text="Delete">
                  <Button btnStyle="link" icon="close" />
                </Tip>
              </ActionButtons>
            </td>
          </tr>
        </tbody>
      </Table>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={[{ title: 'Forms' }]} />}
        actionBar={<Wrapper.ActionBar right={actionBarRight} />}
        footer={<Pagination count={5} />}
        content={content}
      />
    );
  }
}

export default Lead;

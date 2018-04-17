import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { BarItems } from 'modules/layout/styles';
import {
  Button,
  Table,
  Pagination,
  FormControl,
  TaggerPopover,
  DataWithLoader
} from 'modules/common/components';
import { Row } from '/';
import { Tags as Tag } from '../containers';

const propTypes = {
  integrations: PropTypes.array.isRequired,
  members: PropTypes.array.isRequired,
  tags: PropTypes.array,
  bulk: PropTypes.array.isRequired,
  emptyBulk: PropTypes.func.isRequired,
  integrationsCount: PropTypes.number.isRequired,
  toggleBulk: PropTypes.func.isRequired,
  toggleAll: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  remove: PropTypes.func
};

class List extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
  }

  onChange() {
    const { toggleAll, integrations } = this.props;
    toggleAll(integrations, 'integrations');
  }

  renderRow() {
    const { integrations, members, remove, toggleBulk } = this.props;

    return integrations.map(integration => (
      <Row
        key={integration._id}
        toggleBulk={toggleBulk}
        integration={integration}
        members={members}
        remove={remove}
      />
    ));
  }

  render() {
    const { integrationsCount, loading, tags, bulk, emptyBulk } = this.props;
    const { __ } = this.context;

    let actionBarLeft = null;

    if (bulk.length > 0) {
      const tagButton = (
        <Button btnStyle="simple" size="small" icon="downarrow">
          Tag
        </Button>
      );

      actionBarLeft = (
        <BarItems>
          <TaggerPopover
            type="integration"
            afterSave={emptyBulk}
            targets={bulk}
            trigger={tagButton}
          />
        </BarItems>
      );
    }

    const actionBarRight = (
      <Link to="/forms/create">
        <Button btnStyle="success" size="small" icon="plus">
          Create form
        </Button>
      </Link>
    );

    const actionBar = (
      <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />
    );

    const sidebar = (
      <Wrapper.Sidebar>
        <Tag tags={tags} manageUrl="tags/integration" />
      </Wrapper.Sidebar>
    );

    const content = (
      <Table whiteSpace="nowrap" hover>
        <thead>
          <tr>
            <th>
              <FormControl componentClass="checkbox" onChange={this.onChange} />
            </th>
            <th>{__('Name')}</th>
            <th>{__('Brand')}</th>
            <th>{__('Views')}</th>
            <th>{__('Conversion rate')}</th>
            <th>{__('Contacts gathered')}</th>
            <th>{__('Created at')}</th>
            <th>{__('Created by')}</th>
            <th>{__('Tags')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody id="integrations">{this.renderRow()}</tbody>
      </Table>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={[{ title: __('Forms') }]} />}
        leftSidebar={sidebar}
        actionBar={actionBar}
        footer={<Pagination count={integrationsCount} />}
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            count={integrationsCount}
            emptyText="There is no form."
            emptyImage="/images/robots/robot-03.svg"
          />
        }
      />
    );
  }
}

List.propTypes = propTypes;
List.contextTypes = {
  __: PropTypes.func
};

export default List;

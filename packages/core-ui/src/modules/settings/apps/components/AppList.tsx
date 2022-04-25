import React from 'react';

import DataWithLoader from 'modules/common/components/DataWithLoader';
import EmptyState from 'modules/common/components/EmptyState';
import Wrapper from 'modules/layout/components/Wrapper';
import Pagination from 'modules/common/components/pagination/Pagination';
import Table from 'modules/common/components/table';
import { __ } from 'modules/common/utils';
import AppRow from './AppRow';
import { IApp } from '../types';

const breadcrumb = [
  { title: 'Settings', link: '/settings' },
  { title: __('Apps') }
];

type Props = {
  apps: IApp[];
  isLoading: boolean;
  count: number;
  errorMessage: string;
}

export default class AppList extends React.Component<Props> {
  renderObjects() {
    const { apps } = this.props;
    const rows: JSX.Element[] = [];

    if (!apps) {
      return rows;
    }

    for (const app of apps) {
      rows.push(<AppRow key={app._id} app={app} />);
    }

    return rows;
  }

  renderContent() {
    return (
      <Table whiteSpace="wrap" hover={true} bordered={true} condensed={true}>
        <thead>
          <tr>
            <th>{__('Date')}</th>
            <th>{__('Name')}</th>
            <th>{__('User group')}</th>
            <th>{__('Action')}</th>
          </tr>
        </thead>
        <tbody>{this.renderObjects()}</tbody>
      </Table>
    );
  }

  render() {
    const { isLoading, count, errorMessage } = this.props;

    if (errorMessage.indexOf('Permission required') !== -1) {
      return (
        <EmptyState
          text={__('Permission denied')}
          image="/images/actions/21.svg"
        />
      );
    }

    return (
      <Wrapper
        header={<Wrapper.Header title={__('Apps')} breadcrumb={breadcrumb} />}
        footer={<Pagination count={count} />}
        content={
          <DataWithLoader
            data={this.renderContent()}
            loading={isLoading}
            count={count}
            emptyText={__('There are no apps')}
            emptyImage="/images/actions/21.svg"
          />
        }
      />
    );
  }
}

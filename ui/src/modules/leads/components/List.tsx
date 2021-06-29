import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import EmptyContent from 'modules/common/components/empty/EmptyContent';
import FormControl from 'modules/common/components/form/Control';
import Pagination from 'modules/common/components/pagination/Pagination';
import SortHandler from 'modules/common/components/SortHandler';
import Table from 'modules/common/components/table';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { BarItems } from 'modules/layout/styles';
import { EMPTY_CONTENT_POPUPS } from 'modules/settings/constants';
import TaggerPopover from 'modules/tags/components/TaggerPopover';
import React from 'react';
import { Link } from 'react-router-dom';
import { ITag } from '../../tags/types';
import { ILeadIntegration, IntegrationsCount } from '../types';
import Row from './Row';
import Sidebar from './Sidebar';

type Props = {
  integrations: ILeadIntegration[];
  tags: ITag[];
  bulk: ILeadIntegration[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  totalCount: number;
  queryParams: any;
  tagsCount: { [key: string]: number };
  toggleBulk: (target: ILeadIntegration, toAdd: boolean) => void;
  toggleAll: (bulk: ILeadIntegration[], name: string) => void;
  loading: boolean;
  remove: (integrationId: string) => void;
  archive: (integrationId: string, status: boolean) => void;
  refetch?: () => void;
  copy: (integrationId: string) => void;
  counts: IntegrationsCount;
};

class List extends React.Component<Props, {}> {
  onChange = () => {
    const { toggleAll, integrations } = this.props;
    toggleAll(integrations, 'integrations');
  };

  renderRow() {
    const {
      integrations,
      remove,
      bulk,
      toggleBulk,
      archive,
      queryParams,
      copy
    } = this.props;

    return integrations.map(integration => (
      <Row
        key={integration._id}
        isChecked={bulk.includes(integration)}
        toggleBulk={toggleBulk}
        integration={integration}
        remove={remove}
        archive={archive}
        showCode={integration._id === queryParams.showInstallCode}
        copy={copy}
      />
    ));
  }

  render() {
    const {
      totalCount,
      queryParams,
      loading,
      bulk,
      emptyBulk,
      isAllSelected,
      integrations,
      counts
    } = this.props;

    queryParams.loadingMainQuery = loading;
    let actionBarLeft: React.ReactNode;

    if (bulk.length > 0) {
      const tagButton = (
        <Button btnStyle="simple" size="small" icon="tag-alt">
          Tag
        </Button>
      );

      actionBarLeft = (
        <BarItems>
          <TaggerPopover
            type="integration"
            successCallback={emptyBulk}
            targets={bulk}
            trigger={tagButton}
          />
        </BarItems>
      );
    }

    const actionBarRight = (
      <Link to="/forms/create">
        <Button btnStyle="success" size="small" icon="plus-circle">
          {__('Create Forms')}
        </Button>
      </Link>
    );

    const actionBar = (
      <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />
    );

    const content = (
      <Table whiteSpace="nowrap" hover={true}>
        <thead>
          <tr>
            <th>
              <FormControl
                componentClass="checkbox"
                checked={isAllSelected}
                onChange={this.onChange}
              />
            </th>
            <th>
              <SortHandler sortField={'name'} label={__('Name')} />
            </th>
            <th>{__('Status')}</th>
            <th>
              <SortHandler
                sortField={'leadData.viewCount'}
                label={__('Views')}
              />
            </th>
            <th>
              <SortHandler
                sortField={'leadData.conversionRate'}
                label={__('Conversion rate')}
              />
            </th>
            <th>
              <SortHandler
                sortField={'leadData.contactsGathered'}
                label={__('Contacts gathered')}
              />
            </th>
            <th>{__('Brand')}</th>
            <th>{__('Created by')}</th>
            <th>
              <SortHandler sortField={'createdDate'} label={__('Created at')} />
            </th>
            <th>{__('Tags')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{this.renderRow()}</tbody>
      </Table>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Forms')}
            breadcrumb={[{ title: __('Forms') }]}
            queryParams={queryParams}
          />
        }
        leftSidebar={<Sidebar counts={counts || {}} />}
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            count={integrations.length}
            emptyContent={
              <EmptyContent
                content={EMPTY_CONTENT_POPUPS}
                maxItemWidth="360px"
              />
            }
          />
        }
      />
    );
  }
}

export default List;

import {
  EmptyContent,
  Button,
  FormControl,
  DataWithLoader,
  Pagination,
  SortHandler,
  __,
  Table,
  Wrapper,
  BarItems
} from 'erxes-ui';
import React from 'react';
import { Link } from 'react-router-dom';
import { IIntegration, IntegrationsCount } from '../../types';
import Row from './Row';
import Sidebar from './Sidebar';
import { ITag } from 'erxes-ui/lib/tags/types';
import TaggerPopover from './TaggerPopover';
import { PLUGIN_URL } from '../../constants';

type Props = {
  integrations: IIntegration[];
  tags: ITag[];
  bulk: IIntegration[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  totalCount: number;
  queryParams: any;
  tagsCount: { [key: string]: number };
  toggleBulk: (target: IIntegration, toAdd: boolean) => void;
  toggleAll: (bulk: IIntegration[], name: string) => void;
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
      <Link to={`${PLUGIN_URL}/pos/create`}>
        <Button btnStyle="success" size="small" icon="plus-circle">
          Create POS
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
            title={__('POS')}
            breadcrumb={[{ title: __('POS list') }]}
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
                content={{
                  title: __('Getting Started with erxes POS'),
                  description: __('BLA bla bla bla'),
                  steps: [
                    {
                      title: __('Create POS'),
                      description: __(
                        'Fill out the details and create your POS'
                      ),
                      url: `${PLUGIN_URL}/pos/create`,
                      urlText: 'Create POS'
                    }
                  ]
                }}
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

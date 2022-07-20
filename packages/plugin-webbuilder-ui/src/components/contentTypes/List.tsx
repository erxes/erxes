import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';
import FormControl from '@erxes/ui/src/components/form/Control';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import SortHandler from '@erxes/ui/src/components/SortHandler';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { EMPTY_CONTENT_POPUPS } from '@erxes/ui-settings/src/constants';
import React from 'react';
import { Link } from 'react-router-dom';
import { Flex } from '@erxes/ui/src/styles/main';
import Sidebar from './Sidebar';
import Row from './Row';

type Props = {
  history: any;
  queryParams: any;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  contentTypes: any[];
  toggleBulk: (target: any, toAdd: boolean) => void;
  toggleAll: (bulk: any[], name: string) => void;
  remove: (contentTypeId: string) => void;
  loading: boolean;
};

class ContentTypes extends React.Component<Props, {}> {
  renderRow() {
    const { contentTypes, remove, bulk, toggleBulk } = this.props;

    return contentTypes.map(contentType => (
      <Row
        key={contentType._id}
        isChecked={bulk.includes(contentType)}
        toggleBulk={toggleBulk}
        contentType={contentType}
        remove={remove}
      />
    ));
  }

  render() {
    const { queryParams, isAllSelected, loading } = this.props;

    const actionBarRight = (
      <Flex>
        <Link to="contenttypes/create">
          <Button btnStyle="success" size="small" icon="plus-circle">
            Create Content Type
          </Button>
        </Link>
      </Flex>
    );

    const actionBar = <Wrapper.ActionBar right={actionBarRight} />;

    const content = (
      <Table whiteSpace="nowrap" hover={true}>
        <thead>
          <tr>
            <th>
              <FormControl
                componentClass="checkbox"
                checked={isAllSelected}
                onChange={() => console.log('first')}
              />
            </th>
            <th>
              <SortHandler sortField={'name'} label={'Display Name'} />
            </th>
            <th>Code</th>
            <th>
              <SortHandler sortField={'createdDate'} label={'Created at'} />
            </th>
            <th>{'Actions'}</th>
          </tr>
        </thead>
        <tbody>{this.renderRow()}</tbody>
      </Table>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={'Content types'}
            breadcrumb={[{ title: 'Content types' }]}
            queryParams={queryParams}
          />
        }
        leftSidebar={<Sidebar counts={{} as any} />}
        actionBar={actionBar}
        footer={<Pagination count={10} />}
        content={
          <DataWithLoader
            data={content}
            loading={loading}
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

export default ContentTypes;

import {
  EmptyContent,
  Button,
  DataWithLoader,
  Pagination,
  SortHandler,
  __,
  Table,
  Wrapper
} from '@erxes/ui/src';
import React from 'react';
import { Link } from 'react-router-dom';
import { IPos } from '../../types';
import Row from './Row';

type Props = {
  posList: IPos[];
  bulk: IPos[]; //*checkType
  isAllSelected: boolean;
  emptyBulk: () => void;
  queryParams: any;
  tagsCount: { [key: string]: number };
  toggleBulk: (target: IPos, toAdd: boolean) => void; //*checkType
  toggleAll: (bulk: IPos[], name: string) => void; //*checkType
  loading: boolean;
  remove: (posId: string) => void;
  refetch?: () => void;
  counts: any; //*checkType
};

class List extends React.Component<Props, {}> {
  onChange = () => {
    const { toggleAll, posList } = this.props;
    toggleAll(posList, 'posList');
  };

  renderRow() {
    const { posList, remove, bulk, toggleBulk } = this.props;

    return posList.map(pos => (
      <Row
        key={pos._id}
        isChecked={bulk.includes(pos)}
        toggleBulk={toggleBulk}
        pos={pos}
        remove={remove}
      />
    ));
  }

  render() {
    const { queryParams, loading, posList } = this.props;

    queryParams.loadingMainQuery = loading;
    let actionBarLeft: React.ReactNode;

    const actionBarRight = (
      <Link to={`/pos/create`}>
        <Button btnStyle="success" size="small" icon="plus-circle">
          Create POS
        </Button>
      </Link>
    );

    const actionBar = (
      <Wrapper.ActionBar
        right={actionBarRight}
        left={actionBarLeft}
        withMargin
        wide
        background="colorWhite"
      />
    );

    const content = (
      <Table whiteSpace="nowrap" hover={true}>
        <thead>
          <tr>
            <th>
              <SortHandler sortField={'name'} label={__('Name')} />
            </th>
            <th>{__('Is Online')}</th>
            <th>{__('Created by')}</th>
            <th>
              <SortHandler sortField={'createdDate'} label={__('Created at')} />
            </th>
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
            breadcrumb={[
              { title: 'Settings', link: '/settings' },
              { title: __('POS list') }
            ]}
            queryParams={queryParams}
          />
        }
        actionBar={actionBar}
        footer={<Pagination count={50} />}
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            count={posList.length}
            emptyContent={
              <EmptyContent
                content={{
                  title: __('Getting Started with erxes POS'),
                  description: __('replace description text'),
                  steps: [
                    {
                      title: __('Create POS'),
                      description: __(
                        'Fill out the details and create your POS'
                      ),
                      url: `/pos/create`,
                      urlText: 'Create POS'
                    }
                  ]
                }}
                maxItemWidth="360px"
              />
            }
          />
        }
        hasBorder={true}
        transparent={true}
        noPadding
      />
    );
  }
}

export default List;

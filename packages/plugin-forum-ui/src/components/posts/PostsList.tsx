import * as routerUtils from '@erxes/ui/src/utils/router';
import { BarItems } from '@erxes/ui/src/layout/styles';
import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { EMPTY_CONTENT_POPUPS } from '@erxes/ui-settings/src/constants';
import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';
import { Flex } from '@erxes/ui/src/styles/main';
import FormControl from '@erxes/ui/src/components/form/Control';
import { ITag } from '@erxes/ui-tags/src/types';
import { Link } from 'react-router-dom';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import React from 'react';
import Row from './Row';
import Sidebar from './Sidebar';
import SortHandler from '@erxes/ui/src/components/SortHandler';
import { TAG_TYPES } from '@erxes/ui-tags/src/constants';
import Table from '@erxes/ui/src/components/table';
import TaggerPopover from '@erxes/ui-tags/src/components/TaggerPopover';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from 'coreui/utils';
import { IPost } from '../../types';
import { IntegrationsCount } from '@erxes/ui-leads/src/types';

type Props = {
  posts: IPost[];
  queryParams?: any;
  loading?: boolean;
  remove?: (integrationId: string) => void;
  refetch?: () => void;
  history?: any;
};

class List extends React.Component<Props, {}> {
  renderRow() {
    const { posts, remove } = this.props;

    return posts.map(post => (
      <Row key={post._id} post={post} remove={remove} />
    ));
  }

  render() {
    const { queryParams, loading, posts } = this.props;

    // queryParams.loadingMainQuery = loading;

    const actionBarRight = (
      <Button btnStyle="success" size="small" icon="plus-circle">
        Create Form
      </Button>
    );

    const actionBar = <Wrapper.ActionBar right={actionBarRight} />;

    const content = (
      <Table whiteSpace="nowrap" hover={true}>
        <thead>
          <tr>
            <th>
              <SortHandler sortField={'title'} label={__('Title')} />
            </th>
            <th>{__('State')}</th>
            <th>
              <SortHandler
                sortField={'leadData.stateChangedAt'}
                label={__('State changed at')}
              />
            </th>
            <th>{__('State changed by')}</th>
            <th>
              <SortHandler
                sortField={'leadData.createdAt'}
                label={__('Created At')}
              />
            </th>
            <th>{__('Created by')}</th>
            <th>
              <SortHandler
                sortField={'leadData.updatedAt'}
                label={__('Updated At')}
              />
            </th>
            <th>{__('Updated By')}</th>
            <th>
              <SortHandler
                sortField={'leadData.commentCount'}
                label={__('Comment(s) count')}
              />
            </th>
            <th>
              <SortHandler
                sortField={'upVoteCount'}
                label={__('Up vote count')}
              />
            </th>
            <th>
              <SortHandler
                sortField={'downVoteCount'}
                label={__('Down vote count')}
              />
            </th>
            <th>
              <SortHandler sortField={'viewCount'} label={__('View count')} />
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
            title={__('Posts')}
            breadcrumb={[{ title: __('Posts') }]}
            queryParams={queryParams}
          />
        }
        leftSidebar={<Sidebar counts={{} as IntegrationsCount} />}
        actionBar={actionBar}
        footer={<Pagination count={posts.length} />}
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            count={posts.length}
            emptyContent={
              <EmptyContent
                content={EMPTY_CONTENT_POPUPS}
                maxItemWidth="360px"
              />
            }
          />
        }
        hasBorder={true}
      />
    );
  }
}

export default List;

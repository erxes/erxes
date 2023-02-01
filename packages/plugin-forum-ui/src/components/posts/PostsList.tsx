import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { EMPTY_CONTENT_POPUPS } from '@erxes/ui-settings/src/constants';
import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import React from 'react';
import Row from './Row';
import Sidebar from './Sidebar';
import SortHandler from '@erxes/ui/src/components/SortHandler';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils';
import { IPost } from '../../types';
import { IntegrationsCount } from '@erxes/ui-leads/src/types';
import FormControl from '@erxes/ui/src/components/form/Control';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import PostForm from '../../containers/PostsList/PostForm';
import { Alert, confirm } from '@erxes/ui/src/utils';

type Props = {
  posts: IPost[];
  queryParams?: any;
  loading?: boolean;
  remove?: (postId: string, emptyBulk: () => void) => void;
  history?: any;
  bulk: any[];
  emptyBulk: () => void;
  isAllSelected: boolean;
  toggleBulk: (target: IPost, toAdd: boolean) => void;
  toggleAll: (targets: IPost[], containerId: string) => void;
};

class List extends React.Component<Props, {}> {
  renderRow() {
    const { posts, remove, bulk, toggleBulk, emptyBulk } = this.props;

    return posts.map(post => (
      <Row
        key={post._id}
        post={post}
        isChecked={bulk.includes(post)}
        toggleBulk={toggleBulk}
        remove={remove}
        emptyBulk={emptyBulk}
      />
    ));
  }

  renderForm = props => {
    return <PostForm {...props} />;
  };

  render() {
    const {
      queryParams,
      loading,
      posts,
      isAllSelected,
      bulk,
      toggleAll,
      remove,
      emptyBulk
    } = this.props;

    let actionBarLeft: React.ReactNode;

    queryParams.loadingMainQuery = loading;

    if (bulk.length > 0) {
      const onClick = () => {
        confirm('Are you sure? This cannot be undone.')
          .then(() => {
            bulk.map(item => remove(item._id, emptyBulk));
            Alert.success('You successfully deleted a post');
          })
          .catch(e => {
            Alert.error(e.message);
          });
      };

      actionBarLeft = (
        <Button
          btnStyle="danger"
          size="small"
          icon="times-circle"
          onClick={onClick}
        >
          Delete
        </Button>
      );
    }

    const actionBarRight = (
      <ModalTrigger
        title="Create New Post"
        size="lg"
        trigger={
          <Button btnStyle="success" size="small" icon="plus-circle">
            Create New Post
          </Button>
        }
        content={this.renderForm}
      />
    );

    const onChange = () => {
      toggleAll(posts, 'posts');
    };

    const actionBar = (
      <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />
    );

    const content = (
      <Table whiteSpace="nowrap" hover={true}>
        <thead>
          <tr>
            <th>
              <FormControl
                checked={isAllSelected}
                componentClass="checkbox"
                onChange={onChange}
              />
            </th>
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

    const submenu = [
      { title: 'Posts', link: '/forums/posts' },
      { title: 'Pages', link: '/forums/pages' }
    ];

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Posts')}
            queryParams={queryParams}
            submenu={submenu}
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

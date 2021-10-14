import Wrapper from 'modules/layout/components/Wrapper';
import Button from 'modules/common/components/Button';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Pagination from 'modules/common/components/pagination/Pagination';
import { __ } from 'modules/common/utils';
import { Title } from 'modules/common/styles/main';
import React from 'react';

import ForumList from '../containers/forums/ForumList';
import { ITopic } from '../types';
import DiscussionList from '../containers/discussion/DiscussionList';
import DiscussionForm from '../containers/discussion/DiscussionForm';

type Props = {
  currentTopic: ITopic;
  queryParams: any;
  discussionsCount: number;
  history: any;
};

class Forum extends React.Component<Props> {
  breadcrumb() {
    const currentTopic = this.props.currentTopic || {
      title: '',
      forum: { title: '' }
    };

    const currentForum = currentTopic.forum || { title: '' };
    const list = [{ title: __('Forum'), link: '/forum' }];
    const topicLink = `/forum?id=${currentTopic._id}`;

    if (currentForum.title) {
      list.push({
        title: currentForum.title,
        link: currentTopic ? topicLink : ''
      });
    }

    if (currentTopic.title) {
      list.push({
        title: currentTopic.title,
        link: topicLink
      });
    }

    return list;
  }

  render() {
    const { queryParams, currentTopic, discussionsCount, history } = this.props;

    const trigger = (
      <Button btnStyle="primary" uppercase={false} icon="plus-circle">
        {__('Add Discussion')}
      </Button>
    );

    const content = props => (
      <DiscussionForm
        {...props}
        queryParams={queryParams}
        currentTopicId={currentTopic._id}
        forumId={currentTopic.forumId}
        history={history}
      />
    );

    const actionBarLeft = currentTopic._id && (
      <ModalTrigger
        title={__('Add Discussion')}
        trigger={trigger}
        size="lg"
        autoOpenKey="showForumAddDiscussionModal"
        content={content}
        enforceFocus={false}
      />
    );

    const leftActionBar = (
      <Title>
        {currentTopic.title}
        <span>
          ({discussionsCount}{' '}
          {discussionsCount > 1 ? __('discussions') : __('discussion')})
        </span>
      </Title>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={`${currentTopic.title || ''}`}
            breadcrumb={this.breadcrumb()}
          />
        }
        leftSidebar={
          <ForumList
            currentTopicId={currentTopic._id}
            queryParams={queryParams}
          />
        }
        actionBar={
          <Wrapper.ActionBar left={leftActionBar} right={actionBarLeft} />
        }
        footer={currentTopic._id && <Pagination count={discussionsCount} />}
        transparent={true}
        content={
          <DiscussionList
            queryParams={queryParams}
            currentTopicId={currentTopic._id}
            forumId={currentTopic.forumId}
            history={history}
          />
        }
      />
    );
  }
}

export default Forum;

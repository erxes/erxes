import React from 'react';

import DataWithLoader from 'modules/common/components/DataWithLoader';
import EmptyContent from 'modules/common/components/empty/EmptyContent';
import Spinner from 'modules/common/components/Spinner';
import { RowDiscussion } from './styles';
import { IDiscussion } from '../../types';
import DiscussionRow from '../discussion/DiscussionRow';

import { EMPTY_CONTENT_FORUM } from 'modules/settings/constants';

type Props = {
  discussions: IDiscussion[];
  loading: boolean;
  queryParams: any;
  currentTopicId: string;
  remove: (discussionId) => void;
  forumId: string;
  history: any;
};

class DiscussionList extends React.Component<Props> {
  renderLoading = () => {
    return (
      <RowDiscussion style={{ height: '115px' }}>
        <Spinner />
      </RowDiscussion>
    );
  };

  renderDiscussions() {
    const {
      discussions,
      queryParams,
      currentTopicId,
      remove,
      forumId,
      history
    } = this.props;

    return discussions.map(discussion => (
      <DiscussionRow
        key={discussion._id}
        queryParams={queryParams}
        currentTopicId={currentTopicId}
        discussion={discussion}
        remove={remove}
        forumId={forumId}
        history={history}
      />
    ));
  }

  render() {
    const { loading, discussions } = this.props;

    return (
      <DataWithLoader
        loading={loading}
        count={discussions.length}
        emptyContent={
          <EmptyContent content={EMPTY_CONTENT_FORUM} maxItemWidth="420px" />
        }
        loadingContent={this.renderLoading()}
        data={this.renderDiscussions()}
      />
    );
  }
}

export default DiscussionList;

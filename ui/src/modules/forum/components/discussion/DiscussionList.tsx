import React from 'react';

import DataWithLoader from 'modules/common/components/DataWithLoader';
import EmptyContent from 'modules/common/components/empty/EmptyContent';
import Spinner from 'modules/common/components/Spinner';
import { RowDiscussion } from './styles';
import { IDiscussion } from '../../types';
import { DiscussionRow } from '../discussion';

import { EMPTY_CONTENT_KNOWLEDGEBASE } from 'modules/settings/constants';

type Props = {
  discussions: IDiscussion[];
  loading: boolean;
  queryParams: any;
  currentTopicId: string;
  remove: (discussionId) => void;
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
    const { discussions, queryParams, currentTopicId, remove } = this.props;

    return discussions.map(discussion => (
      <DiscussionRow
        key={discussion._id}
        queryParams={queryParams}
        currentTopicId={currentTopicId}
        discussion={discussion}
        remove={remove}
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
          <EmptyContent
            content={EMPTY_CONTENT_KNOWLEDGEBASE}
            maxItemWidth="420px"
          />
        }
        loadingContent={this.renderLoading()}
        data={this.renderDiscussions()}
      />
    );
  }
}

export default DiscussionList;

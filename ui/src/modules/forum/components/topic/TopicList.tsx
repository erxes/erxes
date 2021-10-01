import React from 'react';
import TopicRow from './TopicRow';
import { Topics } from './styles';
import { IForum } from '../../types';

type Props = {
  currentTopicId: string;
  remove: (topicId: string) => void;
  forum: IForum;
};

class TopicList extends React.Component<Props> {
  render() {
    const { forum, currentTopicId, remove } = this.props;
    const { topics } = forum;

    return (
      <Topics>
        {topics.map(topic => {
          return (
            <TopicRow
              key={topic._id}
              isActive={topic._id === currentTopicId}
              topic={topic}
              remove={remove}
            />
          );
        })}
      </Topics>
    );
  }
}

export default TopicList;

import React from 'react';
import TopicRow from './TopicRow';
import { Topics } from './styles';
import { ITopic } from '../../types';

type Props = {
  forumTopics: ITopic[];
  forumId: string;
  currentTopicId: string;
  remove: (topicId: string) => void;
};

class TopicList extends React.Component<Props> {
  generateTopic = (topics, _id) => {
    topics.filter(f => f._id === _id);
  };

  render() {
    const { forumTopics, forumId, currentTopicId, remove } = this.props;

    this.generateTopic(forumTopics, forumId);

    return (
      <Topics>
        {forumTopics.map((topic, index) => {
          if (topic.forumId === forumId) {
            return (
              <TopicRow
                key={index}
                isActive={topic._id === currentTopicId}
                topic={topic}
                remove={remove}
              />
            );
          } else {
            return null;
          }
        })}
      </Topics>
    );
  }
}

export default TopicList;

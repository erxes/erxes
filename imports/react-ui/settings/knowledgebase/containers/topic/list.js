import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Meteor } from 'meteor/meteor';
import { KbTopics } from '/imports/api/knowledgebase/collections';
import { pagination } from '/imports/react-ui/common';
import { KbTopicList } from '../../components/topic';

function topicsComposer({ queryParams }, onData) {
  const { limit, loadMore, hasMore } = pagination(queryParams, 'kb_topics.list.count');
  const kbTopicsHandler = Meteor.subscribe('kb_topics.list', Object.assign(queryParams, { limit }));
  const brandsHandler = Meteor.subscribe('brands.list', 0);

  const removeItem = (id, callback) => {
    Meteor.call('knowledgebase.removeKbTopic', id, callback);
  };

  if (kbTopicsHandler.ready() && brandsHandler.ready()) {
    const items = KbTopics.find().fetch();
    onData(null, {
      items,
      removeItem,
      loadMore,
      hasMore,
    });
  }
}

export default compose(getTrackerLoader(topicsComposer), composerOptions({}))(KbTopicList);

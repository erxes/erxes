import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Meteor } from 'meteor/meteor';
import { KbTopics } from '/imports/api/knowledgebase/collections';
import { Brands } from '/imports/api/brands/brands';
import { pagination } from '/imports/react-ui/common';
import { TopicList } from '../components';

function topicsComposer({ queryParams }, onData) {
  const { limit, loadMore, hasMore } = pagination(queryParams, 'kb_topics.list.count'); // TODO
  const kbTopicsHandler = Meteor.subscribe('kb_topics.list', Object.assign(queryParams, { limit }));
  const brandsHandler = Meteor.subscribe('brands.list', 0);

  const kbTopics = KbTopics.find().fetch();
  const brands = Brands.find().fetch();

  const removeKbTopic = (id, callback) => {
    Meteor.call('kb_topics.remove', id, callback);
  };

  if (kbTopicsHandler.ready() && brandsHandler.ready()) {
    onData(null, {
      kbTopics,
      brands,
      removeKbTopic,
      loadMore,
      hasMore,
    });
  }
}

export default compose(getTrackerLoader(topicsComposer), composerOptions({}))(TopicList);

import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Meteor } from 'meteor/meteor';
import { KbCategories, KbTopics } from '/imports/api/knowledgebase/collections';
import { pagination } from '/imports/react-ui/common';
import { KbCategoryList } from '../../components';

function categoriesComposer({ queryParams }, onData) {
  const { limit, loadMore, hasMore } = pagination(queryParams, 'kb_categories.list.count'); // TODO
  const kbCategoriesHandler = Meteor.subscribe(
    'kb_categories.list',
    Object.assign(queryParams, { limit }),
  );
  const kbTopicsHandler = Meteor.subscribe('kb_topics.list', Object.assign({}, { limit }));

  const items = KbCategories.find().fetch();
  const topics = KbTopics.find().fetch();

  const removeItem = (id, callback) => {
    Meteor.call('knowledgebase.removeKbCategory', id, callback);
  };

  if (kbTopicsHandler.ready() && kbCategoriesHandler.ready()) {
    onData(null, {
      items,
      topics,
      removeItem,
      loadMore,
      hasMore,
    });
  }
}

export default compose(getTrackerLoader(categoriesComposer), composerOptions({}))(KbCategoryList);

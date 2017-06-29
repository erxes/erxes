import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Meteor } from 'meteor/meteor';
import { KbCategories } from '/imports/api/knowledgebase/collections';
import { pagination } from '/imports/react-ui/common';
import { CategoryList } from '../components';

function categoriesComposer({ queryParams }, onData) {
  const { limit, loadMore, hasMore } = pagination(queryParams, 'kb_categories.list.count'); // TODO
  const kbCategoriesHandler = Meteor.subscribe(
    'kb_categories.list',
    Object.assign(queryParams, { limit }),
  );

  const items = KbCategories.find().fetch();

  const removeItem = (id, callback) => {
    Meteor.call('kb_categories.remove', id, callback);
  };

  if (kbCategoriesHandler.ready()) {
    onData(null, {
      items,
      removeItem,
      loadMore,
      hasMore,
    });
  }
}

export default compose(getTrackerLoader(categoriesComposer), composerOptions({}))(CategoryList);

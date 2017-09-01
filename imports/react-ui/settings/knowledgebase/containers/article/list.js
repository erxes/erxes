import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Meteor } from 'meteor/meteor';
import { KbArticles, KbCategories } from '/imports/api/knowledgebase/collections';
import { pagination } from '/imports/react-ui/common';
import { KbArticleList } from '../../components';

function articlesComposer({ queryParams }, onData) {
  const { limit, loadMore, hasMore } = pagination(queryParams, 'kb_articles.list.count');
  const kbArticlesHandler = Meteor.subscribe(
    'kb_articles.list',
    Object.assign(queryParams, { limit }),
  );
  const kbCategoriesHandler = Meteor.subscribe('kb_categories.list', Object.assign({}, { limit }));

  const items = KbArticles.find().fetch();
  const categories = KbCategories.find().fetch();

  const removeItem = (id, callback) => {
    Meteor.call('knowledgebase.removeKbArticle', id, callback);
  };

  if (kbCategoriesHandler.ready() && kbArticlesHandler.ready()) {
    onData(null, {
      items,
      categories,
      removeItem,
      loadMore,
      hasMore,
    });
  }
}

export default compose(getTrackerLoader(articlesComposer), composerOptions({}))(KbArticleList);

import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Meteor } from 'meteor/meteor';
import { KbArticles } from '/imports/api/knowledgebase/collections';
import { pagination } from '/imports/react-ui/common';
import { KbArticleList } from '../../components';

function articlesComposer({ queryParams }, onData) {
  const { limit, loadMore, hasMore } = pagination(queryParams, 'kb_articles.list.count'); // TODO
  const kbArticlesHandler = Meteor.subscribe(
    'kb_articles.list',
    Object.assign(queryParams, { limit }),
  );

  const items = KbArticles.find().fetch();

  const removeItem = (id, callback) => {
    Meteor.call('kb_articles.remove', id, callback);
  };

  if (kbArticlesHandler.ready()) {
    onData(null, {
      items,
      removeItem,
      loadMore,
      hasMore,
    });
  }
}

export default compose(getTrackerLoader(articlesComposer), composerOptions({}))(KbArticleList);

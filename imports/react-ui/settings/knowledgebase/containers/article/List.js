import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Meteor } from 'meteor/meteor';
import { KbArticles } from '/imports/api/knowledgebase/collections';
import { pagination } from '/imports/react-ui/common';
import { KbArticleList } from '../../components';
import { removeKbArticle } from '/imports/api/knowledgebase/methods';

function articlesComposer({ queryParams }, onData) {
  const { limit, loadMore, hasMore } = pagination(queryParams, 'kb_articles.list.count');
  const kbArticlesHandler = Meteor.subscribe(
    'kb_articles.list',
    Object.assign(queryParams, { limit }),
  );

  const removeItem = (id, callback) => {
    removeKbArticle(id, (err, res) => {
      if (!err) {
        callback(res);
      }
    });
  };

  if (kbArticlesHandler.ready()) {
    const items = KbArticles.find().fetch();
    onData(null, {
      items,
      removeItem,
      loadMore,
      hasMore,
    });
  }
}

export default compose(getTrackerLoader(articlesComposer), composerOptions({}))(KbArticleList);

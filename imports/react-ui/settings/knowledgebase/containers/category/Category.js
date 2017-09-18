import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { KbCategory } from '../../components';
import { saveCallback } from '../utils';
import { KbArticles } from '/imports/api/knowledgebase/collections';

const composer = (props, onData) => {
  const { item } = props;
  let currentMethod = 'addKbCategory';

  if (item != null && item._id) {
    currentMethod = 'editKbCategory';
  }

  const articlesHandler = Meteor.subscribe('kb_articles.list', { limit: 0 });

  const save = doc => {
    let params = { doc };
    if (item != null && item._id) {
      params._id = item._id;
    }
    saveCallback(params, currentMethod, '/settings/knowledgebase/categories');
  };

  if (articlesHandler.ready()) {
    const articles = KbArticles.find().fetch();
    return onData(null, { articles, save });
  }

  return null;
};

export default compose(getTrackerLoader(composer), composerOptions({ spinner: true }))(KbCategory);

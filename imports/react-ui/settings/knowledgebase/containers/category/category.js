import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { KbCategory } from '../../components';
import { saveCallback } from '../utils';
import { KbArticles } from '/imports/api/knowledgebase/collections';

const composer = (props, onData) => {
  const articlesHandler = Meteor.subscribe('kb_articles.list', { limit: 0 });
  const articles = KbArticles.find().fetch();

  const save = doc =>
    saveCallback(
      { doc },
      'addKbCategory',
      'editKbCategory',
      props.item,
      '/settings/knowledgebase/categories',
    );

  if (articlesHandler.ready()) {
    return onData(null, { articles, save });
  }

  return null;
};

export default compose(getTrackerLoader(composer), composerOptions({ spinner: true }))(KbCategory);

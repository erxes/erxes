import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { KbArticle } from '../../components';
import { saveCallback } from '../utils';
import { KbCategories } from '/imports/api/knowledgebase/collections';

const composer = (props, onData) => {
  const categoriesHandler = Meteor.subscribe('kb_categories.list', {});
  const categories = KbCategories.find().fetch();

  const save = doc =>
    saveCallback(
      { doc },
      'addKbArticle',
      'editKbArticle',
      props.item,
      '/settings/knowledgebase/articles',
    );

  if (categoriesHandler.ready()) {
    return onData(null, { categories, save });
  }

  return null;
};

export default compose(getTrackerLoader(composer), composerOptions({ spinner: true }))(KbArticle);

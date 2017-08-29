import { Brands } from '/imports/api/brands/brands';
import { KbCategories } from '/imports/api/knowledgebase/collections';
import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { KbTopic } from '../../components';
import { saveCallback } from '../utils';

const composer = (props, onData) => {
  const brandsHandler = Meteor.subscribe('brands.list', 0);
  const categoriesHandler = Meteor.subscribe('kb_categories.list', {});

  const save = doc =>
    saveCallback({ doc }, 'addKbTopic', 'editKbTopic', props.item, '/settings/knowledgebase');

  if (brandsHandler.ready() && categoriesHandler.ready()) {
    const brands = Brands.find().fetch();
    const categories = KbCategories.find().fetch();
    return onData(null, { brands, categories, item: props.item, save });
  }

  return null;
};

export default compose(getTrackerLoader(composer), composerOptions({ spinner: true }))(KbTopic);

import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { KbTopic } from '../../components';
import { saveCallback } from '../utils';
import { addKbTopic, editKbTopic } from '/imports/api/knowledgebase/methods';
import { Brands } from '/imports/api/brands/brands';
import { KbCategories } from '/imports/api/knowledgebase/collections';

const composer = (props, onData) => {
  const { item } = props;
  let currentMethod = addKbTopic;

  if (item != null && item._id) {
    currentMethod = editKbTopic;
  }

  const brandsHandler = Meteor.subscribe('brands.list', 0);
  const categoriesHandler = Meteor.subscribe('kb_categories.list', {});

  const save = doc => {
    let params = { doc };
    if (item != null && item._id) {
      params._id = item._id;
    }
    saveCallback(params, currentMethod, '/settings/knowledgebase/');
  };

  if (brandsHandler.ready() && categoriesHandler.ready()) {
    const brands = Brands.find().fetch();
    const categories = KbCategories.find().fetch();
    return onData(null, { brands, categories, item: props.item, save });
  }

  return null;
};

export default compose(getTrackerLoader(composer), composerOptions({ spinner: true }))(KbTopic);

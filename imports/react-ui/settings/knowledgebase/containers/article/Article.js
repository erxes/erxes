import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { KbArticle } from '../../components';
import { saveCallback } from '../utils';
import { addKbArticle, editKbArticle } from '/imports/api/knowledgebase/methods';

const composer = (props, onData) => {
  const { item } = props;
  let currentMethod = addKbArticle;

  if (item != null && item._id) {
    currentMethod = editKbArticle;
  }

  const save = doc => {
    let params = { doc };
    if (item != null && item._id) {
      params._id = item._id;
    }
    saveCallback(params, currentMethod, '/settings/knowledgebase/articles');
  };

  return onData(null, { item, save });
};

export default compose(getTrackerLoader(composer), composerOptions({ spinner: true }))(KbArticle);

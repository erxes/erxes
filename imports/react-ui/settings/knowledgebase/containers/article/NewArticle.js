import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { KbArticle } from '../../components';
import { saveCallback } from '../utils';

const composer = (props, onData) => {
  const { item = {}, listRefetch } = props;

  const save = doc => {
    let params = { doc };
    saveCallback(params, 'addKbArticle', '/settings/knowledgebase/articles', listRefetch);
  };

  return onData(null, { item, save });
};

export default compose(getTrackerLoader(composer), composerOptions({ spinner: true }))(KbArticle);

import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { KbArticle } from '../../components';
import { saveCallback } from '../utils';

const composer = (props, onData) => {
  const save = doc =>
    saveCallback(
      { doc },
      'addKbArticle',
      'editKbArticle',
      props.item,
      '/settings/knowledgebase/articles',
    );

  return onData(null, { save });
};

export default compose(getTrackerLoader(composer), composerOptions({ spinner: true }))(KbArticle);

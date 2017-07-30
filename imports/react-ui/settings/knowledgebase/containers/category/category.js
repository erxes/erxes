import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { KbCategory } from '../../components';
import { saveCallback } from '../utils';
import { KbTopics } from '/imports/api/knowledgebase/collections';

const composer = (props, onData) => {
  const topicsHandler = Meteor.subscribe('kb_topics.list', {});
  const topics = KbTopics.find().fetch();

  const save = doc =>
    saveCallback(
      { doc },
      'addKbCategory',
      'editKbCategory',
      props.item,
      '/settings/knowledgebase/categories',
    );

  if (topicsHandler.ready()) {
    return onData(null, { topics, save });
  }

  return null;
};

export default compose(getTrackerLoader(composer), composerOptions({ spinner: true }))(KbCategory);

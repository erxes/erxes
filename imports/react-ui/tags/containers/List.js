import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Tags } from '/imports/api/tags/tags';
import { remove } from '/imports/api/tags/methods';
import { List } from '../components';

function composer({ type }, onData) {
  const tagsHandle = Meteor.subscribe('tags.tagList', type);

  if (tagsHandle.ready()) {
    onData(null, {
      tags: Tags.find({ type }).fetch(),
      type,
      remove,
    });
  }
}

export default compose(getTrackerLoader(composer), composerOptions({}))(List);

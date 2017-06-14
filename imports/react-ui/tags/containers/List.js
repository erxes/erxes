import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import Alert from 'meteor/erxes-notifier';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Tags } from '/imports/api/tags/tags';
import { List } from '../components';

function composer({ type }, onData) {
  const tagsHandle = Meteor.subscribe('tags.tagList', type);

  const remove = tag => {
    if (!confirm('Are you sure you want to delete this tag?')) {
      // eslint-disable-line no-alert
      return;
    }

    Meteor.call('tags.remove', [tag._id], error => {
      if (error) {
        return Alert.error(error.reason);
      }

      return Alert.success('The tag has been deleted, forever!');
    });
  };

  if (tagsHandle.ready()) {
    onData(null, {
      tags: Tags.find({ type }).fetch(),
      type,
      remove,
    });
  }
}

export default compose(getTrackerLoader(composer), composerOptions({}))(List);

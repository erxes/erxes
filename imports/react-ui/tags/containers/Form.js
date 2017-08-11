import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Form } from '../components';

function composer({ tag, type }, onData) {
  function submit(doc, callback) {
    if (tag) {
      return Meteor.call('tags.edit', { id: tag._id, doc }, callback);
    }

    return Meteor.call('tags.add', doc, callback);
  }

  onData(null, { tag, type, submit });
}

export default compose(getTrackerLoader(composer), composerOptions({}))(Form);

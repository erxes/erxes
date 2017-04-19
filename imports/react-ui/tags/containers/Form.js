import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { add, edit } from '/imports/api/tags/methods';
import { Form } from '../components';

function composer({ tag, type }, onData) {
  function submit(doc, callback) {
    if (tag) {
      return edit.call({ id: tag._id, doc }, callback);
    }

    return add.call(doc, callback);
  }

  onData(null, { tag, type, submit });
}

export default compose(getTrackerLoader(composer), composerOptions({}))(Form);

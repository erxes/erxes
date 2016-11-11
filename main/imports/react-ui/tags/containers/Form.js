import { composeWithTracker } from 'react-komposer';
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

export default composeWithTracker(composer)(Form);

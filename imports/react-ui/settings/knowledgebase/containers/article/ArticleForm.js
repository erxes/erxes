import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { ArticleForm } from '../../components';

const composer = (props, onData) => {
  return onData(null, { ...props });
};

export default compose(getTrackerLoader(composer), composerOptions({ spinner: true }))(ArticleForm);

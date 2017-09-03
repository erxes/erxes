import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Brands } from '/imports/api/brands/brands';
import { Form } from '../components';

function composer({ object }, onData) {
  const brandsHandler = Meteor.subscribe('brands.list', 100);

  if (brandsHandler.ready()) {
    onData(null, {
      object,
      brands: Brands.find({}).fetch(),
    });
  }
}

export default compose(getTrackerLoader(composer), composerOptions({ spinner: true }))(Form);

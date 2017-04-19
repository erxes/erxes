import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { ResponseTemplates } from '/imports/api/responseTemplates/responseTemplates';
import { Brands } from '/imports/api/brands/brands';
import { ResponseTemplate } from '../components';

function composer(props, onData) {
  const brandHandle = Meteor.subscribe('brands.list', 0);
  const brands = Brands.find({}, { sort: { name: 1 } }).fetch();
  const responseTemplatesHandle = Meteor.subscribe('responseTemplates.list');

  const responseTemplates = ResponseTemplates.find({}).fetch();

  if (brandHandle.ready() && responseTemplatesHandle.ready()) {
    onData(null, {
      brands,
      responseTemplates,
    });
  }
}

export default compose(getTrackerLoader(composer), composerOptions({}))(ResponseTemplate);

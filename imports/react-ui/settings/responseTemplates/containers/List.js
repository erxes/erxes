import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Meteor } from 'meteor/meteor';
import { Brands } from '/imports/api/brands/brands';
import { ResponseTemplates } from '/imports/api/responseTemplates/responseTemplates';
import { remove } from '/imports/api/responseTemplates/methods';
import { List } from '../components';

function composer({ queryParams }, onData) {
  const templatesHandler = Meteor.subscribe('responseTemplates.list');
  const brandsHandler = Meteor.subscribe('brands.list', 100);

  const objects = ResponseTemplates.find({}).fetch();

  const removeResTemplate = (id, callback) => {
    remove.call(id, callback);
  };

  if (templatesHandler.ready() && brandsHandler.ready()) {
    onData(null, {
      objects,
      brands: Brands.find({}).fetch(),
      removeResTemplate,
    });
  }
}

export default compose(getTrackerLoader(composer), composerOptions({}))(List);

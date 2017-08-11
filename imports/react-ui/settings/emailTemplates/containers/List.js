import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Meteor } from 'meteor/meteor';
import { EmailTemplates } from '/imports/api/emailTemplates/emailTemplates';
import { remove } from '/imports/api/emailTemplates/methods';
import { List } from '../components';

function composer({ queryParams }, onData) {
  const templatesHandler = Meteor.subscribe('emailTemplates.list');

  const objects = EmailTemplates.find({}).fetch();

  const removeEmailTemplate = (id, callback) => {
    remove.call(id, callback);
  };

  if (templatesHandler.ready()) {
    onData(null, {
      objects,
      removeEmailTemplate,
    });
  }
}

export default compose(getTrackerLoader(composer), composerOptions({}))(List);

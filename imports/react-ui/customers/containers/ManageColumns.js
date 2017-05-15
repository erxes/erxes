import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
import { Meteor } from 'meteor/meteor';
import { Customers } from '/imports/api/customers/customers';
import { ManageColumns } from '../components';

function composer(props, onData) {
  // If there's no customer fields config, all fields will be selected
  const selected =
    (Meteor.user() && Meteor.user().configs && Meteor.user().configs.customerFields) ||
    Customers.getPublicFields();
  const saveConfig = fields => {
    Meteor.call('users.configCustomerFields', { fields });
  };

  onData(null, {
    fields: Customers.getPublicFields().map(({ key, label }) => ({
      _id: key,
      title: label,
      selectedBy: selected.find(s => s.key === key) ? 'all' : 'none',
    })),
    saveConfig,
  });
}

export default compose(getTrackerLoader(composer))(ManageColumns);

import React, { PropTypes } from 'react';
import { _ } from 'meteor/underscore';
import { Wrapper } from '/imports/react-ui/layout/components';
import { Checkbox } from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';
import Sidebar from '../../Sidebar.jsx';


class NotificationSettings extends React.Component {
  constructor(props) {
    super(props);

    // on notif type change
    this.onTypeChange = this.onTypeChange.bind(this);

    this.onEmailConfigChange = this.onEmailConfigChange.bind(this);
  }

  onTypeChange(e) {
    // save config
    this.props.save(e.target.value, e.target.checked, (error) => {
      if (error) return Alert.error(error.reason);
      return Alert.success('Congrats');
    });
  }

  onEmailConfigChange(e) {
    // save get notification by email config
    this.props.configGetNotificationByEmail(
      { isAllowed: e.target.checked },
      (error) => {
        if (error) return Alert.error(error.reason);
        return Alert.success('Congrats');
      }
    );
  }

  isChecked(notifType) {
    const oldEntry = _.find(this.props.configs, (config) =>
      config.notifType === notifType.name
    );

    // if no previous configuration found then default is checked
    if (!oldEntry) {
      return true;
    }

    return oldEntry.isAllowed;
  }

  renderNotifType(type, key) {
    return (
      <li key={key}>
        <Checkbox
          value={type.name}
          checked={this.isChecked(type)}
          onChange={this.onTypeChange}
        >

          {type.text}
        </Checkbox>
      </li>
    );
  }

  renderModule(module, mindex) {
    return (
      <li key={mindex}>
        <h5>{module.description}</h5>
        <ul>
          {module.types.map(
            (type, index) => this.renderNotifType(type, `${mindex}${index}`)
          )}
        </ul>
      </li>
    );
  }

  render() {
    const content = (
      <div className="margined notification-settings">
        <Checkbox
          defaultChecked={this.props.getNotificationByEmail}
          onChange={this.onEmailConfigChange}
        >
        Get notification by email
        </Checkbox>

        <ul>
          {this.props.modules.map(
            (module, index) => this.renderModule(module, index)
          )}
        </ul>
      </div>
    );

    const breadcrumb = [
      { title: 'Settings', link: '/settings/channels' },
      { title: 'Notification settings' },
    ];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Sidebar />}
        content={content}
      />
    );
  }
}

NotificationSettings.propTypes = {
  modules: PropTypes.array.isRequired,
  configs: PropTypes.array.isRequired,
  save: PropTypes.func.isRequired,

  // save get notification by email action
  configGetNotificationByEmail: PropTypes.func.isRequired,

  // previously configured value
  getNotificationByEmail: PropTypes.bool.isRequired,
};


export default NotificationSettings;

import React, { PropTypes } from 'react';
import { _ } from 'meteor/underscore';
import Toggle from 'react-toggle';
import { Wrapper } from '/imports/react-ui/layout/components';
import Alert from 'meteor/erxes-notifier';
import Sidebar from '../../Sidebar';

class NotificationSettings extends React.Component {
  constructor(props) {
    super(props);

    // on notif type change
    this.onTypeChange = this.onTypeChange.bind(this);

    this.onEmailConfigChange = this.onEmailConfigChange.bind(this);
  }

  onTypeChange(e) {
    // save config
    this.props.save(e.target.value, e.target.checked, error => {
      if (error) return Alert.error(error.reason);
      return Alert.success('Congrats');
    });
  }

  onEmailConfigChange(e) {
    // save get notification by email config
    this.props.configGetNotificationByEmail({ isAllowed: e.target.checked }, error => {
      if (error) return Alert.error(error.reason);
      return Alert.success('Congrats');
    });
  }

  isChecked(notifType) {
    const oldEntry = _.find(this.props.configs, config => config.notifType === notifType.name);

    // if no previous configuration found then default is checked
    if (!oldEntry) {
      return true;
    }

    return oldEntry.isAllowed;
  }

  renderNotifType(type, key) {
    return (
      <div key={key} className="flex-inline">
        <Toggle
          value={type.name}
          checked={this.isChecked(type)}
          onChange={this.onTypeChange}
          icons={{
            checked: null,
            unchecked: null,
          }}
        />
        {type.text}
      </div>
    );
  }

  renderModule(module, mindex) {
    return (
      <div key={mindex}>
        <h5>{module.description}</h5>
        {module.types.map((type, index) => this.renderNotifType(type, `${mindex}${index}`))}
      </div>
    );
  }

  render() {
    const content = (
      <div className="margined notification-settings">
        <div className="flex-inline">
          <Toggle
            defaultChecked={this.props.getNotificationByEmail}
            onChange={this.onEmailConfigChange}
            icons={{
              checked: null,
              unchecked: null,
            }}
          />
          Get notification by email
        </div>
        <div className="margined">
          {this.props.modules.map((module, index) => this.renderModule(module, index))}
        </div>
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

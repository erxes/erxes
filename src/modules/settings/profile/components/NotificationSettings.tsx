import { __ } from 'modules/common/utils';
import * as React from 'react';
import Toggle from 'react-toggle';
import { InlineItems, ModuleBox, SubHeading, SubItem } from '../../styles';
import { IConfig, IModules } from '../types';

type Props = {
  modules: IModules[];
  configs: IConfig[];
  // save notification configurations
  saveNotificationConfigurations: (notify: { notifType: string, isAllowed: boolean }) => void;
  // save get notification by email action
  configGetNotificationByEmail: (byEmail: { isAllowed: boolean }) => void;
  // previously configured value
  getNotificationByEmail: boolean;
};

class NotificationSettings extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    // on notif type change
    this.onTypeChange = this.onTypeChange.bind(this);

    this.onEmailConfigChange = this.onEmailConfigChange.bind(this);
  }

  onTypeChange(e) {
    // save config
    this.props.saveNotificationConfigurations({
      notifType: e.target.value,
      isAllowed: e.target.checked
    });
  }

  onEmailConfigChange(e) {
    // save get notification by email config
    this.props.configGetNotificationByEmail({ isAllowed: e.target.checked });
  }

  isChecked(notifType) {
    const oldEntry = this.props.configs.find(
      config => config.notifType === notifType.name
    );

    // if no previous configuration found then default is checked
    if (!oldEntry) {
      return true;
    }

    return oldEntry.isAllowed;
  }

  renderNotifType(type, key) {
    return (
      <InlineItems key={key}>
        {type.text}
        <Toggle
          value={type.name}
          checked={this.isChecked(type)}
          onChange={this.onTypeChange}
          icons={{
            checked: null,
            unchecked: null
          }}
        />
      </InlineItems>
    );
  }

  renderModule(module, mindex) {
    return (
      <SubItem key={mindex}>
        <SubHeading>{module.description}</SubHeading>
        {module.types.map((type, index) =>
          this.renderNotifType(type, `${mindex}${index}`)
        )}
      </SubItem>
    );
  }

  render() {
    const content = (
      <React.Fragment>
        <SubHeading>{__('Notifications')}</SubHeading>
        <InlineItems>
          {__('Get notification by email')}
          <Toggle
            defaultChecked={this.props.getNotificationByEmail}
            onChange={this.onEmailConfigChange}
            icons={{
              checked: null,
              unchecked: null
            }}
          />
        </InlineItems>
        <ModuleBox>
          {this.props.modules.map((module, index) =>
            this.renderModule(module, index)
          )}
        </ModuleBox>
      </React.Fragment>
    );

    return content;
  }
}

export default NotificationSettings;

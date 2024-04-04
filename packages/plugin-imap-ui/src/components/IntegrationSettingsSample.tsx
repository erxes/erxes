import CollapseContent from '@erxes/ui/src/components/CollapseContent';
import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';
import { __ } from '@erxes/ui/src/utils/core';

class Settings extends React.Component<any> {
  render() {
    const { renderItem } = this.props;

    return (
      <div>
        <CollapseContent
          title="IMAP"
          beforeTitle={<Icon icon="envelope-edit" />}
          transparent={true}
        >
          {renderItem('imap_host', '', '', '', 'Host')}
          {renderItem('imap_user', '', '', '', 'User')}
          {renderItem('imap_password', '', '', '', 'Password')}
        </CollapseContent>
      </div>
    );
  }
}

export default Settings;

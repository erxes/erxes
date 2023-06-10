import React from 'react';
import CollapseContent from '@erxes/ui/src/components/CollapseContent';

class Settings extends React.Component<any> {
  render() {
    const { renderItem } = this.props;

    return (
      <CollapseContent title="Discord">
        {renderItem('DISCORD_CLIENT_ID', '', '', '', 'Discord Client Id')}
        {renderItem(
          'DISCORD_CLIENT_SECRET',
          '',
          '',
          '',
          'Discord Client Secret'
        )}
        {renderItem('DISCORD_BOT_TOKEN', '', '', '', 'Discord Bot Token')}
      </CollapseContent>
    );
  }
}

export default Settings;

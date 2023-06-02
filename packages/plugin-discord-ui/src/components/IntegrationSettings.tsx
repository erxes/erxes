import React from 'react';
import CollapseContent from '@erxes/ui/src/components/CollapseContent';

class Settings extends React.Component<any> {
  render() {
    const { renderItem } = this.props;

    return (
      <CollapseContent title="Discord">
        {renderItem('DISCORD_ACCESS_KEY', '', '', '', 'Key')}
        {renderItem('DISCORD_ACCESS_TOKEN', '', '', '', 'Token')}
      </CollapseContent>
    );
  }
}

export default Settings;

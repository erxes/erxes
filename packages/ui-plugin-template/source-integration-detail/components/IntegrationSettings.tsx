import React from 'react';
import CollapseContent from '@erxes/ui/src/components/CollapseContent';

class Settings extends React.Component<any> {
  render() {
    const { renderItem } = this.props;

    return (
      <CollapseContent title="{Name}">
        {renderItem('{NAME}_ACCESS_KEY', '', '', '', 'Key')}
        {renderItem('{NAME}_ACCESS_TOKEN', '', '', '', 'Token')}
      </CollapseContent>
    );
  }
}

export default Settings;

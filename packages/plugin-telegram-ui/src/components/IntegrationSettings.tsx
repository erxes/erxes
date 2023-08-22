import React from 'react';
import CollapseContent from '@erxes/ui/src/components/CollapseContent';

class Settings extends React.Component<any> {
  render() {
    const { renderItem } = this.props;

    return (
      <CollapseContent title="Telegram">
        {renderItem('TELEGRAM_API_ID', '', '', '', 'App  api_id')}
        {renderItem('TELEGRAM_API_HASH', '', '', '', 'App api_hash')}
      </CollapseContent>
    );
  }
}

export default Settings;

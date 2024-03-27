import HeaderDescription from '@erxes/ui/src/components/HeaderDescription';

import React from 'react';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __, router } from 'coreui/utils';
import { Link } from 'react-router-dom';

import { TabTitle, Tabs } from '@erxes/ui/src/components';

type Props = {
  content: any;
  action: any;
  tab: string;
};

type State = {
  currentTab: string;
};

class Integration extends React.Component<Props, State> {
  state = {
    currentTab: this.props.tab
  };

  renderTabs = () => {
    const { currentTab } = this.state;

    return (
      <Tabs full={true} grayBorder={false}>
        <Link to={`/settings/integrations`}>
          <TabTitle className={currentTab === 'integrations' ? 'active' : ''}>
            Integrations
          </TabTitle>
        </Link>
        <Link to={`/settings/integrations-config`}>
          <TabTitle className={currentTab === 'configs' ? 'active' : ''}>
            Configs
          </TabTitle>
        </Link>
      </Tabs>
    );
  };

  actionButtons = () => {
    const { action } = this.props;

    return <>{action}</>;
  };

  render() {
    const { content } = this.props;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Integrations') }
    ];

    const headerDescription = (
      <HeaderDescription
        icon="/images/actions/33.svg"
        title="Integrations"
        description={`${__(
          'Set up your integrations and start connecting with your customers'
        )}`}
      />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('Integrations')} breadcrumb={breadcrumb} />
        }
        actionBar={
          <Wrapper.ActionBar
            left={this.renderTabs()}
            right={this.actionButtons()}
          />
        }
        mainHead={headerDescription}
        content={content}
        transparent={true}
        hasBorder={true}
      />
    );
  }
}

export default Integration;

import { Tabs, TabTitle } from '@erxes/ui/src/components/tabs';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';

import { CONFIG_TYPES } from '../constants';
import { ClientPortalConfig } from '../types';
import Form from './Form';
import Vendors from '../containers/Vendors/List';

type Props = {
  config: ClientPortalConfig;
  history: any;
  handleUpdate: (doc: ClientPortalConfig) => void;
};

class ClientPortalDetail extends React.Component<
  Props,
  { currentTab: string; isVendor: boolean }
> {
  constructor(props) {
    super(props);

    this.state = {
      currentTab: 'general',
      isVendor: props.history.location.pathname.includes('vendor')
    };
  }

  tabOnClick = (currentTab: string) => {
    this.setState({ currentTab });
  };

  renderContent() {
    const { config, handleUpdate } = this.props;
    const { currentTab } = this.state;

    const commonProps = {
      defaultConfigValues: config,
      isVendor: this.state.isVendor,
      handleUpdate
    };

    if (currentTab === 'vendors') {
      return <Vendors queryParams={''} />;
    }

    const TYPE = CONFIG_TYPES[currentTab.toLocaleUpperCase()];

    return <Form {...commonProps} configType={TYPE.VALUE} />;
  }

  render() {
    const { currentTab } = this.state;

    return (
      <>
        <Tabs full={true}>
          {Object.values(CONFIG_TYPES).map((type, index) => (
            <TabTitle
              key={index}
              className={currentTab === type.VALUE ? 'active' : ''}
              onClick={this.tabOnClick.bind(this, type.VALUE)}
            >
              {__(type.LABEL)}
            </TabTitle>
          ))}

          {this.state.isVendor && (
            <TabTitle
              className={currentTab === 'vendors' ? 'active' : ''}
              onClick={this.tabOnClick.bind(this, 'vendors')}
            >
              Vendors
            </TabTitle>
          )}
        </Tabs>
        {this.renderContent()}
      </>
    );
  }
}

export default ClientPortalDetail;

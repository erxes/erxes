import {
  __,
  Button,
  MainStyleTitle as Title,
  Wrapper,
  FlexItem,
  Tabs,
  TabTitle,
  Icon
} from 'erxes-ui';
import React from 'react';
import { ContentBox } from '../styles';
import { IConfigsMap } from '../types';
import Header from './Header';
import Sidebar from './Sidebar';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

type State = {
  currentMap: IConfigsMap;
  currentTab: string;
};

class GeneralSettings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      currentMap: {},
      currentTab: 'product'
    };
  }

  save = e => {
    e.preventDefault();

    const { currentMap } = this.state;
    const { configsMap } = this.props;
    configsMap.POS = currentMap;
    this.props.save(configsMap);
  };

  onChangeConfig = (code: string, value) => {
    const { currentMap } = this.state;

    currentMap[code] = value;

    this.setState({ currentMap });
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  onChangeTab = (currentTab: string) => {
    this.setState({ currentTab });
  };

  render() {
    const { currentTab } = this.state;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('POS config') }
    ];

    const actionButtons = (
      <Button
        btnStyle="primary"
        onClick={this.save}
        icon="check-circle"
        uppercase={false}
      >
        Save
      </Button>
    );

    const content = (
      <FlexItem>
        <Tabs full={true}>
          <TabTitle
            className={currentTab === 'product' ? 'active' : ''}
            onClick={this.onChangeTab.bind(this, 'product')}
          >
            {__('Product & Service')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'general' ? 'active' : ''}
            onClick={this.onChangeTab.bind(this, 'general')}
          >
            {__('General')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'appearance' ? 'active' : ''}
            onClick={this.onChangeTab.bind(this, 'appearance')}
          >
            {__('Appearance')}
          </TabTitle>
        </Tabs>
      </FlexItem>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('POS config')} breadcrumb={breadcrumb} />
        }
        mainHead={<Header />}
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('POS configs')}</Title>}
            right={actionButtons}
          />
        }
        leftSidebar={<Sidebar />}
        content={content}
      />
    );
  }
}

export default GeneralSettings;

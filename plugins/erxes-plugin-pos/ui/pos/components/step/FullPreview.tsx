import { __, Tabs, TabTitle, Icon } from 'erxes-ui';
import React from 'react';
import { DesktopPreview, FlexItem, FullPreview } from '../../../styles';
import { IPos } from '../../../types';
import { IUIOptions } from './Appearance';

type Props = {
  uiOptions: IUIOptions;
  pos: IPos;
};

type State = {
  currentTab: string;
};

class FullPreviewStep extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      currentTab: 'pos'
    };
  }

  onChangeTab = (currentTab: string) => {
    this.setState({ currentTab });
  };

  renderPreview() {
    console.log(this.props.uiOptions);
  }

  renderResolutionPreview() {
    const { currentTab } = this.state;

    if (currentTab === 'pos') {
      return <DesktopPreview>{this.renderPreview()}</DesktopPreview>;
    }

    if (currentTab === 'kiosk') {
      return <DesktopPreview>{this.renderPreview()}</DesktopPreview>;
    }

    if (currentTab === 'kiosk') {
      return <DesktopPreview>{this.renderPreview()}</DesktopPreview>;
    }

    return <DesktopPreview>{this.renderPreview()}</DesktopPreview>;
  }

  render() {
    const { currentTab } = this.state;

    return (
      <FlexItem>
        <FullPreview>
          <Tabs full={true}>
            <TabTitle
              className={currentTab === 'pos' ? 'active' : ''}
              onClick={this.onChangeTab.bind(this, 'pos')}
            >
              <Icon icon="monitor-1" /> {__('POS')}
            </TabTitle>
            <TabTitle
              className={currentTab === 'kiosk' ? 'active' : ''}
              onClick={this.onChangeTab.bind(this, 'kiosk')}
            >
              <Icon icon="monitor-1" /> {__('Kiosk machine')}
            </TabTitle>
            <TabTitle
              className={currentTab === 'waiting' ? 'active' : ''}
              onClick={this.onChangeTab.bind(this, 'waiting')}
            >
              <Icon icon="monitor-1" /> {__('Waiting screen')}
            </TabTitle>

            <TabTitle
              className={currentTab === 'kitchen' ? 'active' : ''}
              onClick={this.onChangeTab.bind(this, 'kitchen')}
            >
              <Icon icon="monitor-1" /> {__('Kitchen screen')}
            </TabTitle>
          </Tabs>
          {this.renderResolutionPreview()}
        </FullPreview>
      </FlexItem>
    );
  }
}

export default FullPreviewStep;

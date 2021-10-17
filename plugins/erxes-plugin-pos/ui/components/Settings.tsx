import {
  __,
  Button,
  MainStyleTitle as Title,
  Wrapper,
  FlexItem,
  Tabs,
  TabTitle,
  CollapseContent,
  FormGroup,
  ControlLabel
} from 'erxes-ui';
import React from 'react';
import { IConfigsMap, IPos } from '../types';
import Header from './Header';
import Sidebar from './Sidebar';
import { ContentBox, Description } from '../styles';
import { PRODUCT_DETAIL } from '../constants';
import Select from 'react-select-plus';
import List from '../containers/ProductGroup/List';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
  queryParams: any;
  history: any;
};

type State = {
  currentTab: string;
  configsMap: IConfigsMap;
  posId: string;
};

class GeneralSettings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { queryParams } = props;

    this.state = {
      configsMap: props.configsMap,
      currentTab: 'product',
      posId: queryParams.posId ? queryParams.posId : ''
    };
  }

  save = e => {
    e.preventDefault();

    const { configsMap, posId } = this.state;

    if (posId.length === 0) {
      alert('Please select a POS first!!!');
      return;
    }

    this.props.save(posId, configsMap);
  };

  onChangeConfig = (code: string, value) => {
    const { configsMap } = this.state;

    configsMap[code] = value;

    this.setState({ configsMap });
  };

  onChangeTab = (currentTab: string) => {
    this.setState({ currentTab });
  };

  onChangeMultiCombo = (code: string, values) => {
    let value = values;

    if (Array.isArray(values)) {
      value = values.map(el => el.value);
    }

    this.onChangeConfig(code, value);
  };

  renderTabContent() {
    const { currentTab, configsMap } = this.state;

    if (currentTab === 'product') {
      return (
        <ContentBox id={'ProductSettingsMenu'}>
          <CollapseContent title="Default settings">
            <FormGroup>
              <ControlLabel>Product Details</ControlLabel>
              <Description>
                Select pos to display in the product card.
              </Description>
              <Select
                options={PRODUCT_DETAIL}
                value={configsMap.PRODUCT_DETAILS}
                onChange={this.onChangeMultiCombo.bind(this, 'PRODUCT_DETAILS')}
                multi={true}
              />
            </FormGroup>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                style={{}}
                btnStyle="success"
                onClick={this.save}
                icon="check-circle"
                uppercase={false}
              >
                Save
              </Button>
            </div>
          </CollapseContent>
          <CollapseContent
            title="Product Groups"
            description="Select pos to display in the product category."
          >
            <List
              queryParams={this.props.queryParams}
              history={this.props.history}
            />
          </CollapseContent>
        </ContentBox>
      );
    }
  }

  render() {
    const { currentTab } = this.state;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('POS config') }
    ];

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

        {this.renderTabContent()}
      </FlexItem>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('POS config')} breadcrumb={breadcrumb} />
        }
        mainHead={<Header />}
        leftSidebar={
          <Sidebar
            history={this.props.history}
            queryParams={this.props.queryParams}
          />
        }
        content={content}
      />
    );
  }
}

export default GeneralSettings;

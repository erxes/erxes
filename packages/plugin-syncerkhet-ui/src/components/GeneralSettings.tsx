import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components';
import { MainStyleTitle as Title } from '@erxes/ui/src/styles/eindex';
import { __ } from '@erxes/ui/src/utils';
import { Wrapper } from '@erxes/ui/src/layout';
import React from 'react';
import { KEY_LABELS } from '../constants';
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
};

class GeneralSettings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      currentMap: props.configsMap.ERKHET || {}
    };
  }

  save = e => {
    e.preventDefault();

    const { currentMap } = this.state;
    const { configsMap } = this.props;
    configsMap.ERKHET = currentMap;
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

  renderItem = (key: string, description?: string) => {
    const { currentMap } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{KEY_LABELS[key]}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          defaultValue={currentMap[key]}
          onChange={this.onChangeInput.bind(this, key)}
        />
      </FormGroup>
    );
  };

  render() {
    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Ebarimt config') }
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
      <ContentBox id={'GeneralSettingsMenu'}>
        <CollapseContent title="General settings">
          {this.renderItem('apiKey')}
          {this.renderItem('apiSecret')}
          {this.renderItem('apiToken')}
          {this.renderItem(
            'getRemainderApiUrl',
            'Get remainder from erkhet api url'
          )}
        </CollapseContent>
        <CollapseContent title="Product to erkhet">
          {this.renderItem('costAccount', 'Cost Account fullCode on erkhet')}
          {this.renderItem('saleAccount', 'Sale Account fullCode on erkhet')}
          {this.renderItem(
            'productCategoryCode',
            'Default Category Code on erkhet inventory'
          )}
          {this.renderItem(
            'consumeDescription',
            'Set description when incoming erkhet inventory'
          )}
        </CollapseContent>
        <CollapseContent title="Customer to erkhet">
          {this.renderItem('checkCompanyUrl')}
          {this.renderItem(
            'customerDefaultName',
            'Customer default name on erkhet'
          )}
          {this.renderItem(
            'customerCategoryCode',
            'Customer default category code on erkhet'
          )}
          {this.renderItem(
            'companyCategoryCode',
            'Company default category code on erkhet'
          )}
        </CollapseContent>
      </ContentBox>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Ebarimt config')}
            breadcrumb={breadcrumb}
          />
        }
        mainHead={<Header />}
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('Ebarimt configs')}</Title>}
            right={actionButtons}
            wideSpacing
          />
        }
        leftSidebar={<Sidebar />}
        content={content}
        transparent={true}
        hasBorder
      />
    );
  }
}

export default GeneralSettings;

import {
  __, Button, ControlLabel, FormGroup, HeaderDescription,
  FormControl,
  MainStyleTitle as Title, Wrapper
} from 'erxes-ui';
import React from 'react';
import { SettingsContent } from '../styles';
import { IConfigsMap } from '../types';
// import Select from 'react-select-plus';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

type State = {
  configsMap: IConfigsMap;
};

class GeneralSettings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      configsMap: props.configsMap,
    };
  }

  save = e => {
    e.preventDefault();

    const { configsMap } = this.state;

    this.props.save(configsMap);
  };

  onChangeConfig = (code: string, e) => {
    const { configsMap } = this.state;
    console.log(e.target.value, code);
    configsMap[code] = e.target.value;
    this.setState({ configsMap });
  };

  renderItem = (key: string, title: string, description?: string) => {
    const { configsMap } = this.state;
    let value = configsMap[key] || "";

    if (key === "pushNotification" && !value) {
      value = 'https://localhost:3000/pushNotif';
      configsMap[key] = value;
    }

    if (key === "inStoreSPUrl" && !value) {
      value = 'https://instore.golomtbank.com';
      configsMap[key] = value;
    }

    return (
      <FormGroup>
        <ControlLabel>{title}</ControlLabel>
        <FormControl
          defaultValue={value}
          onChange={this.onChangeConfig.bind(this, key)}
          value={value}
        />

      </FormGroup>
    );
  };

  render() {

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('SocialPay') }
    ];

    const header = (
      <HeaderDescription
        icon="/images/actions/25.svg"
        title="SocialPay"
        description="SocialPay"
      />
    );

    const actionButtons = (
      <>
        <Button
          btnStyle="primary"
          onClick={this.save}
          icon="check-circle"
          uppercase={false}
        >
          Save
        </Button>
      </>
    );

    const content = (
      <SettingsContent title={__('General settings')}>

        {this.renderItem("inStoreSPTerminal", "Terminal")}
        {this.renderItem("inStoreSPKey", "Key")}
        {this.renderItem("inStoreSPUrl", "InStore SocialPay url")}
        {this.renderItem("pushNotification", "Push notification url with /pushNotif")}

      </SettingsContent>
    );

    return (
      <Wrapper
        header={
          < Wrapper.Header
            title={__('SocialPay config')}
            breadcrumb={breadcrumb}
          />
        }
        mainHead={header}
        actionBar={
          < Wrapper.ActionBar
            left={< Title > {__('SocialPay API configs')}</Title >}
            right={actionButtons}
          />
        }
        content={content}
        center={true}
      />
    );
  }
}

export default GeneralSettings;

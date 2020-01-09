import Button from 'modules/common/components/Button';
import { FormControl } from 'modules/common/components/form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import CURRENCIES from 'modules/common/constants/currencies';
import { __ } from 'modules/common/utils';
import ActionBar from 'modules/layout/components/ActionBar';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { Link } from 'react-router-dom';
import Select from 'react-select-plus';
import { ContentBox } from '../../styles';
import { LANGUAGES, MEASUREMENTS } from '../constants';
import { IConfigsMap } from '../types';

type Props = {
  currentLanguage: string;
  changeLanguage: (language: string) => void;
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

type State = {
  configsMap: IConfigsMap,
  language: string;
};

class List extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      configsMap: props.configsMap,
      language: props.currentLanguage,
    };
  }

  save = e => {
    e.preventDefault();

    const { configsMap, language } = this.state;

    this.props.save(configsMap);

    this.props.changeLanguage(language);
  };

  onChangeConfig = (code: string, value) => {
    const { configsMap } = this.state;

    configsMap[code] = value;

    this.setState({ configsMap });
  };

  onChangeMultiCombo = (code: string, values) => {
    this.onChangeConfig(code, values.map(el => el.value));
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  onLanguageChange = language => {
    this.setState({ language: language.value });
  };

  render() {
    const { configsMap } = this.state;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('General') }
    ];

    const actionFooter = (
      <ActionBar
        right={
          <Button.Group>
            <Link to="/settings/">
              <Button size="small" btnStyle="simple" icon="cancel-1">
                Cancel
              </Button>
            </Link>

            <Button
              size="small"
              btnStyle="success"
              onClick={this.save}
              icon="checked-1"
            >
              Save
            </Button>
          </Button.Group>
        }
      />
    );

    const content = (
      <ContentBox>
        <FormGroup>
          <ControlLabel>Language</ControlLabel>
          <Select
            options={LANGUAGES}
            value={this.state.language}
            onChange={this.onLanguageChange}
            searchable={false}
            clearable={false}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Currency</ControlLabel>
          <Select
            options={CURRENCIES}
            value={configsMap.dealCurrency}
            onChange={this.onChangeMultiCombo.bind(this, 'dealCurrency')}
            multi={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Unit of measurement</ControlLabel>
          <Select
            options={MEASUREMENTS}
            value={configsMap.dealUOM}
            onChange={this.onChangeMultiCombo.bind(this, 'dealUOM')}
            multi={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>UPLOAD_FILE_TYPES</ControlLabel>

          <FormControl
            defaultValue={configsMap.uploadFileTypes}
            onChange={this.onChangeInput.bind(this, 'uploadFileTypes')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>WIDGETS_UPLOAD_FILE_TYPES</ControlLabel>

          <FormControl
            defaultValue={configsMap.widgetsUploadFileTypes}
            onChange={this.onChangeInput.bind(this, 'widgetsUploadFileTypes')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>AWS_ACCESS_KEY_ID</ControlLabel>

          <FormControl
            defaultValue={configsMap.awsAccessKeyId}
            onChange={this.onChangeInput.bind(this, 'awsAccessKeyId')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>AWS_SECRET_ACCESS_KEY</ControlLabel>

          <FormControl
            defaultValue={configsMap.awsSecretAccessKey}
            onChange={this.onChangeInput.bind(this, 'awsSecretAccessKey')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>AWS_BUCKET</ControlLabel>

          <FormControl
            defaultValue={configsMap.awsBucket}
            onChange={this.onChangeInput.bind(this, 'awsBucket')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>AWS_PREFIX</ControlLabel>

          <FormControl
            defaultValue={configsMap.awsPrefix}
            onChange={this.onChangeInput.bind(this, 'awsPrefix')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>AWS_COMPATIBLE_SERVICE_ENDPOINT</ControlLabel>

          <FormControl
            defaultValue={configsMap.awsCompatibleServiceEndPoint}
            onChange={this.onChangeInput.bind(this, 'awsCompatibleServiceEndPoint')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>AWS_FORCE_PATH_STYLE</ControlLabel>

          <FormControl
            defaultValue={configsMap.awsForcePathStyle}
            onChange={this.onChangeInput.bind(this, 'awsForcePathStyle')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>UPLOAD_SERVICE_TYPE</ControlLabel>

          <FormControl
            defaultValue={configsMap.uploadServiceType}
            onChange={this.onChangeInput.bind(this, 'uploadServiceType')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>FILE_SYSTEM_PUBLIC</ControlLabel>

          <FormControl
            defaultValue={configsMap.fileSystemPublic}
            onChange={this.onChangeInput.bind(this, 'fileSystemPublic')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>AWS_SES_ACCESS_KEY_ID</ControlLabel>

          <FormControl
            defaultValue={configsMap.awsSesAccessKeyId}
            onChange={this.onChangeInput.bind(this, 'awsSesAccessKeyId')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>AWS_SES_SECRET_ACCESS_KEY</ControlLabel>

          <FormControl
            defaultValue={configsMap.awsSesSecretAccessKey}
            onChange={this.onChangeInput.bind(this, 'awsSesSecretAccessKey')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>AWS_REGION</ControlLabel>

          <FormControl
            defaultValue={configsMap.awsRegion}
            onChange={this.onChangeInput.bind(this, 'awsRegion')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>AWS_SES_CONFIG_SET</ControlLabel>

          <FormControl
            defaultValue={configsMap.awsSesConfigSet}
            onChange={this.onChangeInput.bind(this, 'awsSesConfigSet')}
          />
        </FormGroup>

      </ContentBox>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('General')} breadcrumb={breadcrumb} />
        }
        actionBar={
          <Wrapper.ActionBar
            left={
              <HeaderDescription
                icon="/images/actions/25.svg"
                title="General"
                description="Set up your initial account settings so that things run smoothly in unison."
              />
            }
          />
        }
        content={content}
        footer={actionFooter}
        center={true}
      />
    );
  }
}

export default List;

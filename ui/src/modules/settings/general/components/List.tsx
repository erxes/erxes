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
            defaultValue={configsMap.UPLOAD_FILE_TYPES}
            onChange={this.onChangeInput.bind(this, 'UPLOAD_FILE_TYPES')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>WIDGETS_UPLOAD_FILE_TYPES</ControlLabel>

          <FormControl
            defaultValue={configsMap.WIDGETS_UPLOAD_FILE_TYPES}
            onChange={this.onChangeInput.bind(this, 'WIDGETS_UPLOAD_FILE_TYPES')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>AWS_ACCESS_KEY_ID</ControlLabel>

          <FormControl
            defaultValue={configsMap.AWS_ACCESS_KEY_ID}
            onChange={this.onChangeInput.bind(this, 'AWS_ACCESS_KEY_ID')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>AWS_SECRET_ACCESS_KEY</ControlLabel>

          <FormControl
            defaultValue={configsMap.AWS_SECRET_ACCESS_KEY}
            onChange={this.onChangeInput.bind(this, 'AWS_SECRET_ACCESS_KEY')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>AWS_BUCKET</ControlLabel>

          <FormControl
            defaultValue={configsMap.AWS_BUCKET}
            onChange={this.onChangeInput.bind(this, 'AWS_BUCKET')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>AWS_PREFIX</ControlLabel>

          <FormControl
            defaultValue={configsMap.AWS_PREFIX}
            onChange={this.onChangeInput.bind(this, 'AWS_PREFIX')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>AWS_COMPATIBLE_SERVICE_ENDPOINT</ControlLabel>

          <FormControl
            defaultValue={configsMap.AWS_COMPATIBLE_SERVICE_ENDPOINT}
            onChange={this.onChangeInput.bind(this, 'AWS_COMPATIBLE_SERVICE_ENDPOINT')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>AWS_FORCE_PATH_STYLE</ControlLabel>

          <FormControl
            defaultValue={configsMap.AWS_FORCE_PATH_STYLE}
            onChange={this.onChangeInput.bind(this, 'AWS_FORCE_PATH_STYLE')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>UPLOAD_SERVICE_TYPE</ControlLabel>

          <FormControl
            defaultValue={configsMap.UPLOAD_SERVICE_TYPE}
            onChange={this.onChangeInput.bind(this, 'UPLOAD_SERVICE_TYPE')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>FILE_SYSTEM_PUBLIC</ControlLabel>

          <FormControl
            defaultValue={configsMap.FILE_SYSTEM_PUBLIC}
            onChange={this.onChangeInput.bind(this, 'FILE_SYSTEM_PUBLIC')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>AWS_SES_ACCESS_KEY_ID</ControlLabel>

          <FormControl
            defaultValue={configsMap.AWS_SES_ACCESS_KEY_ID}
            onChange={this.onChangeInput.bind(this, 'AWS_SES_ACCESS_KEY_ID')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>AWS_SES_SECRET_ACCESS_KEY</ControlLabel>

          <FormControl
            defaultValue={configsMap.AWS_SES_SECRET_ACCESS_KEY}
            onChange={this.onChangeInput.bind(this, 'AWS_SES_SECRET_ACCESS_KEY')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>AWS_REGION</ControlLabel>

          <FormControl
            defaultValue={configsMap.AWS_REGION}
            onChange={this.onChangeInput.bind(this, 'AWS_REGION')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>AWS_SES_CONFIG_SET</ControlLabel>

          <FormControl
            defaultValue={configsMap.AWS_SES_CONFIG_SET}
            onChange={this.onChangeInput.bind(this, 'AWS_SES_CONFIG_SET')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>MAIL_SERVICE</ControlLabel>

          <FormControl
            defaultValue={configsMap.MAIL_SERVICE}
            onChange={this.onChangeInput.bind(this, 'MAIL_SERVICE')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>MAIL_PORT</ControlLabel>

          <FormControl
            defaultValue={configsMap.MAIL_PORT}
            onChange={this.onChangeInput.bind(this, 'MAIL_PORT')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>MAIL_USER</ControlLabel>

          <FormControl
            defaultValue={configsMap.MAIL_USER}
            onChange={this.onChangeInput.bind(this, 'MAIL_USER')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>MAIL_PASS</ControlLabel>

          <FormControl
            defaultValue={configsMap.MAIL_PASS}
            onChange={this.onChangeInput.bind(this, 'MAIL_PASS')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>MAIL_HOST</ControlLabel>

          <FormControl
            defaultValue={configsMap.MAIL_HOST}
            onChange={this.onChangeInput.bind(this, 'MAIL_HOST')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>COMPANY_EMAIL_FROM</ControlLabel>

          <FormControl
            defaultValue={configsMap.COMPANY_EMAIL_FROM}
            onChange={this.onChangeInput.bind(this, 'COMPANY_EMAIL_FROM')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>DEFAULT_EMAIL_SERVICE</ControlLabel>

          <FormControl
            defaultValue={configsMap.DEFAULT_EMAIL_SERVICE}
            onChange={this.onChangeInput.bind(this, 'DEFAULT_EMAIL_SERVICE')}
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

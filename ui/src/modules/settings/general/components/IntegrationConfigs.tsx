import Button from 'modules/common/components/Button';
import { FormControl } from 'modules/common/components/form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import { __ } from 'modules/common/utils';
import ActionBar from 'modules/layout/components/ActionBar';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { Link } from 'react-router-dom';
import { ContentBox } from '../../styles';
import { IConfigsMap } from '../types';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

type State = {
  configsMap: IConfigsMap,
};

class IntegrationConfigs extends React.Component<Props, State> {
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

  onChangeConfig = (code: string, value) => {
    const { configsMap } = this.state;

    configsMap[code] = value;

    this.setState({ configsMap });
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  render() {
    const { configsMap } = this.state;

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
          <ControlLabel>FACEBOOK_APP_ID</ControlLabel>

          <FormControl
            defaultValue={configsMap.FACEBOOK_APP_ID}
            onChange={this.onChangeInput.bind(this, 'FACEBOOK_APP_ID')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>FACEBOOK_APP_SECRET</ControlLabel>

          <FormControl
            defaultValue={configsMap.FACEBOOK_APP_SECRET}
            onChange={this.onChangeInput.bind(this, 'FACEBOOK_APP_SECRET')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>FACEBOOK_VERIFY_TOKEN</ControlLabel>

          <FormControl
            defaultValue={configsMap.FACEBOOK_VERIFY_TOKEN}
            onChange={this.onChangeInput.bind(this, 'FACEBOOK_VERIFY_TOKEN')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>TWITTER_CONSUMER_KEY</ControlLabel>

          <FormControl
            defaultValue={configsMap.TWITTER_CONSUMER_KEY}
            onChange={this.onChangeInput.bind(this, 'TWITTER_CONSUMER_KEY')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>TWITTER_ACCESS_TOKEN</ControlLabel>

          <FormControl
            defaultValue={configsMap.TWITTER_ACCESS_TOKEN}
            onChange={this.onChangeInput.bind(this, 'TWITTER_ACCESS_TOKEN')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>TWITTER_ACCESS_TOKEN_SECRET</ControlLabel>

          <FormControl
            defaultValue={configsMap.TWITTER_ACCESS_TOKEN_SECRET}
            onChange={this.onChangeInput.bind(this, 'TWITTER_ACCESS_TOKEN_SECRET')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>TWITTER_WEBHOOK_ENV</ControlLabel>

          <FormControl
            defaultValue={configsMap.TWITTER_WEBHOOK_ENV}
            onChange={this.onChangeInput.bind(this, 'TWITTER_WEBHOOK_ENV')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>NYLAS_CLIENT_ID</ControlLabel>

          <FormControl
            defaultValue={configsMap.NYLAS_CLIENT_ID}
            onChange={this.onChangeInput.bind(this, 'NYLAS_CLIENT_ID')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>NYLAS_CLIENT_SECRET</ControlLabel>

          <FormControl
            defaultValue={configsMap.NYLAS_CLIENT_SECRET}
            onChange={this.onChangeInput.bind(this, 'NYLAS_CLIENT_SECRET')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>NYLAS_WEBHOOK_CALLBACK_URL</ControlLabel>

          <FormControl
            defaultValue={configsMap.NYLAS_WEBHOOK_CALLBACK_URL}
            onChange={this.onChangeInput.bind(this, 'NYLAS_WEBHOOK_CALLBACK_URL')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>MICROSOFT_CLIENT_ID</ControlLabel>

          <FormControl
            defaultValue={configsMap.MICROSOFT_CLIENT_ID}
            onChange={this.onChangeInput.bind(this, 'MICROSOFT_CLIENT_ID')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>MICROSOFT_CLIENT_SECRET</ControlLabel>

          <FormControl
            defaultValue={configsMap.MICROSOFT_CLIENT_SECRET}
            onChange={this.onChangeInput.bind(this, 'MICROSOFT_CLIENT_SECRET')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>ENCRYPTION_KEY: Must be 256 bits (32 characters)</ControlLabel>

          <FormControl
            defaultValue={configsMap.ENCRYPTION_KEY}
            onChange={this.onChangeInput.bind(this, 'ENCRYPTION_KEY')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>USE_NATIVE_GMAIL</ControlLabel>

          <FormControl
            defaultValue={configsMap.USE_NATIVE_GMAIL}
            onChange={this.onChangeInput.bind(this, 'USE_NATIVE_GMAIL')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>GOOGLE_PROJECT_ID</ControlLabel>

          <FormControl
            defaultValue={configsMap.GOOGLE_PROJECT_ID}
            onChange={this.onChangeInput.bind(this, 'GOOGLE_PROJECT_ID')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>GOOGLE_GMAIL_TOPIC</ControlLabel>

          <FormControl
            defaultValue={configsMap.GOOGLE_GMAIL_TOPIC}
            onChange={this.onChangeInput.bind(this, 'GOOGLE_GMAIL_TOPIC')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>GOOGLE_APPLICATION_CREDENTIALS</ControlLabel>

          <FormControl
            defaultValue={configsMap.GOOGLE_APPLICATION_CREDENTIALS}
            onChange={this.onChangeInput.bind(this, 'GOOGLE_APPLICATION_CREDENTIALS')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>GOOGLE_GMAIL_SUBSCRIPTION_NAME</ControlLabel>

          <FormControl
            defaultValue={configsMap.GOOGLE_GMAIL_SUBSCRIPTION_NAME}
            onChange={this.onChangeInput.bind(this, 'GOOGLE_GMAIL_SUBSCRIPTION_NAME')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>GOOGLE_CLIENT_ID</ControlLabel>

          <FormControl
            defaultValue={configsMap.GOOGLE_CLIENT_ID}
            onChange={this.onChangeInput.bind(this, 'GOOGLE_CLIENT_ID')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>GOOGLE_CLIENT_SECRET</ControlLabel>

          <FormControl
            defaultValue={configsMap.GOOGLE_CLIENT_SECRET}
            onChange={this.onChangeInput.bind(this, 'GOOGLE_CLIENT_SECRET')}
          />
        </FormGroup>

      </ContentBox>
    );

    return (
      <Wrapper
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

export default IntegrationConfigs;
import { Button, FormControl, Step, Steps } from 'modules/common/components';
import {
  Preview,
  StepWrapper,
  TitleContainer
} from 'modules/common/components/step/styles';
import { Alert } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import { IBrand, IIntegration } from 'modules/settings/brands/types';
import { IUser } from 'modules/settings/channels/types';
import { MessengerPreview, Row } from 'modules/settings/integrations/styles';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Appearance, Availability, Intro, Options } from './steps';
import CommonPreview from './widgetPreview/CommonPreview';

type Props = {
  teamMembers: IUser[],
  integration?: IIntegration,
  brands: IBrand[],
  save: (params: { name: string, brandId: string, languageCode: string, messengerData: any, uiOptions: any }) => void
};

type State = {
  title: string,
  brandId: string,
  languageCode: string,
  activeStep: number,
  color: string,
  wallpaper: string,
  welcomeMessage: string,
  awayMessage: string,
  thankYouMessage: string,
  notifyCustomer: boolean,
  supporterIds: string[],
  availabilityMethod: string,
  isOnline: boolean,
  timezone: string,
  onlineHours: any,
  logo: string,
  logoPreviewStyle: any,
  logoPreviewUrl: string
};

CreateMessenger.contextTypes = {
  __: PropTypes.func
};

class CreateMessenger extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const integration = props.integration;
    const configData = integration && (integration.messengerData);
    const uiOptions = integration && (integration.uiOptions);

    this.state = {
      title: integration.name,
      brandId: integration.brandId,
      languageCode: integration.languageCode,
      activeStep: 1,
      color: uiOptions.color || '#6569DF',
      wallpaper: uiOptions.wallpaper || '1',
      welcomeMessage: configData.welcomeMessage,
      awayMessage: configData.awayMessage,
      thankYouMessage: configData.thankYouMessage,
      notifyCustomer: configData.notifyCustomer || false,
      supporterIds: configData.supporterIds || [],
      availabilityMethod: configData.availabilityMethod || 'manual',
      isOnline: configData.isOnline || false,
      timezone: configData.timezone || '',
      onlineHours: (configData.onlineHours || []).map(h => ({
        _id: Math.random(),
        ...h
      })),
      logo: uiOptions.logo,
      logoPreviewStyle: {},
      logoPreviewUrl: uiOptions.logo || '/images/erxes.png'
    };

    this.onChange = this.onChange.bind(this);
    this.save = this.save.bind(this);
  }

  onChange(key, value) {
    this.setState({ [key]: value });
  }

  save(e) {
    e.preventDefault();

    const { __ } = this.context;
    const { title, brandId } = this.state;

    if (!title) {
      return Alert.error(__('Write title'));
    }

    if (!brandId) {
      return Alert.error(__('Choose brand'));
    }

    this.props.save({
      name: title,
      brandId,
      languageCode: this.state.languageCode,
      messengerData: {
        notifyCustomer: this.state.notifyCustomer,
        availabilityMethod: this.state.availabilityMethod,
        isOnline: this.state.isOnline,
        timezone: this.state.timezone,
        onlineHours: this.state.onlineHours,
        welcomeMessage: this.state.welcomeMessage,
        awayMessage: this.state.awayMessage,
        thankYouMessage: this.state.thankYouMessage,
        supporterIds: this.state.supporterIds
      },
      uiOptions: {
        color: this.state.color,
        wallpaper: this.state.wallpaper,
        logo: this.state.logo
      }
    });
  }

  renderButtons() {
    const cancelButton = (
      <Link to="/settings/integrations">
        <Button btnStyle="simple" size="small" icon="cancel-1">
          Cancel
        </Button>
      </Link>
    );

    return (
      <Button.Group>
        {cancelButton}
        <Button
          btnStyle="success"
          size="small"
          icon="checked-1"
          onClick={this.save}
        >
          Save
        </Button>
      </Button.Group>
    );
  }

  render() {
    const {
      activeStep,
      title,
      supporterIds,
      welcomeMessage,
      awayMessage,
      thankYouMessage,
      isOnline,
      availabilityMethod,
      onlineHours,
      timezone,
      color,
      logoPreviewUrl,
      wallpaper,
      brandId,
      languageCode,
      notifyCustomer,
      logoPreviewStyle
    } = this.state;

    const { __ } = this.context;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings/integrations' },
      { title: __('Integrations') },
      { title: __('Messenger') }
    ];

    return (
      <StepWrapper>
        <Wrapper.Header breadcrumb={breadcrumb} />

        <TitleContainer>
          <div>{__('Title')}</div>
          <FormControl
            required
            onChange={e => this.onChange('title', e.target.value)}
            defaultValue={title}
          />
        </TitleContainer>

        <Row>
          <Steps active={activeStep}>
            <Step img="/images/icons/erxes-16.svg" title="Intro">
              <Intro
                teamMembers={this.props.teamMembers}
                onChange={this.onChange}
                supporterIds={supporterIds}
                welcomeMessage={welcomeMessage}
                awayMessage={awayMessage}
                thankYouMessage={thankYouMessage}
              />
            </Step>

            <Step img="/images/icons/erxes-03.svg" title="Hours & Availability">
              <Availability
                onChange={this.onChange}
                isOnline={isOnline}
                availabilityMethod={availabilityMethod}
                timezone={timezone}
                onlineHours={onlineHours}
              />
            </Step>

            <Step img="/images/icons/erxes-04.svg" title="Appearance">
              <Appearance
                onChange={this.onChange}
                color={color}
                logoPreviewUrl={logoPreviewUrl}
                wallpaper={wallpaper}
              />
            </Step>

            <Step
              img="/images/icons/erxes-06.svg"
              title="Options"
              nextButton={this.renderButtons()}
            >
              <Options
                onChange={this.onChange}
                brands={this.props.brands}
                brandId={brandId}
                languageCode={languageCode}
                notifyCustomer={notifyCustomer}
              />
            </Step>
          </Steps>

          <MessengerPreview>
            <Preview fullHeight>
              <CommonPreview
                onChange={this.onChange}
                teamMembers={this.props.teamMembers}
                welcomeMessage={welcomeMessage}
                awayMessage={awayMessage}
                supporterIds={supporterIds}
                isOnline={isOnline}
                wallpaper={wallpaper}
                color={color}
                logoPreviewStyle={logoPreviewStyle}
                logoPreviewUrl={logoPreviewUrl}
              />
            </Preview>
          </MessengerPreview>
        </Row>
      </StepWrapper>
    );
  }
}

export default CreateMessenger;

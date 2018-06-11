import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { Alert } from 'modules/common/utils';
import { Step, Steps, FormControl, Button } from 'modules/common/components';
import {
  StepWrapper,
  TitleContainer
} from 'modules/common/components/step/styles';
import { Intro, Availability, Appearance } from './messenger';

class CreateMessenger extends Component {
  constructor(props) {
    super(props);

    const integration = props.integration || {};
    const configData = integration && (integration.messengerData || {});
    const uiOptions = integration && (integration.uiOptions || {});

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
      brandId: brandId,
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
        logo: this.state.logoPreviewUrl
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
    const { activeStep, title } = this.state;
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

        <Steps active={activeStep}>
          <Step img="/images/icons/erxes-16.svg" title="Intro">
            <Intro onChange={this.onChange} {...this.state} />
          </Step>

          <Step img="/images/icons/erxes-04.svg" title="Hours & Availability">
            <Availability
              {...this.state}
              onChange={this.onChange}
              teamMembers={this.props.teamMembers}
            />
          </Step>

          <Step
            img="/images/icons/erxes-06.svg"
            title="Appearance"
            nextButton={this.renderButtons()}
          >
            <Appearance
              {...this.state}
              onChange={this.onChange}
              brands={this.props.brands}
            />
          </Step>
        </Steps>
      </StepWrapper>
    );
  }
}

CreateMessenger.propTypes = {
  teamMembers: PropTypes.array.isRequired,
  integration: PropTypes.object,
  brands: PropTypes.array.isRequired,
  save: PropTypes.func.isRequired
};

CreateMessenger.contextTypes = {
  __: PropTypes.func
};

export default CreateMessenger;

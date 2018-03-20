import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { Button, Icon, FormControl } from 'modules/common/components';
import _ from 'lodash';
import {
  ChooseType,
  Steps,
  Step,
  CallOut,
  SuccessStep,
  OptionStep,
  FullPreviewStep
} from './step';
import { FormStep } from '../containers';
import { StepWrapper, TitleContainer } from '../styles';

const propTypes = {
  integrations: PropTypes.array,
  brands: PropTypes.array,
  forms: PropTypes.array,
  loading: PropTypes.bool,
  contentTypeId: PropTypes.string
};

class Form extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeStep: 1,
      maxStep: 5,
      kind: 'shoutbox',
      preview: 'desktop',
      title: 'Contact',
      bodyValue: 'Body description here',
      thankContent: 'Thank you.',
      successAction: 'onPage',
      btnText: 'Send',
      fields: [],
      color: '#04A9F5',
      theme: '',
      logoPreviewUrl: '',
      validate: {
        step1: false,
        step2: true,
        step3: true
      }
    };

    this.next = this.next.bind(this);
    this.changeState = this.changeState.bind(this);
    this.renderSaveButton = this.renderSaveButton.bind(this);
  }

  renderNextButton() {
    return (
      <Button btnStyle="primary" size="small" onClick={() => this.next(0)}>
        Next <Icon icon="ios-arrow-forward" />
      </Button>
    );
  }

  renderSaveButton() {
    const cancelButton = (
      <Link to="/engage">
        <Button btnStyle="simple" size="small" icon="close">
          Cancel
        </Button>
      </Link>
    );

    if (!_.isEmpty()) {
      return (
        <Button.Group>
          {cancelButton}
          <Button
            btnStyle="primary"
            size="small"
            icon="checkmark"
            onClick={e => this.save('save', e)}
          >
            Save
          </Button>
        </Button.Group>
      );
    }
    return (
      <Button.Group>
        {cancelButton}
        <Button
          btnStyle="success"
          size="small"
          icon="checkmark"
          onClick={e => this.save('live', e)}
        >
          Save
        </Button>
      </Button.Group>
    );
  }

  next(stepNumber) {
    const { activeStep, maxStep } = this.state;

    if (stepNumber === 0) {
      if (activeStep <= maxStep) {
        this.setState({ activeStep: activeStep + 1 });
      }
    } else {
      this.setState({ activeStep: stepNumber });
    }
  }

  changeState(key, value) {
    this.setState({ [key]: value });
  }

  render() {
    const {
      activeStep,
      title,
      kind,
      btnText,
      bodyValue,
      color,
      theme,
      options,
      logoPreviewUrl,
      thankContent,
      fields,
      preview,
      successAction
    } = this.state;
    const integrations = this.props.integrations || [];
    const { __ } = this.context;

    const breadcrumb = [{ title: __('Forms'), link: '/forms' }];

    return (
      <StepWrapper>
        <Wrapper.Header breadcrumb={breadcrumb} />
        <TitleContainer>
          <div>Title</div>
          <FormControl
            required
            onChange={e => this.changeState('title', e.target.value)}
            defaultValue={this.state.title}
          />
        </TitleContainer>
        <Steps active={activeStep}>
          <Step
            img="/images/icons/erxes-05.svg"
            title="Type"
            next={this.next}
            nextButton={this.renderNextButton()}
          >
            <ChooseType changeState={this.changeState} kind={kind} />
          </Step>
          <Step
            img="/images/icons/erxes-02.svg"
            title="CallOut"
            next={this.next}
            nextButton={this.renderNextButton()}
          >
            <CallOut
              changeState={this.changeState}
              kind={kind}
              title={title}
              btnText={btnText}
              bodyValue={bodyValue}
              color={color}
              theme={theme}
              image={logoPreviewUrl}
            />
          </Step>
          <Step
            img="/images/icons/erxes-08.svg"
            title="Form"
            next={this.next}
            nextButton={this.renderNextButton()}
          >
            <FormStep
              changeState={this.changeState}
              title={title}
              btnText={btnText}
              bodyValue={bodyValue}
              kind={kind}
              color={color}
              theme={theme}
              options={options}
              image={logoPreviewUrl}
              contentTypeId={this.props.contentTypeId}
            />
          </Step>
          <Step
            img="/images/icons/erxes-08.svg"
            title="Options"
            next={this.next}
            nextButton={this.renderNextButton()}
          >
            <OptionStep
              changeState={this.changeState}
              title={title}
              btnText={btnText}
              bodyValue={bodyValue}
              kind={kind}
              color={color}
              theme={theme}
              options={options}
              image={logoPreviewUrl}
              brands={this.props.brands}
              fields={fields}
            />
          </Step>
          <Step
            img="/images/icons/erxes-08.svg"
            title="Thank content"
            next={this.next}
            nextButton={this.renderNextButton()}
          >
            {integrations.map(integration => (
              <SuccessStep
                key={integration._id}
                changeState={this.changeState}
                thankContent={thankContent}
                kind={kind}
                color={color}
                theme={theme}
                successAction={successAction}
                formData={integration.formData}
              />
            ))}
          </Step>
          <Step
            img="/images/icons/erxes-08.svg"
            title="Full Preview"
            next={this.next}
            nextButton={this.renderSaveButton()}
          >
            <FullPreviewStep
              changeState={this.changeState}
              title={title}
              btnText={btnText}
              bodyValue={bodyValue}
              kind={kind}
              color={color}
              theme={theme}
              image={logoPreviewUrl}
              fields={fields}
              preview={preview}
            />
          </Step>
        </Steps>
      </StepWrapper>
    );
  }
}

Form.propTypes = propTypes;
Form.contextTypes = {
  __: PropTypes.func
};

export default Form;

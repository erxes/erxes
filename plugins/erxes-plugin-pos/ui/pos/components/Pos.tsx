import {
  ControlWrapper,
  Indicator,
  StepWrapper
} from 'erxes-ui/lib/components/step/styles';
import {
  Step,
  Steps,
  Button,
  Alert,
  __,
  Wrapper,
  ButtonMutate
} from 'erxes-ui';
import React from 'react';
import { Link } from 'react-router-dom';
import { IIntegration, IPosConfig } from '../../types';
import { LeftContent, Content, PreviewWrapper } from '../../styles';
import OptionsStep from './step/OptionsStep';
import ConfigStep from './step/ConfigStep';

type Props = {
  integration?: IIntegration;
  config?: IPosConfig;
  loading?: boolean;
  isActionLoading: boolean;
  isReadyToSaveForm: boolean;
  afterFormDbSave: (formId: string) => void;
  save: (params: { name: string; brandId: string; config: any }) => void;
};

type State = {
  brand?: string;
  title?: string;
  config?: IPosConfig;
  carousel: string;
  currentMode: 'create' | 'update' | undefined;
};

class Lead extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const integration = props.integration || ({} as IIntegration);

    this.state = {
      brand: integration.brandId,
      title: integration.name || 'POS name',
      carousel: 'pos',
      currentMode: undefined,
      config: props.config
    };
  }

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { brand, title } = this.state;

    if (!title) {
      return Alert.error('Enter a Pos name');
    }

    if (!brand) {
      return Alert.error('Choose a Brand');
    }

    const doc = {};

    this.props.save(doc);
  };

  onChange = (key: string, value: any) => {
    this.setState({ [key]: value } as any);
  };

  onFormDocChange = formData => {
    this.setState({ formData });
  };

  onStepClick = currentStepNumber => {
    const { isSkip } = this.state;

    let carousel = 'form';
    switch (currentStepNumber) {
      case 1:
        carousel = isSkip ? 'form' : 'callout';
        break;
      case 2:
        carousel = isSkip ? 'form' : 'callout';
        break;
      case 7:
        carousel = 'success';
        break;
    }
    return this.setState({ carousel });
  };

  renderButtons = () => {
    const { isActionLoading } = this.props;

    const SmallLoader = ButtonMutate.SmallLoader;

    const cancelButton = (
      <Link to="/forms">
        <Button btnStyle="simple" icon="times-circle">
          Cancel
        </Button>
      </Link>
    );

    return (
      <Button.Group>
        {cancelButton}

        <Button
          disabled={isActionLoading}
          btnStyle="success"
          icon={isActionLoading ? undefined : 'check-circle'}
          onClick={this.handleSubmit}
        >
          {isActionLoading && <SmallLoader />}
          Save
        </Button>
      </Button.Group>
    );
  };

  render() {
    const { title, config, carousel, currentMode } = this.state;

    const { integration } = this.props;
    const leadData = integration && integration.leadData;
    const brand = integration && integration.brand;
    const breadcrumb = [{ title: __('pos'), link: '/pos' }];

    return (
      <StepWrapper>
        <Wrapper.Header title={__('Pos')} breadcrumb={breadcrumb} />
        <Content>
          <LeftContent>
            <Steps>
              <Step
                img="/images/icons/erxes-04.svg"
                title={`Options`}
                onClick={this.onStepClick}
              >
                <OptionsStep
                  onChange={this.onChange}
                  name={integration ? integration.name || '' : ''}
                  description={''}
                  brand={brand}
                />
              </Step>

              <Step
                img="/images/icons/erxes-04.svg"
                title={`Product & Service`}
                onClick={this.onStepClick}
              >
                <ConfigStep
                  onChange={this.onChange}
                  config={config}
                />
              </Step>
              <Step
                img="/images/icons/erxes-03.svg"
                title="General"
                onClick={this.onStepClick}
              >
                {/* <CallOut
                  onChange={this.onChange}
                  type={type}
                  calloutTitle={calloutTitle}
                  calloutBtnText={calloutBtnText}
                  calloutImgSize={calloutImgSize}
                  bodyValue={bodyValue}
                  color={color}
                  theme={theme}
                  image={logo}
                  skip={isSkip}
                /> */}
              </Step>
              <Step
                img="/images/icons/erxes-12.svg"
                title={'Appearance'}
                onClick={this.onStepClick}
                noButton={true}
              >
                {/* <FormStep
                  type={type}
                  color={color}
                  theme={theme}
                  formId={integration && integration.formId}
                  formData={formData}
                  afterDbSave={this.props.afterFormDbSave}
                  onDocChange={this.onFormDocChange}
                  onInit={this.onFormInit}
                  isReadyToSaveForm={this.props.isReadyToSaveForm}
                  currentMode={this.state.currentMode}
                  currentField={this.state.currentField}
                /> */}
              </Step>
            </Steps>
            <ControlWrapper>
              <Indicator>
                {__('You are')} {integration ? 'editing' : 'creating'}{' '}
                <strong>{title}</strong> {__('pos')}
              </Indicator>
              {this.renderButtons()}
            </ControlWrapper>
          </LeftContent>

          <PreviewWrapper>
            {/* <FullPreview
              onChange={this.onChange}
              onDocChange={this.onFormDocChange}
              calloutTitle={calloutTitle}
              calloutBtnText={calloutBtnText}
              bodyValue={bodyValue}
              type={type}
              color={color}
              theme={theme}
              image={logo}
              thankTitle={thankTitle}
              thankContent={thankContent}
              skip={isSkip}
              carousel={carousel}
              formData={formData}
              calloutImgSize={calloutImgSize}
            /> */}
          </PreviewWrapper>
        </Content>
      </StepWrapper>
    );
  }
}

export default Lead;

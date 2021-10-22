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
import { IIntegration, IPos, IProductGroup } from '../../types';
import { LeftContent, Content, PreviewWrapper } from '../../styles';
import ConfigStep from './step/ConfigStep';
import GeneralStep from './step/GeneralStep';

type Props = {
  integration?: IIntegration;
  pos?: IPos;
  loading?: boolean;
  isActionLoading: boolean;
  isReadyToSaveForm: boolean;
  groups: IProductGroup[];
  formIntegrations: IIntegration[];
  save: (params: any) => void;
};

type State = {
  brand?: string;
  name?: string;
  description?: string;
  pos?: IPos;
  groups: IProductGroup[];
  carousel: string;
  currentMode: 'create' | 'update' | undefined;
};

class Lead extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const integration = props.integration || ({} as IIntegration);
    const pos = props.pos || ({} as IPos);

    this.state = {
      brand: integration.brandId,
      pos,
      carousel: 'pos',
      currentMode: undefined,
      config: props.config,
      groups: props.groups || []
    };
  }

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { brand, pos, groups } = this.state;

    if (!pos.name) {
      return Alert.error('Enter a Pos name');
    }

    if (!brand) {
      return Alert.error('Choose a Brand');
    }

    const doc = {
      name: pos.name,
      brandId: brand,
      description: pos.description,
      productDetails: pos.productDetails || [],
      groups,
      adminIds: pos.adminIds,
      cashierIds: pos.cashierIds,
      kioskMachine: pos.kioskMachine,
      waitingScreen: pos.waitingScreen,
      kitchenScreen: pos.kitchenScreen,
      formSectionTitle: pos.formSectionTitle,
      formIntegrationIds: pos.formIntegrationIds
    };

    this.props.save(doc);
  };

  onChange = (key: string, value: any) => {
    this.setState({ [key]: value } as any);

    console.log(this.state);
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
    const { pos, groups, carousel, currentMode } = this.state;
 
    const { integration, formIntegrations } = this.props;
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
                title={`General`}
                onClick={this.onStepClick}
              >
                <GeneralStep
                  onChange={this.onChange}
                  pos={pos}
                  brand={brand}
                  formIntegrations={formIntegrations}
                />
              </Step>
              <Step
                img="/images/icons/erxes-04.svg"
                title={`Product & Service`}
                onClick={this.onStepClick}
              >
                <ConfigStep
                  onChange={this.onChange}
                  pos={pos}
                  groups={groups}
                />
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
                <strong>{name}</strong> {__('pos')}
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

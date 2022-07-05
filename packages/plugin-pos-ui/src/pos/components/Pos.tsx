import Appearance, { IUIOptions } from './step/Appearance';
import ConfigStep from './step/ConfigStep';
import EbarimtConfig from './step/EbarimtConfig';
import ErkhetConfig from './step/ErkhetConfig';
import DeliveryConfig from './step/DeliveryConfig';
import GeneralStep from './step/GeneralStep';
import React from 'react';
import {
  __,
  Alert,
  Button,
  ButtonMutate,
  Step,
  Steps,
  Wrapper
} from '@erxes/ui/src';
import { Content, LeftContent } from '../../styles';
import {
  ControlWrapper,
  Indicator,
  StepWrapper
} from '@erxes/ui/src/components/step/styles';
import { IPos, IProductGroup } from '../../types';
import { IProductCategory } from '@erxes/ui-products/src/types';
import { Link } from 'react-router-dom';
import { FieldsCombinedByType } from '@erxes/ui-settings/src/properties/types';

type Props = {
  pos?: IPos;
  loading?: boolean;
  isActionLoading: boolean;
  groups: IProductGroup[];
  save: (params: any) => void;
  productCategories: IProductCategory[];
  branches: any[];
};

type State = {
  name?: string;
  description?: string;
  pos?: IPos;
  groups: IProductGroup[];
  currentMode?: 'create' | 'update' | undefined;
  logoPreviewStyle?: any;
  logoPreviewUrl?: string;
  uiOptions: IUIOptions;
  carousel: string;
  formData?: any;
  isSkip: boolean;
  ebarimtConfig: any;
  erkhetConfig: any;
  deliveryConfig: any;
};

class Pos extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const pos = props.pos || ({} as IPos);

    const uiOptions = pos.uiOptions || {
      colors: {
        bodyColor: '#FFFFFF',
        headerColor: '#6569DF',
        footerColor: '#3CCC38'
      },
      logo: '/images/erxes.png',
      bgImage: '',
      favIcon: '/images/erxes.png',
      receiptIcon: '/images/erxes.png'
    };

    this.state = {
      pos,
      carousel: 'pos',
      groups: props.groups || [],
      uiOptions,
      isSkip: false,
      ebarimtConfig: pos.ebarimtConfig,
      erkhetConfig: pos.erkhetConfig,
      deliveryConfig: pos.deliveryConfig
    };
  }

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const {
      pos,
      groups,
      uiOptions,
      ebarimtConfig,
      erkhetConfig,
      deliveryConfig
    } = this.state;

    if (!pos.name) {
      return Alert.error('Enter POS name');
    }

    if (!pos.adminIds || !pos.adminIds.length) {
      return Alert.error('Choose admin users');
    }

    if (!pos.cashierIds || !pos.cashierIds.length) {
      return Alert.error('Choose cashier users');
    }

    const cleanMappings = (pos.catProdMappings || []).map(m => ({
      _id: m._id,
      categoryId: m.categoryId,
      productId: m.productId
    }));

    const cleanGroups = (pos.posSlotMappings || []).map(m => ({
      _id: m._id,
      code: m.code,
      name: m.name
    }));

    let doc: any = {
      name: pos.name,
      description: pos.description,
      productDetails: pos.productDetails || [],
      groups,
      adminIds: pos.adminIds,
      cashierIds: pos.cashierIds,
      kioskMachine: pos.kioskMachine,
      uiOptions,
      ebarimtConfig,
      erkhetConfig,
      catProdMappings: cleanMappings,
      posSlotMappings: cleanGroups,
      isOnline: pos.isOnline,
      waitingScreen: pos.waitingScreen,
      kitchenScreen: pos.kitchenScreen,
      branchId: pos.branchId,
      allowBranchIds: pos.allowBranchIds,
      beginNumber: pos.beginNumber,
      maxSkipNumber: Number(pos.maxSkipNumber) || 0,
      initialCategoryIds: pos.initialCategoryIds || [],
      kioskExcludeProductIds: pos.kioskExcludeProductIds || [],
      deliveryConfig
    };

    if (pos.isOnline) {
      doc = {
        ...doc,
        branchId: ''
      };
    } else {
      doc = {
        ...doc,
        beginNumber: '',
        allowBranchIds: ''
      };
    }

    this.props.save(doc);
  };

  onChange = (key: string, value: any) => {
    this.setState({ [key]: value } as any);
  };

  onChangeAppearance = (key: string, value: any) => {
    let uiOptions = this.state.uiOptions || {};
    const { pos } = this.state || {};
    uiOptions[key] = value;

    if (uiOptions[key]) {
      uiOptions[key] = value;
    } else {
      uiOptions = { [key]: value };
    }

    if (pos.uiOptions) {
      pos.uiOptions = uiOptions;
    }

    this.setState({ pos });
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
      default:
        break;
    }

    return this.setState({ carousel });
  };

  renderButtons = () => {
    const { isActionLoading } = this.props;

    const SmallLoader = ButtonMutate.SmallLoader;

    const cancelButton = (
      <Link to={`/pos`}>
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
    const { pos, groups, currentMode, uiOptions } = this.state;
    const { productCategories, branches } = this.props;
    const breadcrumb = [{ title: 'POS List', link: `/pos` }, { title: 'POS' }];

    const name = pos.name || '';
    const logoPreviewUrl = uiOptions.logo;

    return (
      <StepWrapper>
        <Wrapper.Header title={__('Pos')} breadcrumb={breadcrumb} />
        <Content>
          <LeftContent>
            <Steps>
              <Step
                img="/images/icons/erxes-12.svg"
                title={`General`}
                onClick={this.onStepClick}
              >
                <GeneralStep
                  onChange={this.onChange}
                  pos={pos}
                  currentMode={currentMode}
                  branches={branches}
                  productCategories={productCategories}
                  groups={groups}
                  posSlotMappings={pos.posSlotMappings}
                />
              </Step>
              <Step
                img="/images/icons/erxes-10.svg"
                title={`Product & Service`}
                onClick={this.onStepClick}
              >
                <ConfigStep
                  onChange={this.onChange}
                  pos={pos}
                  groups={groups}
                  catProdMappings={pos.catProdMappings}
                  productCategories={productCategories}
                />
              </Step>
              <Step
                img="/images/icons/erxes-04.svg"
                title={'Appearance'}
                onClick={this.onStepClick}
                noButton={true}
              >
                <Appearance
                  onChange={this.onChange}
                  uiOptions={uiOptions}
                  logoPreviewUrl={logoPreviewUrl}
                />
              </Step>
              <Step
                img="/images/icons/erxes-05.svg"
                title={'ebarimt Config'}
                onClick={this.onStepClick}
                noButton={true}
              >
                <EbarimtConfig onChange={this.onChange} pos={pos} />
              </Step>
              <Step
                img="/images/icons/erxes-07.svg"
                title={'erkhet Config'}
                onClick={this.onStepClick}
                noButton={true}
              >
                <ErkhetConfig onChange={this.onChange} pos={pos} />
              </Step>
              <Step
                img="/images/icons/erxes-09.svg"
                title={'Delivery Config'}
                onClick={this.onStepClick}
                noButton={true}
              >
                <DeliveryConfig onChange={this.onChange} pos={pos} />
              </Step>
            </Steps>
            <ControlWrapper>
              <Indicator>
                {__('You are')} {pos ? 'editing' : 'creating'}{' '}
                <strong>{name}</strong> {__('pos')}
              </Indicator>
              {this.renderButtons()}
            </ControlWrapper>
          </LeftContent>
        </Content>
      </StepWrapper>
    );
  } // end render()
}

export default Pos;

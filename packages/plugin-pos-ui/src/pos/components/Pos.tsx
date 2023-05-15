import {
  Alert,
  Button,
  ButtonMutate,
  Step,
  Steps,
  Wrapper,
  __
} from '@erxes/ui/src';
import Appearance, { IUIOptions } from './step/Appearance';
import { Content, LeftContent } from '../../styles';
import {
  ControlWrapper,
  Indicator,
  StepWrapper
} from '@erxes/ui/src/components/step/styles';
import { IPos, IProductGroup, ISlot } from '../../types';

import CardsConfig from './step/CardsConfig';
import ConfigStep from './step/ConfigStep';
import DeliveryConfig from './step/DeliveryConfig';
import EbarimtConfig from './step/EbarimtConfig';
import ErkhetConfig from './step/ErkhetConfig';
import GeneralStep from './step/GeneralStep';
import { IProductCategory } from '@erxes/ui-products/src/types';
import { Link } from 'react-router-dom';
import React from 'react';
import PermissionStep from './step/Permission';
import PaymentsStep from './step/PaymentsStep';
import { ALLOW_TYPES } from '../../constants';

type Props = {
  pos?: IPos;
  loading?: boolean;
  isActionLoading: boolean;
  groups: IProductGroup[];
  save: (params: any) => void;
  slots: ISlot[];
  envs: any;
};

type State = {
  name?: string;
  description?: string;
  pos: IPos;
  slots: ISlot[];
  groups: IProductGroup[];
  logoPreviewStyle?: any;
  logoPreviewUrl?: string;
  uiOptions: IUIOptions;
  carousel: string;
  formData?: any;
  isSkip: boolean;
  ebarimtConfig: any;
  erkhetConfig: any;
  deliveryConfig: any;
  cardsConfig: any;
  checkRemainder: boolean;
  allowTypes: string[];
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
      logo: '',
      bgImage: '',
      favIcon: '',
      receiptIcon: '',
      kioskHeaderImage: '',
      mobileAppImage: '',
      qrCodeImage: ''
    };

    this.state = {
      pos,
      carousel: 'pos',
      groups: props.groups || [],
      uiOptions,
      isSkip: false,
      ebarimtConfig: pos.ebarimtConfig,
      erkhetConfig: pos.erkhetConfig,
      deliveryConfig: pos.deliveryConfig,
      cardsConfig: pos.cardsConfig,
      slots: props.slots || [],
      checkRemainder: pos.checkRemainder || false,
      allowTypes: pos.allowTypes || ALLOW_TYPES.map(at => at.value)
    };
  }

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const {
      pos = {} as IPos,
      slots,
      groups,
      uiOptions,
      checkRemainder,
      ebarimtConfig,
      erkhetConfig,
      deliveryConfig,
      cardsConfig,
      allowTypes
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

    const saveTypes = allowTypes.filter(at => at);
    if (!saveTypes.length) {
      return Alert.error('Toggle at least one type');
    }

    const cleanMappings = (pos.catProdMappings || []).map(m => ({
      _id: m._id,
      categoryId: m.categoryId,
      productId: m.productId,
      code: m.code || '',
      name: m.name || ''
    }));

    const cleanSlot = (slots || []).map(m => ({
      _id: m._id,
      code: m.code,
      name: m.name,
      posId: m.posId
    }));

    let doc: any = {
      name: pos.name,
      description: pos.description,
      pdomain: pos.pdomain,
      erxesAppToken: pos.erxesAppToken,
      productDetails: pos.productDetails || [],
      groups,
      adminIds: pos.adminIds,
      cashierIds: pos.cashierIds,
      paymentIds: pos.paymentIds || [],
      paymentTypes: pos.paymentTypes || [],
      kioskMachine: pos.kioskMachine,
      uiOptions,
      ebarimtConfig,
      erkhetConfig,
      catProdMappings: cleanMappings,
      posSlots: cleanSlot,
      isOnline: pos.isOnline,
      onServer: pos.onServer,
      waitingScreen: pos.waitingScreen,
      kitchenScreen: pos.kitchenScreen,
      branchId: pos.branchId,
      departmentId: pos.departmentId,
      allowBranchIds: pos.allowBranchIds,
      beginNumber: pos.beginNumber,
      maxSkipNumber: Number(pos.maxSkipNumber) || 0,
      initialCategoryIds: pos.initialCategoryIds || [],
      kioskExcludeCategoryIds: pos.kioskExcludeCategoryIds || [],
      kioskExcludeProductIds: pos.kioskExcludeProductIds || [],
      deliveryConfig,
      cardsConfig,
      checkRemainder,
      permissionConfig: pos.permissionConfig || {},
      allowTypes: saveTypes
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
    const { pos = {} as IPos } = this.state || {};
    uiOptions[key] = value;

    if (uiOptions[key]) {
      uiOptions[key] = value;
    } else {
      uiOptions = { [key]: value } as IUIOptions;
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
    const {
      pos,
      slots,
      groups,
      uiOptions,
      checkRemainder,
      allowTypes
    } = this.state;
    const { envs } = this.props;
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
                  posSlots={slots}
                  allowTypes={allowTypes}
                  envs={envs}
                />
              </Step>
              <Step
                img="/images/icons/erxes-12.svg"
                title={`Payments`}
                onClick={this.onStepClick}
              >
                <PaymentsStep
                  onChange={this.onChange}
                  pos={pos}
                  posSlots={slots}
                  envs={envs}
                />
              </Step>
              <Step
                img="/images/icons/erxes-02.svg"
                title={`Permission`}
                onClick={this.onStepClick}
              >
                <PermissionStep
                  onChange={this.onChange}
                  pos={pos}
                  envs={envs}
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
                  catProdMappings={pos.catProdMappings || []}
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
                title={'finance Config'}
                onClick={this.onStepClick}
                noButton={true}
              >
                <ErkhetConfig
                  onChange={this.onChange}
                  pos={pos}
                  checkRemainder={checkRemainder}
                />
              </Step>
              <Step
                img="/images/icons/erxes-09.svg"
                title={'Delivery Config'}
                onClick={this.onStepClick}
                noButton={true}
              >
                <DeliveryConfig onChange={this.onChange} pos={pos} />
              </Step>
              <Step
                img="/images/icons/erxes-07.svg"
                title={'Sync Cards'}
                onClick={this.onStepClick}
                noButton={true}
              >
                <CardsConfig onChange={this.onChange} pos={pos} />
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

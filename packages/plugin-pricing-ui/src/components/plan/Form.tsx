import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// erxes
import Button from '@erxes/ui/src/components/Button';
import Step from '@erxes/ui/src/components/step/Step';
import Steps from '@erxes/ui/src/components/step/Steps';
import { Alert, __ } from '@erxes/ui/src/utils';
import {
  StepWrapper,
  ControlWrapper,
  Indicator
} from '@erxes/ui/src/components/step/styles';
// local
import GeneralStep from './step/General';
import OptionsStep from './step/Options';
import PriceStep from './step/Price';
import QuantityStep from './step/Quantity';
import RepeatStep from './step/Repeat';
import ExpiryStep from './step/Expiry';
import { PricingPlan } from '../../types';

type Props = {
  submit: (data: any) => void;
  data: any;
};

export default function Form(props: Props) {
  const { submit, data = {} } = props;

  // Hooks
  const [formValues, setFormValues] = useState<PricingPlan>({
    // General
    name: data.name || '',
    status: data.status || 'active', // "active", "archive", "draft", "completed"
    type: data.type || 'fixed', // "fixed", "subtraction", "percentage", "bonus"
    value: data.value || 0,
    priceAdjustType: data.priceAdjustType || 'none',
    priceAdjustFactor: data.priceAdjustFactor || 0,
    bonusProduct: data.bonusProduct || null,
    isPriority: data.isPriority || false,

    applyType: data.applyType || 'category', // "product", "category", "bundle"
    products: data.products || [],
    productsExcluded: data.productsExcluded || [],
    productsBundle: data.productsBundle || [],
    categories: data.categories || [],
    categoriesExcluded: data.categoriesExcluded || [],
    segments: data.segments || [],

    isStartDateEnabled: data.isStartDateEnabled || false,
    isEndDateEnabled: data.isEndDateEnabled || false,
    startDate: data.startDate || null,
    endDate: data.endData || null,

    // Options
    departmentIds: data.departmentIds || [],
    branchIds: data.branchIds || [],
    boardId: data.boardId || null,
    pipelineId: data.pipelineId || null,
    stageId: data.stageId || null,

    // Rules
    isQuantityEnabled: data.isQuantityEnabled || false,
    quantityRules: data.quantityRules || [],

    isPriceEnabled: data.isPriceEnabled || false,
    priceRules: data.priceRules || [],

    isExpiryEnabled: data.isExpiryEnabled || false,
    expiryRules: data.expiryRules || [],

    isRepeatEnabled: data.isRepeatEnabled || false,
    repeatRules: data.repeatRules || []
  });

  useEffect(() => data.name && setFormValues(data), [data]);

  // Functions
  const handleState = (key: string, value: any) => {
    const tempState = { ...formValues };
    tempState[key] = value;

    setFormValues(tempState);
  };

  const handleSubmit = () => {
    const document: any = { ...formValues };

    if (!document.name) return Alert.error(__('Enter plan name'));

    if (document.priceRules.length === 0) document.isPriceEnabled = false;

    if (document.quantityRules.length === 0) document.isQuantityEnabled = false;

    if (document.expiryRules.length === 0) document.isExpiryEnabled = false;

    if (document.repeatRules.length === 0) document.isRepeatEnabled = false;

    if (document.__typename) delete document.__typename;

    if (document.priceRules)
      document.priceRules.map(
        (item: any) => item.__typename && delete item.__typename
      );

    if (document.quantityRules)
      document.quantityRules.map(
        (item: any) => item.__typename && delete item.__typename
      );

    if (document.expiryRules)
      document.expiryRules.map(
        (item: any) => item.__typename && delete item.__typename
      );

    if (document.repeatRules)
      document.repeatRules.map((item: any) => {
        item.__typename && delete item.__typename;

        if (item.weekValue)
          item.weekValue.map((v: any) => v.__typename && delete v.__typename);

        if (item.monthValue)
          item.monthValue.map((v: any) => v.__typename && delete v.__typename);
      });

    submit(document);
  };

  const renderButtons = () => {
    const cancelButton = (
      <Link to="/pricing/plans">
        <Button btnStyle="simple" icon="times-circle">
          Cancel
        </Button>
      </Link>
    );

    return (
      <Button.Group>
        {cancelButton}
        <Button btnStyle="success" icon="check-circle" onClick={handleSubmit}>
          Save
        </Button>
      </Button.Group>
    );
  };

  return (
    <StepWrapper>
      <Steps>
        <Step img="/images/icons/erxes-12.svg" title="General">
          <GeneralStep formValues={formValues} handleState={handleState} />
        </Step>
        <Step img="/images/icons/erxes-03.svg" title="Options">
          <OptionsStep formValues={formValues} handleState={handleState} />
        </Step>
        <Step img="/images/icons/erxes-06.svg" title="Price">
          <PriceStep formValues={formValues} handleState={handleState} />
        </Step>
        <Step img="/images/icons/erxes-24.svg" title="Quantity">
          <QuantityStep formValues={formValues} handleState={handleState} />
        </Step>
        <Step img="/images/icons/erxes-21.svg" title="Repeat">
          <RepeatStep formValues={formValues} handleState={handleState} />
        </Step>
        <Step img="/images/icons/erxes-14.svg" title="Expiry">
          <ExpiryStep formValues={formValues} handleState={handleState} />
        </Step>
      </Steps>
      <ControlWrapper>
        <Indicator>
          {__('You are ') + (data._id ? __('editing') : __('creating'))}{' '}
          <strong>{__('Plan')}</strong>
        </Indicator>
        {renderButtons()}
      </ControlWrapper>
    </StepWrapper>
  );
}

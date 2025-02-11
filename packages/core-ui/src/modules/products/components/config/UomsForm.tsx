import {
  Button,
  FormControl,
  Form,
  FormGroup,
  ControlLabel,
} from '@erxes/ui/src/components';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useState } from 'react';
import { IUom } from '../../types';
import Select from 'react-select';
import { Box } from '@erxes/ui/src/components/step/style';
import { FlexRow } from '@erxes/ui/src/components/filterableList/styles';
import { DaySelector } from './DaySelector';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  uom?: IUom;
  closeModal?: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  afterSave?: () => void;
  modal?: boolean;
  extended?: boolean;
};

const SUBSCRIPTION_PERIOD = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

const TIMELY_PERIOD = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Seasonally', value: 'seasonally' },
];

const BrandForm = (props: Props) => {
  const { uom, closeModal, renderButton, afterSave } = props;
  const object = uom || ({} as IUom);
  const [subsConfig, setSubsConfig] = useState({
    isForSubscription: uom?.isForSubscription,
    ...(uom?.subscriptionConfig || {}),
  } as any);
  const [timelyConfig, setTimelyConfig] = useState({
    haveTimely: !!uom?.timely,
    timely: uom?.timely,
  } as any);
  const renderFooter = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    if (uom) {
      values._id = uom._id;
    }

    const { isForSubscription, ...subscriptionConfig } = subsConfig;

    const updatedValues = {
      ...values,
      isForSubscription,
      subscriptionConfig,
      timely: timelyConfig?.timely || undefined,
    };

    return (
      <ModalFooter>
        <Button
          btnStyle='simple'
          type='button'
          icon='times-circle'
          onClick={closeModal}
        >
          Cancel
        </Button>

        {renderButton({
          name: 'uom',
          values: updatedValues,
          isSubmitted,
          callback: closeModal || afterSave,
          object: uom,
        })}
      </ModalFooter>
    );
  };

  const handleSubsConfigChange = (name, value) => {
    setSubsConfig({ ...subsConfig, [name]: value });
  };

  const renderSubsConfig = (formProps: IFormProps) => {
    if (!subsConfig?.isForSubscription) {
      return null;
    }

    return (
      <>
        <FormGroup>
          <ControlLabel required>{'Subscription Period'}</ControlLabel>
          <Select
            {...formProps}
            placeholder={'Select a period'}
            options={SUBSCRIPTION_PERIOD as any}
            value={
              SUBSCRIPTION_PERIOD.find(
                ({ value }) => subsConfig?.period === value
              ) as any
            }
            onChange={({ value }) =>
              setSubsConfig({
                isForSubscription: subsConfig.isForSubscription,
                period: value,
              })
            }
          />
        </FormGroup>
        {subsConfig.period && (
          <FormGroup>
            <ControlLabel required>{'Subscription Rule'}</ControlLabel>
            <FlexRow>
              {[
                { value: 'startPaidDate', label: 'Start From Paid Date' },
                { value: 'fromExpiredDate', label: 'Start from Expired Date' },
                {
                  value: 'fromSpecificDate',
                  label: 'Start from Specific Date',
                },
              ].map(({ value, label }) => (
                <Box
                  key={value}
                  selected={subsConfig.rule === value}
                  onClick={() => handleSubsConfigChange('rule', value)}
                  glowBorderSelected={true}
                >
                  <span>{label}</span>
                </Box>
              ))}
            </FlexRow>
          </FormGroup>
        )}
        {subsConfig.rule === 'fromSpecificDate' && (
          <FormGroup>
            <ControlLabel required>{'Select Date'}</ControlLabel>
            {subsConfig?.period === 'monthly' && (
              <p>{`If you select the 31st day, if there is a month with 28,29 or 30 days, it will be the last day of month`}</p>
            )}
            <DaySelector
              type={subsConfig?.period}
              onSelect={value => handleSubsConfigChange('specificDay', value)}
              selectedValue={subsConfig?.specificDay}
            />
          </FormGroup>
        )}

        <FormGroup>
          <FormControl
            componentclass='checkbox'
            checked={subsConfig.subsRenewable}
            onChange={() =>
              handleSubsConfigChange('subsRenewable', !subsConfig.subsRenewable)
            }
          />
          <ControlLabel>
            {__('Is able Subscription renew before close')}
          </ControlLabel>
        </FormGroup>
      </>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>

          <FormControl
            {...formProps}
            name='name'
            defaultValue={object.name}
            required={true}
            autoFocus={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Code</ControlLabel>

          <FormControl
            {...formProps}
            name='code'
            defaultValue={object.code}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <FormControl
            {...formProps}
            name='isForSubscription'
            componentclass='checkbox'
            checked={subsConfig?.isForSubscription}
            onChange={() =>
              handleSubsConfigChange(
                'isForSubscription',
                !subsConfig.isForSubscription
              )
            }
          />

          <ControlLabel>{'Uom for subscription'}</ControlLabel>
        </FormGroup>

        {renderSubsConfig(formProps)}
        <FormGroup>
          <FormControl
            {...formProps}
            name='isForSubscription'
            componentclass='checkbox'
            checked={timelyConfig?.haveTimely}
            onChange={() =>
              setTimelyConfig(prev => ({
                ...prev,
                haveTimely: !timelyConfig?.haveTimely,
              }))
            }
          />

          <ControlLabel>{'Uom for timely'}</ControlLabel>
        </FormGroup>
        {timelyConfig?.haveTimely && (
          <FormGroup>
            <ControlLabel required>{'Timely Period'}</ControlLabel>
            <Select
              {...formProps}
              placeholder={'Select a period'}
              options={TIMELY_PERIOD as any}
              value={
                TIMELY_PERIOD.find(
                  ({ value }) => timelyConfig?.timely === value
                ) as any
              }
              onChange={({ value }) =>
                setTimelyConfig(prev => ({
                  ...prev,
                  timely: value,
                }))
              }
            />
          </FormGroup>
        )}

        {renderFooter({ ...formProps })}
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default BrandForm;

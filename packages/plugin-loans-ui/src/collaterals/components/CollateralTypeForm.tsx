import React, { useMemo, useState } from 'react';
import {
  ICollateralProperty,
  ICollateralTypeConfig,
  ICollateralTypeDocument
} from '../types';
import Form from '@erxes/ui/src/components/form/Form';
import {
  FormColumn,
  ModalFooter,
  ScrollWrapper
} from '@erxes/ui/src/styles/main';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Button from '@erxes/ui/src/components/Button';
import { IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/core';
import { TabTitle, Tabs } from '@erxes/ui/src/components/tabs';
import { CenterContent } from '@erxes/ui/src';

interface IProps {
  data?: ICollateralTypeDocument;
  renderButton: any;
  closeModal: any;
}

function CollateralTypeForm({ data, renderButton, closeModal }: IProps) {
  const [collateralType, setCollateralType] = useState<
    ICollateralTypeDocument | undefined
  >(data);

  const [collateralTypeConfig, setCollateralTypeConfig] = useState<
    ICollateralTypeConfig | undefined
  >(data?.config);

  const [collateralTypeProperty, setCollateralTypeProperty] = useState<
    ICollateralProperty | undefined
  >(data?.property);

  const [tabName, setTabName] = useState<'main' | 'config' | 'property'>(
    'main'
  );

  function renderFormGroup(
    formProps: IFormProps,
    {
      label,
      componentProps,
      value,
      ...props
    }: {
      label: string;
      name: string;
      componentclass: string;
      onChange: any;
      componentProps?: any;
      value: any;
    }
  ) {
    if (props.componentclass === 'checkbox')
      return (
        <FormGroup>
          <FormControl
            {...formProps}
            {...props}
            {...componentProps}
            checked={value?.[props.name]}
          />
          <ControlLabel>{label}</ControlLabel>
        </FormGroup>
      );
    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <FormControl
          {...formProps}
          {...props}
          {...componentProps}
          value={value?.[props.name]}
        />
      </FormGroup>
    );
  }

  const renderMainForm = (formProps: IFormProps) => {
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCollateralType((v: any) => ({
        ...(v ?? {}),
        [e.target.name]: e.target.value
      }));
    };

    const renderForm = (props) => {
      return renderFormGroup(formProps, {
        ...props,
        onChange,
        value: collateralType
      });
    };

    return (
      <ScrollWrapper>
        <FormColumn>
          {renderForm({ label: 'Code', name: 'code', componentclass: 'input' })}
          {renderForm({ label: 'Name', name: 'name', componentclass: 'input' })}
          {renderForm({
            label: 'Description',
            name: 'description',
            componentclass: 'textarea'
          })}
          {renderForm({
            label: 'Type',
            name: 'type',
            componentclass: 'select',
            componentProps: {
              options: ['car', 'realState', 'savings', 'other'].map((v) => ({
                value: v,
                label: v
              }))
            }
          })}
          {renderForm({
            label: 'Status',
            name: 'status',
            componentclass: 'input'
          })}
          {renderForm({
            label: 'Currency',
            name: 'currency',
            componentclass: 'input'
          })}
        </FormColumn>
      </ScrollWrapper>
    );
  };

  const renderConfigForm = (formProps: IFormProps) => {
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCollateralTypeConfig((v: any) => ({
        ...(v ?? {}),
        [e.target.name]: e.target.value
      }));
    };

    const renderForm = (props) => {
      return renderFormGroup(formProps, {
        ...props,
        onChange,
        value: collateralTypeConfig
      });
    };

    return (
      <ScrollWrapper>
        <FormColumn>
          {renderForm({
            label: 'minPercent',
            name: 'minPercent',
            type: 'number',
            max: 100,
            useNumberFormat: true
          })}
          {renderForm({
            label: 'maxPercent',
            name: 'maxPercent',
            type: 'number',
            max: 100,
            useNumberFormat: true
          })}
          {renderForm({
            label: 'defaultPercent',
            name: 'defaultPercent',
            type: 'number',
            max: 100,
            useNumberFormat: true
          })}

          {renderForm({
            label: 'riskClosePercent',
            name: 'riskClosePercent',
            type: 'number',
            max: 100,
            useNumberFormat: true
          })}
          {renderForm({
            label: 'collateralType',
            name: 'collateralType',
            componentclass: 'input'
          })}
        </FormColumn>
      </ScrollWrapper>
    );
  };

  const renderPropertyForm = (formProps: IFormProps) => {
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCollateralTypeProperty((v: any) => ({
        ...(v ?? {}),
        [e.target.name]: e.target.checked
      }));
    };

    const renderForm = (props) => {
      return renderFormGroup(formProps, {
        ...props,
        onChange,
        componentclass: 'checkbox',
        value: collateralTypeProperty
      });
    };

    return (
      <ScrollWrapper>
        <FormColumn>
          {renderForm({
            label: 'sizeSquare',
            name: 'sizeSquare'
          })}
          {renderForm({
            label: 'sizeSquareUnit',
            name: 'sizeSquareUnit'
          })}
          {renderForm({
            label: 'cntRoom',
            name: 'cntRoom'
          })}
          {renderForm({
            label: 'startDate',
            name: 'startDate'
          })}
          {renderForm({
            label: 'endDate',
            name: 'endDate'
          })}
          {renderForm({
            label: 'purpose',
            name: 'purpose'
          })}
          {renderForm({
            label: 'mark',
            name: 'mark'
          })}
          {renderForm({
            label: 'color',
            name: 'color'
          })}
          {renderForm({
            label: 'power',
            name: 'power'
          })}
          {renderForm({
            label: 'frameNumber',
            name: 'frameNumber'
          })}
          {renderForm({
            label: 'importedDate',
            name: 'importedDate'
          })}
          {renderForm({
            label: 'factoryDate',
            name: 'factoryDate'
          })}
          {renderForm({
            label: 'courtOrderDate',
            name: 'courtOrderDate'
          })}
        </FormColumn>
      </ScrollWrapper>
    );
  };

  const saveData = useMemo(() => {
    const mainData = collateralType || { _id: undefined };
    return {
      id: mainData?._id,
      ...mainData,
      config: collateralTypeConfig,
      property: collateralTypeProperty
    };
  }, [collateralType, collateralTypeConfig, collateralTypeProperty]);

  const renderContent = (formProps: IFormProps) => {
    const { isSubmitted } = formProps;
    const renderForm = () => {
      if (tabName == 'main') {
        return renderMainForm(formProps);
      } else if (tabName == 'config') {
        return renderConfigForm(formProps);
      } else if (tabName == 'property') {
        return renderPropertyForm(formProps);
      }
    };

    return (
      <>
        {renderForm()}
        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            {__('Close')}
          </Button>

          {renderButton({
            name: 'contract',
            values: saveData,
            isSubmitted,
            object: data
          })}
        </ModalFooter>
      </>
    );
  };

  return (
    <>
      <CenterContent>
        <Tabs full>
          <TabTitle
            className={tabName === 'main' ? 'active' : ''}
            onClick={() => setTabName('main')}
          >
            {__('Main')}
          </TabTitle>
          <TabTitle
            className={tabName === 'config' ? 'active' : ''}
            onClick={() => setTabName('config')}
          >
            {__('Settings')}
          </TabTitle>
          {/* <TabTitle
            className={tabName === 'property' ? 'active' : ''}
            onClick={() => setTabName('property')}
          >
            {__('Property')}
          </TabTitle> */}
        </Tabs>
      </CenterContent>
      <div style={{ padding: 5 }}></div>
      <Form renderContent={renderContent} />
    </>
  );
}

export default CollateralTypeForm;

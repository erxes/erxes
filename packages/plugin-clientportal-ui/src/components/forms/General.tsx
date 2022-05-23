import { IBoard, IPipeline } from '@erxes/ui-cards/src/boards/types';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ITopic } from '@erxes/ui-knowledgeBase/src/types';
import React, { useState } from 'react';
import { ClientPortalConfig } from '../../types';
import {
  Block,
  BlockRow,
  BlockRowTitle,
  ToggleWrap,
  Features
} from '../../styles';
import { FlexContent } from '@erxes/ui/src/layout/styles';
import { __ } from 'coreui/utils';
import Toggle from '@erxes/ui/src/components/Toggle';
import SelectBrand from '@erxes/ui-settings/src/integrations/containers/SelectBrand';

type Props = {
  handleFormChange: (name: string, value: string | boolean) => void;
} & ClientPortalConfig;

type ControlItem = {
  required?: boolean;
  label: string;
  subtitle?: string;
  formValueName: string;
  formValue?: string;
  boardType?: string;
  placeholder?: string;
  formProps?: any;
  stageId?: string;
  pipelineId?: string;
  boardId?: string;
  url?: string;
  className?: string;
};

function General({ name, description, url, brandId, handleFormChange }: Props) {
  function renderControl({
    required,
    label,
    subtitle,
    formValueName,
    formValue,
    placeholder,
    formProps,
    className
  }: ControlItem) {
    const handleChange = (e: React.FormEvent) => {
      handleFormChange(
        formValueName,
        (e.currentTarget as HTMLInputElement).value
      );
    };

    return (
      <div className={className && className}>
        <FormGroup>
          <ControlLabel required={required}>{label}</ControlLabel>
          {subtitle && <p>{__(subtitle)}</p>}
          <FlexContent>
            <FormControl
              {...formProps}
              name={formValueName}
              value={formValue}
              placeholder={placeholder}
              onChange={handleChange}
            />
          </FlexContent>
        </FormGroup>
      </div>
    );
  }

  const renderMain = () => {
    return (
      <Block>
        <h4>{__('Client portal')}</h4>
        <BlockRow>
          {renderControl({
            required: true,
            label: 'Client Portal Name',
            subtitle: 'Displayed in the header area',
            formValueName: 'name',
            formValue: name,
            formProps: {
              autoFocus: true
            }
          })}

          {renderControl({
            label: 'Description',
            subtitle: 'Displayed in the header area',
            className: 'description',
            formValueName: 'description',
            formValue: description
          })}

          {renderControl({
            label: 'Website',
            subtitle: 'Redirect URL to the main website',
            formValueName: 'url',
            formValue: url
          })}
        </BlockRow>
      </Block>
    );
  };

  const renderFeatures = () => {
    return (
      <Block>
        <FormGroup>
          <SelectBrand
            isRequired={false}
            defaultValue={brandId}
            onChange={(e: any) =>
              handleFormChange(
                'brandId',
                (e.currentTarget as HTMLInputElement).value
              )
            }
          />
        </FormGroup>
      </Block>
    );
  };

  return (
    <>
      {renderMain()}
      {renderFeatures()}
    </>
  );
}

export default General;

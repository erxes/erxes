import {
  Chip,
  ControlLabel,
  EmptyState,
  FormControl,
  FormGroup,
  Icon,
  Label,
  SelectTeamMembers,
  TabTitle,
  Tabs,
  __,
  colors
} from '@erxes/ui/src';

import PlaceHolderInput from '@erxes/ui-automations/src/components/forms/actions/placeHolder/PlaceHolderInput';
import { DrawerDetail } from '@erxes/ui-automations/src/styles';
import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import SelectCustomers from '@erxes/ui-contacts/src/customers/containers/SelectCustomers';
import Popover from '@erxes/ui/src/components/Popover';
import { Avatar } from '@erxes/ui/src/components/SelectWithSearch';
import { PopoverContent } from '@erxes/ui/src/components/filterableList/styles';
import React, { useState } from 'react';
import { renderDynamicComponent } from '../../../../../utils';
import { Padding } from '../../styles';
import { checkToFieldConfigured } from './utils';
import { FieldsCombinedByType } from '@erxes/ui-forms/src/settings/properties/types';

export const RecipientsForm = ({
  emailRecipientsConst,
  triggerType,
  triggerConfig,
  config,
  onChangeConfig,
  additionalAttributes
}) => {
  const [selectedTab, setTab] = useState('general');

  const onSelect = (value: any, name: string) => {
    onChangeConfig({ ...config, [name]: value });
  };

  const renderToEmailsContent = () => {
    if (selectedTab === 'general') {
      return (
        <AttrubutionInput
          config={config}
          onChangeConfig={onChangeConfig}
          triggerType={triggerType}
          triggerConfig={triggerConfig}
          additionalAttributes={additionalAttributes}
        />
      );
    }

    if (selectedTab === 'static') {
      return (emailRecipientsConst || []).map((emailRType) => (
        <RecipientTypeComponent
          props={{ config, onSelect }}
          emailRType={emailRType}
        />
      ));
    }

    return null;
  };

  return (
    <FormGroup>
      <ControlLabel>{__('To Emails')}</ControlLabel>
      <DrawerDetail>
        <Tabs full>
          <TabTitle
            className={selectedTab === 'general' ? 'active' : ''}
            onClick={() => setTab('general')}
          >
            {__('General')}
            {config?.attributionMails && (
              <Label lblStyle='danger'>
                <Icon icon='check' />
              </Label>
            )}
          </TabTitle>
          <TabTitle
            className={selectedTab === 'static' ? 'active' : ''}
            onClick={() => setTab('static')}
          >
            {__('Static')}
            {checkToFieldConfigured(emailRecipientsConst, config) && (
              <Label lblStyle='danger' shake={true} ignoreTrans={true}>
                {`${emailRecipientsConst
                  .filter(({ name }) => name !== 'attributionMails')
                  .reduce((acc, item) => {
                    if (
                      config.hasOwnProperty(item.name) &&
                      Array.isArray(config[item.name])
                        ? (config[item.name] || []).length
                        : config[item.name]
                    ) {
                      acc++;
                    }
                    return acc;
                  }, 0)}`}
              </Label>
            )}
          </TabTitle>
        </Tabs>
        <Padding>{renderToEmailsContent()}</Padding>
      </DrawerDetail>
    </FormGroup>
  );
};

const AttrubutionInput = ({
  onChangeConfig,
  triggerType,
  triggerConfig,
  additionalAttributes,
  config
}: {
  config: any;
  onChangeConfig: (config: any) => void;
  triggerType: string;
  triggerConfig: any;
  additionalAttributes: FieldsCombinedByType[];
}) => {
  const onChange = (updatedConfig) => onChangeConfig(updatedConfig);

  const isAvailableTriggerExecutor = ['customer', 'companies', 'user'].some(
    (c) => triggerType.includes(c)
  );

  const customAttributions = isAvailableTriggerExecutor
    ? [
        {
          _id: String(Math.random()),
          label: 'Trigger Executors',
          name: 'triggerExecutors',
          type: 'segment'
        }
      ]
    : [];

  return (
    <PlaceHolderInput
      config={config}
      triggerType={triggerType}
      inputName='attributionMails'
      placeholder={__('Please select  some attributes from attributes section')}
      label='Dynamic mails'
      attrTypes={['user', 'contact', 'segment']}
      attrWithSegmentConfig={triggerType === 'forms:form_submission'}
      triggerConfig={triggerConfig}
      onChange={onChange}
      customAttributions={[...additionalAttributes, ...customAttributions]}
      additionalContent={
        <Popover
          placement='auto'
          trigger={<Icon color={colors.colorCoreRed} icon='question-circle' />}
        >
          <PopoverContent style={{ width: '200px', padding: '10px' }}>
            This type does not include (From Mail) and (Not Verified mails)
          </PopoverContent>
        </Popover>
      }
    />
  );
};

const CustomMailInput = ({
  config,
  onSelect
}: {
  config: any;
  onSelect: (value: any, name) => void;
}) => {
  const onChange = (e) => {
    const { value } = e.currentTarget;
    if (
      e.key === 'Enter' &&
      value.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    ) {
      onSelect((config?.customMails || []).concat(value), 'customMails');
      e.currentTarget.value = '';
    }
  };

  const removeMail = (mail) => {
    onSelect(
      (config?.customMails || []).filter((value) => value !== mail),
      'customMails'
    );
  };

  return (
    <FormGroup>
      <ControlLabel>{__('Custom Mail')}</ControlLabel>
      {(config?.customMails || []).map((customMail) => (
        <Chip
          key={customMail}
          onClick={() => removeMail(customMail)}
          frontContent={<Avatar src='/images/avatar-colored.svg' />}
        >
          {customMail}
        </Chip>
      ))}
      <FormControl onKeyPress={onChange} placeholder='Enter some email' />
    </FormGroup>
  );
};

const RecipientTypeComponent = ({
  props: { config = {}, onSelect },
  emailRType: { serviceName, label, name, type }
}: {
  props: { config: any; onSelect: (value: any, name: any) => void };
  emailRType: {
    serviceName: string;
    label: string;
    name: string;
    type: string;
  };
}) => {
  if (serviceName) {
    return renderDynamicComponent(
      {
        componentType: 'selectRecipients',
        type,
        value: config[name],
        label,
        name,
        onSelect
      },
      `${serviceName}:${type}`
    );
  }

  switch (type) {
    case 'customMail':
      return <CustomMailInput config={config} onSelect={onSelect} />;
    case 'teamMember':
      return (
        <FormGroup>
          <ControlLabel>{__(label)}</ControlLabel>
          <SelectTeamMembers
            name={name}
            initialValue={config[name] || ''}
            label={label}
            onSelect={onSelect}
            filterParams={{
              status: 'Verified'
            }}
          />
        </FormGroup>
      );

    default:
      const Components = {
        lead: SelectCustomers,
        customer: SelectCustomers,
        company: SelectCompanies
      };

      const Component = Components[type];

      if (!Component) {
        return <EmptyState text='Empty' icon='info-circle' />;
      }

      return (
        <FormGroup>
          <ControlLabel>{__(label)}</ControlLabel>
          <Component
            name={name}
            initialValue={config[name] || ''}
            label={label}
            onSelect={onSelect}
            filterParams={{
              type,
              emailValidationStatus: 'valid'
            }}
          />
        </FormGroup>
      );
  }
};

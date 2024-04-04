import React, { useState } from 'react';
import {
  ControlLabel,
  FormControl,
  FormGroup,
  SelectTeamMembers,
  TabTitle,
  Tabs,
  __
} from '@erxes/ui/src';
import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import SelectCustomers from '@erxes/ui-contacts/src/customers/containers/SelectCustomers';
import Select from 'react-select-plus';
import PlaceHolderInput from '@erxes/ui-automations/src/components/forms/actions/placeHolder/PlaceHolderInput';
import { IAction } from '@erxes/ui-automations/src/types';
import { DrawerDetail } from '@erxes/ui-automations/src/styles';
import Common from '@erxes/ui-automations/src/components/forms/actions/Common';
import { PaddingTop } from '../../styles';

const OWNER_TYPE_COMPONENTS = {
  customer: SelectCustomers,
  company: SelectCompanies,
  teamMember: SelectTeamMembers
};

const OWNER_TYPES = [
  {
    value: '',
    label: 'Select Choose'
  },
  {
    value: 'customer',
    label: 'Customers'
  },
  {
    value: 'company',
    label: 'Companies'
  },
  {
    value: 'teamMember',
    label: 'Team Members'
  }
];

type Props = {
  onSave: () => void;
  closeModal: () => void;
  activeAction: IAction;
  addAction: (action: IAction, actionId?: string, config?: any) => void;
  triggerType: string;
  // actionsConst: any[];
  // propertyTypesConst: any[];
};

type State = {
  currentTab: string;
  config: any;
};

export default class ScoreForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      config: props?.activeAction?.config || null,
      currentTab: ''
    };
  }

  renderOwnerTypeComponent(onSelect) {
    const { config } = this.state;

    if (!config?.ownerType) {
      return null;
    }

    let Component = OWNER_TYPE_COMPONENTS[config?.ownerType];
    const { label } =
      OWNER_TYPES.find(ot => ot.value === config?.ownerType) || {};

    return (
      <FormGroup>
        <ControlLabel>{__(label || '')}</ControlLabel>
        <Component
          label={`Select ${label}`}
          name="ownerIds"
          onSelect={onSelect}
        />
      </FormGroup>
    );
  }

  renderStaticContent(config, handleChange) {
    return (
      <>
        <FormGroup>
          <ControlLabel>{__('Owner Type')}</ControlLabel>
          <Select
            placeholder={__('Select Owner Type')}
            name="ownerType"
            value={config?.ownerType}
            options={OWNER_TYPES}
            multi={false}
            onChange={({ value }) => handleChange(value, 'ownerType')}
          />
        </FormGroup>
        {this.renderOwnerTypeComponent(handleChange)}
      </>
    );
  }

  renderDefaultContent(config, handleChange) {
    const { triggerType } = this.props;

    const additionalAttributes: any[] = [
      'contacts',
      'user',
      'posOrder'
    ].some(c => triggerType.includes(c))
      ? [
          {
            _id: String(Math.random()),
            label: 'Trigger Executor',
            name: 'triggerExecutor',
            type: 'custom'
          }
        ]
      : [];

    return (
      <>
        <PlaceHolderInput
          config={config}
          triggerType={triggerType}
          inputName="attribution"
          label="Attribution"
          attrTypes={['user', 'contact', 'custom']}
          onChange={config => this.setState({ config })}
          customAttributions={additionalAttributes}
        />

        <PlaceHolderInput
          config={config}
          triggerType={triggerType}
          inputName="scoreString"
          label="Score"
          attrTypes={['Number']}
          onChange={config => this.setState({ config })}
        />
      </>
    );
  }

  renderTabContent(currentTab, config) {
    const handleChange = (value, name) => {
      this.setState({ config: { ...config, [name]: value } });
    };

    if (['', 'default'].includes(currentTab)) {
      return this.renderDefaultContent(config, handleChange);
    }
    if ('static' === currentTab) {
      return this.renderStaticContent(config, handleChange);
    }
    return null;
  }

  render() {
    const { activeAction, closeModal, addAction } = this.props;
    const { config, currentTab } = this.state;

    const handleTabChange = tab => {
      this.setState({ currentTab: tab, config: null });
    };

    return (
      <DrawerDetail>
        <Common
          closeModal={closeModal}
          addAction={addAction}
          activeAction={activeAction}
          config={config}
        >
          <Tabs full>
            <TabTitle
              onClick={handleTabChange.bind(this, 'default')}
              className={['', 'default'].includes(currentTab) ? 'active' : ''}
            >
              {__('Default')}
            </TabTitle>
            <TabTitle
              onClick={handleTabChange.bind(this, 'static')}
              className={currentTab === 'static' ? 'active' : ''}
            >
              {'Static'}
            </TabTitle>
          </Tabs>
          <PaddingTop>{this.renderTabContent(currentTab, config)}</PaddingTop>
        </Common>
      </DrawerDetail>
    );
  }
}

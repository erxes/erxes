import {
  ContentBox,
  Title,
} from '@erxes/ui-settings/src/styles';
import CURRENCIES from '@erxes/ui/src/constants/currencies';
import Header from '@erxes/ui-settings/src/general/components/Header';
import { IConfigsMap } from '@erxes/ui-settings/src/general/types';
import React from 'react';
import { __ } from '@erxes/ui/src/utils/core';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import Button from '@erxes/ui/src/components/Button';
import CollapseContent from '@erxes/ui/src/components/CollapseContent';
import Icon from '@erxes/ui/src/components/Icon';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import SelectAccount from '../../accounts/containers/SelectAccount';
import Sidebar from './Sidebar';

type Props = {
  currentLanguage: string;
  changeLanguage: (language: string) => void;
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

type State = {
  configsMap: IConfigsMap;
  language: string;
  isSaved: boolean;
};

class GeneralSettings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      configsMap: props.configsMap,
      language: props.currentLanguage,
      isSaved: false,
    };
  }

  save = (e) => {
    e.preventDefault();

    const { configsMap, language } = this.state;

    this.setState({ isSaved: true });

    this.props.save(configsMap);

    this.props.changeLanguage(language);
  };

  onChangeConfig = (code: string, value) => {
    const { configsMap } = this.state;

    configsMap[code] = value;

    this.setState({ configsMap });
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  render() {
    const { configsMap } = this.state;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('General system config') },
    ];

    const actionButtons = (
      <Button
        id="generalSettingsSave"
        btnStyle="success"
        onClick={this.save}
        icon="check-circle"
      >
        Save
      </Button>
    );

    const content = (
      <ContentBox id={'GeneralSettingsMenu'}>
        <CollapseContent
          transparent={true}
          title={__('General settings')}
          beforeTitle={<Icon icon="settings" />}
        >
          <FormGroup>
            <ControlLabel>{__('Main Currency')}</ControlLabel>
            <FormControl
              componentclass='select'
              name="MainCurrency"
              value={configsMap.MainCurrency}
              options={CURRENCIES}
              onChange={this.onChangeInput.bind(this, 'MainCurrency')}
            />
          </FormGroup>
        </CollapseContent>
        <CollapseContent
          transparent={true}
          title={__('Tax settings')}
          beforeTitle={<Icon icon="settings" />}
        >
          <FormGroup>
            <ControlLabel>{__('has vat')}</ControlLabel>
            <FormControl
              componentclass='checkbox'
              name="HasVat"
              checked={configsMap.HasVat}
              autoFocus={true}
              required={true}
              onChange={(e: any) => {
                this.onChangeConfig('HasVat', e.target.checked)
              }}
            />
          </FormGroup>
          {configsMap.HasVat &&
            <>
              <FormGroup>
                <ControlLabel>{__('Vat Account Payable')}</ControlLabel>
                <SelectAccount
                  multi={false}
                  initialValue={configsMap.VatPayableAccount || ''}
                  label='Account'
                  name='VatPayableAccount'
                  filterParams={{ journals: ['tax'] }}
                  onSelect={(accountId) => { this.onChangeConfig('VatPayableAccount', accountId) }}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>{__('Vat Account Receivable')}</ControlLabel>
                <SelectAccount
                  multi={false}
                  initialValue={configsMap.VatReceivableAccount || ''}
                  label='Account'
                  name='VatReceivableAccount'
                  filterParams={{ journals: ['tax'] }}
                  onSelect={(accountId) => { this.onChangeConfig('VatReceivableAccount', accountId) }}
                />
              </FormGroup>

              <FormGroup>
                <ControlLabel>{__('Vat after Account Payable')}</ControlLabel>
                <SelectAccount
                  multi={false}
                  initialValue={configsMap.VatAfterPayableAccount || ''}
                  label='Account'
                  name='VatAfterPayableAccount'
                  filterParams={{ journals: ['tax'] }}
                  onSelect={(accountId) => { this.onChangeConfig('VatAfterPayableAccount', accountId) }}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>{__('Vat after Account Receivable')}</ControlLabel>
                <SelectAccount
                  multi={false}
                  initialValue={configsMap.VatAfterReceivableAccount || ''}
                  label='Account'
                  name='VatAfterReceivableAccount'
                  filterParams={{ journals: ['tax'] }}
                  onSelect={(accountId) => { this.onChangeConfig('VatAfterReceivableAccount', accountId) }}
                />
              </FormGroup>
            </>
            || null}

          <FormGroup>
            <ControlLabel>{__('has ctax')}</ControlLabel>
            <FormControl
              componentclass='checkbox'
              name="HasCtax"
              checked={configsMap.HasCtax}
              autoFocus={true}
              required={true}
              onChange={(e: any) => {
                this.onChangeConfig('HasCtax', e.target.checked)
              }}
            />
          </FormGroup>
          {configsMap.HasCtax &&
            <FormGroup>
              <ControlLabel>{__('Ctax Account Payable')}</ControlLabel>
              <SelectAccount
                multi={false}
                initialValue={configsMap.CtaxPayableAccount || ''}
                label='Account'
                name='CtaxPayableAccount'
                filterParams={{ journals: ['tax'] }}
                onSelect={(accountId) => { this.onChangeConfig('CtaxPayableAccount', accountId) }}
              />
            </FormGroup>
            || null}
        </CollapseContent>

      </ContentBox>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('System Configuration')}
            breadcrumb={breadcrumb}
          />
        }
        mainHead={
          <Header
            title="System configuration"
            description={
              __(
                'Set up your initial account settings so that things run smoothly in unison',
              ) + '.'
            }
          />
        }
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('System Configuration')}</Title>}
            right={actionButtons}
          />
        }
        leftSidebar={<Sidebar />}
        content={content}
        hasBorder={true}
      />
    );
  }
}

export default GeneralSettings;

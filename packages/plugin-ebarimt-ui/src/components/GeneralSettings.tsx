import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
} from '@erxes/ui/src/components';
import { __ } from '@erxes/ui/src/utils';
import { Wrapper } from '@erxes/ui/src/layout';
import React, { useState } from 'react';
import { KEY_LABELS } from '../constants';
import { ContentBox } from '../styles';
import { IConfigsMap } from '../types';
import Header from './Header';
import Sidebar from './Sidebar';
import { Title } from '@erxes/ui-settings/src/styles';
import { FormColumn, FormWrapper } from '@erxes/ui/src/styles/main';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
  fieldGroups: any[];
};

const GeneralSettings: React.FC<Props> = ({ save, configsMap, fieldGroups }: Props) => {
  const [currentMap, setCurrentMap] = useState(configsMap.EBARIMT || {});

  const saveHandler = (e) => {
    e.preventDefault();

    configsMap.EBARIMT = currentMap;
    save(configsMap);
  };

  const onChangeConfig = (code: string, value) => {
    setCurrentMap({ ...currentMap, [code]: value });
  };

  const onChangeInput = (code: string, e) => {
    onChangeConfig(code, e.target.value);
  };

  const renderItem = (key: string, description?: string) => {
    return (
      <FormGroup>
        <ControlLabel>{KEY_LABELS[key]}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          defaultValue={currentMap[key]}
          onChange={onChangeInput.bind(this, key)}
        />
      </FormGroup>
    );
  };

  const onChangeDealBillType = (e) => {
    onChangeConfig('dealBillType', { ...currentMap.dealBillType || {}, [e.target.name]: e.target.value })
  }

  const renderFieldChooser = (key: string, desc: string) => {

    const dealBillType = currentMap.dealBillType || {};
    return (
      <FormColumn>
        <FormGroup>
          <ControlLabel>{desc}</ControlLabel>
          <FormControl
            name={key}
            componentclass="select"
            options={[
              { value: "", label: "Empty" },
              ...(
                (
                  (
                    (fieldGroups || []).find(
                      (fg) => fg._id === dealBillType.groupId
                    ) || {}
                  ).fields || []
                ).filter((f) =>
                  [
                    "input",
                    "textarea",
                    "select",
                    "check",
                    "radio",
                  ].includes(f.type)
                ) || []
              ).map((f) => ({
                value: f._id,
                label: f.code ? `${f.code} - ${f.text}` : f.text,
              })),
            ]}
            value={dealBillType[key]}
            onChange={onChangeDealBillType}
          />
        </FormGroup>
      </FormColumn>
    )
  }

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Ebarimt config') },
  ];

  const actionButtons = (
    <Button
      btnStyle="success"
      onClick={saveHandler}
      icon="check-circle"
      uppercase={false}
    >
      Save
    </Button>
  );

  const content = (
    <ContentBox id={'GeneralSettingsMenu'}>
      <CollapseContent
        title={__("Ebarimt settings")}
        beforeTitle={<Icon icon="settings" />}
        transparent={true}
      >
        {renderItem('companyName')}
        {renderItem('ebarimtUrl')}
        {renderItem('checkTaxpayerUrl')}

        <CollapseContent title={__("Deals ebarimt billType config")} full={false} >
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel>Field Group:</ControlLabel>
                <FormControl
                  name="groupId"
                  componentclass="select"
                  options={[
                    { value: "", label: "Empty" },
                    ...(fieldGroups || []).map((fg) => ({
                      value: fg._id,
                      label: fg.code ? `${fg.code} - ${fg.name}` : fg.name,
                    })),
                  ]}
                  value={(currentMap.dealBillType || {})[`groupId`]}
                  onChange={onChangeDealBillType}
                />
              </FormGroup>
            </FormColumn>
            {renderFieldChooser('billType', 'Bill Type Chooser')}
            {renderFieldChooser('regNo', 'RegNo or TINNo input')}
            {renderFieldChooser('companyName', 'Company name response')}
          </FormWrapper>
        </CollapseContent>
      </CollapseContent>
    </ContentBox>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('Ebarimt config')} breadcrumb={breadcrumb} />
      }
      mainHead={<Header />}
      actionBar={
        <Wrapper.ActionBar
          background="colorWhite"
          left={<Title>{__('Ebarimt configs')}</Title>}
          right={actionButtons}
        />
      }
      leftSidebar={<Sidebar />}
      content={content}
      hasBorder={true}
      transparent={true}
    />
  );
};

export default GeneralSettings;

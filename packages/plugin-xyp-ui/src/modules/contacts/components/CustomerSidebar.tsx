import styled from 'styled-components';
import { colors, dimensions } from '@erxes/ui/src/styles';
import React, { useState } from 'react';
import Box from '@erxes/ui/src/components/Box';
import {
  FieldStyle,
  SectionBodyItem,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src/layout/styles';
import { getEnv } from '@erxes/ui/src/utils';
// import { FormGroup, ControlLabel, FormControl, Button } from '@erxes/ui';
import {
  Button,
  ControlLabel,
  DataWithLoader,
  DropdownToggle,
  EmptyState,
  ErrorMsg,
  FilterableList,
  FormControl,
  FormGroup,
  Icon,
  Label,
  LoadMore,
  ModalTrigger,
  Spinner
} from '@erxes/ui/src/components';
import { ButtonRelated } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils/core';
import Select from 'react-select-plus';

type Props = {
  xypdata: any;
  list: any;
  fetchData: any;
  xypServiceList: any;
  refetch: any;
  loading: any;
  error: string;
  fieldsGroups: any;
  customer: any;
};

function Sidebar({
  xypdata,
  list,
  fetchData,
  xypServiceList,
  refetch,
  error,
  loading,
  fieldsGroups,
  customer
}: Props) {
  const [serviceName, setServiceName] = useState('');
  const [inputs, setInputs] = useState([]);
  const [outputs, setOutputs] = useState([]);
  const [params, setParams] = useState({});
  const [paramsOutput, setParamsOutput] = useState({});

  const onChangeTag = (value: any) => {
    setServiceName(value?.value);
    const operation = xypServiceList?.find(
      x => x.wsOperationName === value.value
    );

    setOutputs(operation.output);
    setInputs(operation.input);
  };

  const onChangeParams = (name: any, value: any) => {
    setParams(prev => ({ ...prev, [name]: value?.value }));
  };
  const onChangeParamsOutput = (name: any, value: any) => {
    setParamsOutput(prev => ({ ...prev, [name]: value?.value }));
  };

  const renderServiceChooser = props => {
    if (loading) return <Spinner size={40} objective />;

    if (error) {
      return <ErrorMsg>Хур дамжин сервер</ErrorMsg>;
    }

    const operationList = list?.value?.servicelist.map(d => ({
      value: d,
      label: xypServiceList?.find(x => x.wsOperationName === d)
        ?.wsOperationDetail
    }));

    const customerFields = fieldsGroups.data?.fieldsGroups.map(d => ({
      label: d.name,
      options: d?.fields?.map(x => ({ label: x.text, value: x._id }))
    }));

    return (
      <>
        <Select
          placeholder={__('Type to search...')}
          value={serviceName}
          onChange={onChangeTag}
          isLoading={props.loading}
          // onInputChange={onInputChange}
          options={operationList}
          multi={false}
        />
        <div style={{ marginTop: 10 }} />
        <Box title="inputs">
          {inputs.map((d: any) => (
            <div style={{ padding: 10 }}>
              <ControlLabel required={true}>{d?.wsInputDetail}</ControlLabel>
              <Select
                placeholder={__('Type to search...')}
                value={d.wsInputName in params ? params[d.wsInputName] : ''}
                onChange={value => {
                  onChangeParams(d.wsInputName, value);
                }}
                isLoading={props.loading}
                options={customerFields}
                multi={false}
              />
            </div>
          ))}
        </Box>
        <Box title="outputs">
          {outputs.map((d: any) => (
            <div style={{ padding: 10 }}>
              <ControlLabel required={true}>{d?.wsResponseDetail}</ControlLabel>
              <Select
                placeholder={__('Type to search...')}
                value={
                  d.wsResponseName in paramsOutput
                    ? paramsOutput[d.wsResponseName]
                    : ''
                }
                onChange={value => {
                  onChangeParamsOutput(d.wsResponseName, value);
                }}
                isLoading={props.loading}
                options={customerFields}
                multi={false}
              />
            </div>
          ))}
        </Box>
        <Button
          btnStyle="simple"
          onClick={() => {
            fetchData(serviceName, params, paramsOutput, () => {});
            // props.closeModal();
          }}
        >
          fetch
        </Button>
      </>
    );
  };

  const relServiceTrigger = (
    <ButtonRelated>
      <span>{__('fetch data...')}</span>
    </ButtonRelated>
  );

  const relQuickButtons = (
    <ModalTrigger
      title="Xyp системээс мэдээлэл татах"
      trigger={relServiceTrigger}
      size="lg"
      content={renderServiceChooser}
    />
  );
  const content = () => {
    return (
      <>
        <SidebarList className="no-link">
          {loading && <DataWithLoader data="This is data" loading objective />}
          {xypdata?.data?.map((d, index) => (
            <li>
              <FieldStyle>{d?.field}</FieldStyle>

              <FieldStyle>
                {typeof d?.value === 'object' ? 'object' : d.value}
              </FieldStyle>
            </li>
          ))}
        </SidebarList>
        {xypdata === null && <EmptyState icon="building" text="No data" />}
        {relQuickButtons}
      </>
    );
  };

  return (
    <Box title="Xyp" name="xyp" isOpen={true}>
      {content()}
    </Box>
  );
}

export default Sidebar;

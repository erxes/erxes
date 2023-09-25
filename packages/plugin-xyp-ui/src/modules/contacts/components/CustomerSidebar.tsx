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
import {
  Button,
  ControlLabel,
  DataWithLoader,
  EmptyState,
  ErrorMsg,
  ModalTrigger,
  Spinner
} from '@erxes/ui/src/components';
import { ButtonRelated, ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils/core';
import Select from 'react-select-plus';
import { IOperation } from '../types';
import { Footer } from '@erxes/ui/src/styles/chooser';

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
  const [params, setParams] = useState({});
  const [paramsOutput, setParamsOutput] = useState({});
  const [isOpen, setOpen] = useState(false);
  const [operation, setOperation] = useState<IOperation>({
    orgName: '',
    wsOperationDetail: '',
    wsOperationName: '',
    wsVersion: '',
    wsWsdlEndpoint: '',
    input: [],
    output: []
  });

  const onChangeTag = (value: any) => {
    const operation = xypServiceList?.find(
      x => x.wsOperationName === value.value
    );
    console.log(operation);
    setOperation(operation);
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
          value={operation.wsOperationName}
          onChange={onChangeTag}
          isLoading={props.loading}
          options={operationList}
          multi={false}
        />
        <div style={{ marginTop: 10 }} />
        <Box title="inputs">
          {operation.input.map((d: any) => (
            <div style={{ padding: 10 }} key={d?.wsInputDetail}>
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
        {/* <Box title='outputs'>
          {operation.output.map((d: any, index) => (
            <div style={{ padding: 10 }} key={index}>
              <ControlLabel required={true}>{d?.wsResponseDetail}</ControlLabel>
              <Select
                placeholder={__('Type to search...')}
                value={
                  d.wsResponseName in paramsOutput
                    ? paramsOutput[d.wsResponseName]
                    : ''
                }
                onChange={(value) => {
                  onChangeParamsOutput(d.wsResponseName, value);
                }}
                isLoading={props.loading}
                options={customerFields}
                multi={false}
              />
            </div>
          ))}
        </Box> */}

        <ModalFooter>
          <Footer>
            <div>
              <Button
                btnStyle="simple"
                uppercase={false}
                onClick={() => {}}
                icon="times-circle"
              >
                Cancel
              </Button>
              <Button
                btnStyle="success"
                onClick={() => {
                  fetchData(operation, params, paramsOutput, () => {});
                }}
                icon="check-circle"
                uppercase={false}
              >
                Select
              </Button>
            </div>
          </Footer>
        </ModalFooter>
      </>
    );
  };

  const relServiceTrigger = (
    <ButtonRelated>
      <span>{__('Fetch data...')}</span>
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
  console.log('isopen', isOpen);
  const content = () => {
    return (
      <>
        <SidebarList className="no-link">
          {loading && <DataWithLoader data="This is data" loading objective />}
          {xypdata?.data?.map((d, index) => (
            <li key={index}>
              <FieldStyle
                onClick={() => {
                  console.log('click');
                  setOpen(true);
                }}
              >
                {d?.serviceDescription}
              </FieldStyle>

              {/* <FieldStyle>
                {typeof d?.value === 'object' ? 'object' : d.value}
              </FieldStyle> */}
            </li>
          ))}
        </SidebarList>
        {xypdata === null && <EmptyState icon="building" text="No data" />}
        {relQuickButtons}
        <ModalTrigger
          isOpen={isOpen}
          title="Xyp систем мэдээлэл"
          size="lg"
          content={renderServiceChooser}
        />
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

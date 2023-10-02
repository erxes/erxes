import React, { useState } from 'react';
import moment from 'moment';
import Box from '@erxes/ui/src/components/Box';
import CollapseContent from '@erxes/ui/src/components/CollapseContent';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import {
  Button,
  ControlLabel,
  DataWithLoader,
  EmptyState,
  ErrorMsg,
  ModalTrigger,
  Spinner
} from '@erxes/ui/src/components';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';

import { ButtonRelated, ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils/core';
import Select from 'react-select-plus';
import { IOperation } from '../types';
import { Footer } from '@erxes/ui/src/styles/chooser';
import Table from '@erxes/ui/src/components/table';

type Props = {
  xypdata: any;
  list: any;
  fetchData: any;
  xypServiceList: any;
  refetch: any;
  loading: any;
  error: string;
};

function Sidebar({
  xypdata,
  list,
  fetchData,
  xypServiceList,
  refetch,
  error,
  loading
}: Props) {
  const [params, setParams] = useState({});
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
    setOperation(operation);
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

    const onChange = (e: any) => {
      e.persist();
      setParams(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

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
              <FormGroup>
                <ControlLabel required={false}>{d?.wsInputDetail}</ControlLabel>

                <FormControl
                  name={d.wsInputName}
                  required={false}
                  autoFocus={false}
                  onChange={onChange}
                />
              </FormGroup>
            </div>
          ))}
        </Box>

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
                  fetchData(operation, params, {}, () => {});
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

  const renderServiceItem = (i, output) => {
    const items = Object.keys(i).filter(key => typeof i[key] !== 'object');

    const renderOutput = (value: any) => {
      return output?.find(x => x.wsResponseName === value) || null;
    };
    const renderData = (type: string, key: string) => {
      if (type?.toLowerCase()?.includes('byte')) {
        return <img height={80} src={`data:image/png;base64,${i[key]}`} />;
      }
      if (type?.toLowerCase()?.includes('date')) {
        return moment(i[key]).format('YYYY-MM-DD');
      }

      return i[key];
    };

    const renderRows = () => {
      const rows = [] as any;
      for (let i = 0; i < items.length; i += 3) {
        const rowItems = items.slice(i, i + 3);
        const row = (
          <tr key={i}>
            {rowItems.map((key, j) => (
              <td key={j}>
                <ControlLabel>
                  {renderOutput(key)?.wsResponseDetail}
                </ControlLabel>
                <div>
                  {renderData(renderOutput(key)?.wsResponseDatatype, key)}
                </div>
              </td>
            ))}
          </tr>
        );

        rows.push(row);
      }

      return rows;
    };

    return (
      <Table striped bordered responsive>
        <tbody id="hurData"> {renderRows()}</tbody>
      </Table>
    );
  };

  const modalContent = (d: any) => {
    const output =
      (xypServiceList.find(x => x.wsOperationName === d?.serviceName)
        ?.output as any) || [];

    if (d?.data?.list && d.data.list.length > 0) {
      const renderListItems = (listItem: any, index: number) => {
        const title =
          listItem['name'] ||
          listItem['title'] ||
          listItem['markName'] + ' - ' + listItem['modelName'] ||
          d?.serviceDescription ||
          renderServiceName(d?.serviceName);

        return (
          <CollapseContent
            title={__(title)}
            compact={true}
            open={false}
            key={index}
          >
            {renderServiceItem(listItem, output)}
          </CollapseContent>
        );
      };

      return (
        <Table striped bordered responsive key={d?.serviceDescription}>
          <tbody id="hurData">
            {d.data.list.map((listItem, index: number) =>
              renderListItems(listItem, index)
            )}
          </tbody>
        </Table>
      );
    }
    return renderServiceItem(d.data, output);
  };

  const renderServiceName = (value: string) => {
    return value;
  };

  const content = () => {
    return (
      <>
        <SidebarList className="no-link">
          {loading && <DataWithLoader data="This is data" loading objective />}
          {xypdata?.data?.map((d, index) => (
            <ModalTrigger
              title={d?.serviceDescription}
              trigger={
                <li key={index}>
                  {d?.serviceDescription.replace('дамжуулах сервис', '')}
                </li>
              }
              size="xl"
              content={() => modalContent(d)}
              key={d?.serviceName}
            />
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

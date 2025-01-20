import {
  BarItems,
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  HeaderDescription,
  ModalTrigger,
  Sidebar,
  SortHandler,
  Table,
  __,
  confirm,
} from '@erxes/ui/src';
import { DefaultWrapper, SelectCustomFields } from '../../common/utils';
import { Padding, SidebarHeader } from '../../styles';
import React, { useState } from 'react';
import { cardTypes, subMenu } from '../../common/constants';
import { removeParams, setParams } from '@erxes/ui/src/utils/router';
import { useLocation, useNavigate } from 'react-router-dom';

import BoardSelectContainer from '@erxes/ui-tickets/src/boards/containers/BoardSelect';
import Form from '../containers/Form';
import Row from './Row';
import Select from 'react-select';

type Props = {
  queryParams: any;
  configs: any[];
  totalCount: number;
  remove: (configIds: string[]) => void;
};
const List = (props: Props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const renderForm = () => {
    const trigger = <Button btnStyle="success">Add Configs</Button>;

    const content = ({ closeModal }) => {
      return <Form {...props} closeModal={closeModal} />;
    };

    return (
      <ModalTrigger
        content={content}
        trigger={trigger}
        title="Add config risk assessment"
        size="lg"
      />
    );
  };

  const renderContent = () => {
    const { configs } = props;

    const selectAllItems = () => {
      if (!selectedItems.length) {
        const configIds = configs.map(config => config._id);
        return setSelectedItems(configIds);
      }

      setSelectedItems([]);
    };

    const selectItem = id => {
      if (selectedItems.includes(id)) {
        const removedSelectedItems = selectedItems.filter(
          selectItem => selectItem !== id
        );
        return setSelectedItems(removedSelectedItems);
      }
      setSelectedItems([...selectedItems, id]);
    };

    return (
      <Table>
        <thead>
          <tr>
            <th>
              <FormControl
                componentclass="checkbox"
                checked={configs.length === selectedItems.length}
                onClick={selectAllItems}
              />
            </th>
            <th>{__('Board')}</th>
            <th>{__('Pipeline')}</th>
            <th>{__('Stage')}</th>
            <th>{__('Field')}</th>
            <th>{__('Risk Assessment')}</th>
            <th>
              <SortHandler sortField="createdAt" />
              {__('Created At')}
            </th>
            <th>
              <SortHandler sortField="modifiedAt" />
              {__('Modified At')}
            </th>
            <th>{__('Action')}</th>
          </tr>
        </thead>
        <tbody>
          {configs.map(config => (
            <Row
              {...props}
              key={config._id}
              config={config}
              checked={selectedItems.includes(config._id)}
              selectItem={selectItem}
            />
          ))}
        </tbody>
      </Table>
    );
  };

  const { totalCount, remove, queryParams } = props;

  const handleRemove = () => {
    confirm().then(() => {
      remove(selectedItems);
      setSelectedItems([]);
    });
  };

  const handleFilterParams = (type, value) => {
    if (!value) {
      if (type === 'cardType') {
        for (const param of ['cardType', 'boardId', 'pipelineId', 'stageId']) {
          removeParams(navigate, location, param);
        }
        return;
      }
      return removeParams(navigate, location, type);
    }
    setParams(navigate, location, { [type]: value });
  };

  const clearFilters = () => {
    return removeParams(
      navigate,
      location,
      ...['cardType', 'boardId', 'pipelineId', 'stageId', 'customFieldId']
    );
  };

  const sidebar = (
    <Sidebar
      full
      header={<SidebarHeader>{__('Addition Filters')}</SidebarHeader>}
    >
      <Padding $horizontal>
        {Object.keys(queryParams || {}).length ? (
          <Button btnStyle="warning" block onClick={clearFilters}>
            {__('Clear Filters')}
          </Button>
        ) : (
          <></>
        )}
        <FormGroup>
          <ControlLabel>{__('Type')}</ControlLabel>
          <Select
            placeholder={__('Select Type')}
            value={cardTypes.find(o => o.value === queryParams?.cardType)}
            options={cardTypes}
            isMulti={false}
            isClearable={true}
            onChange={e => handleFilterParams('cardType', e?.value)}
          />
        </FormGroup>
        {queryParams?.cardType && (
          <BoardSelectContainer
            type={queryParams?.cardType}
            boardId={queryParams?.boardId}
            pipelineId={queryParams?.pipelineId}
            stageId={queryParams?.stageId}
            onChangeBoard={e => handleFilterParams('boardId', e)}
            onChangePipeline={e => handleFilterParams('pipelineId', e)}
            onChangeStage={e => handleFilterParams('stageId', e)}
            autoSelectStage={false}
          />
        )}
        <FormGroup>
          <ControlLabel>{__('Custom field')}</ControlLabel>
          <SelectCustomFields
            label="Select Custom Field"
            name="customField"
            initialValue={queryParams?.customFieldId}
            onSelect={({ _id }) => handleFilterParams('customFieldId', _id)}
            type={queryParams?.cardType}
          />
        </FormGroup>
      </Padding>
    </Sidebar>
  );

  const rightActionBar = (
    <BarItems>
      {selectedItems.length > 0 && (
        <Button btnStyle="danger" onClick={handleRemove}>
          Delete
        </Button>
      )}
      {renderForm()}
    </BarItems>
  );

  const leftActionBar = (
    <HeaderDescription
      title="Configs"
      icon="/images/actions/25.svg"
      description="You can configure your risk assessment work assign to your team members automatically on tasks tickets"
    />
  );

  const updatedProps = {
    title: 'Configrations',
    content: renderContent(),
    rightActionBar,
    leftActionBar,
    subMenu,
    totalCount,
    sidebar,
  };

  return <DefaultWrapper {...updatedProps} />;
};

export default List;

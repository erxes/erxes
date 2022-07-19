import React, { useState, useEffect } from 'react';
import {
  FullContent,
  MiddleContent,
  ModalFooter
} from '@erxes/ui/src/styles/main';
import { FlexItem, FlexRow } from '@erxes/ui-settings/src/styles';
import {
  __,
  ControlLabel,
  FormControl,
  Tip,
  Icon,
  Button
} from '@erxes/ui/src';

type Props = {
  data: any;
  closeModal: () => void;
  edit: (update: any, add: any) => void;
  remove: (_id: string) => void;
};

const ManageConfigs = (props: Props) => {
  const { data, closeModal, edit, remove } = props;

  const [configs, setConfigs] = useState<any[]>([]);
  const [configsData, setConfigsData] = useState<any[]>(data ? data : []);

  useEffect(() => {
    data.map(value => {
      delete value.__typename;
    });
    setConfigsData(data);
  }, [data]);

  const addConfig = () => {
    setConfigs([...configs, {}]);
  };

  const onChangeConfig = (event: any, index: number, key: string) => {
    const updatedLabels: any = [...configs];

    let value = (event.target as HTMLInputElement).value;

    if (
      key === 'startTime' &&
      updatedLabels[index].endTime &&
      parseFloat(value) > updatedLabels[index].endTime
    ) {
      updatedLabels[index].startTime = updatedLabels[index].endTime;
    } else {
      if (
        key === 'endTime' &&
        updatedLabels[index].startTime &&
        parseFloat(value) < updatedLabels[index].startTime
      ) {
        updatedLabels[index].endTime = updatedLabels[index].startTime;
      } else {
        if (key === 'startTime' || key === 'endTime') {
          updatedLabels[index][key] = parseInt(value);
        } else updatedLabels[index][key] = value;
      }
    }

    setConfigs(updatedLabels);
  };

  const onChangeConfigData = (event: any, index: number, key: string) => {
    const updatedLabels = [...configsData];

    let value = (event.target as HTMLInputElement).value;

    if (
      key === 'startTime' &&
      updatedLabels[index].endTime &&
      parseFloat(value) > updatedLabels[index].endTime
    ) {
      updatedLabels[index].startTime = updatedLabels[index].endTime;
    } else {
      if (
        key === 'endTime' &&
        updatedLabels[index].startTime &&
        parseFloat(value) < updatedLabels[index].startTime
      ) {
        updatedLabels[index].endTime = updatedLabels[index].startTime;
      } else {
        if (key === 'startTime' || key === 'endTime') {
          updatedLabels[index][key] = parseInt(value);
        } else updatedLabels[index][key] = value;
      }
    }

    setConfigsData(updatedLabels);
  };

  const removeConfig = (index: number) => {
    setConfigs(configs.filter((_element, _index) => _index !== index));
  };

  const removeConfigData = (index: number, _id: string) => {
    setConfigsData(configsData.filter((_element, _index) => _index !== index));
    remove(_id);
  };

  const onCancel = () => {
    closeModal();
  };

  const onSave = () => {
    edit(configsData, configs);
    closeModal();
  };

  const renderConfig = () => {
    const renderState = configs.map((item, index) => (
      <>
        <FlexRow>
          <FlexItem>
            <FormControl
              type="text"
              id={`${index}`}
              value={item.name || ''}
              placeholder={'Name'}
              onChange={(event: any) => onChangeConfig(event, index, 'name')}
            />
          </FlexItem>
          <FlexItem>
            <FormControl
              componentClass="textarea"
              id={`${index}`}
              value={item.description || ''}
              placeholder={'Description'}
              onChange={(event: any) =>
                onChangeConfig(event, index, 'description')
              }
            />
          </FlexItem>
          <FlexItem>
            <FormControl
              type="number"
              componentClass="number"
              min={0}
              max={24}
              id={`${index}`}
              value={item.startTime || ''}
              onChange={(event: any) =>
                onChangeConfig(event, index, 'startTime')
              }
            />
          </FlexItem>
          <FlexItem>
            <FormControl
              type="number"
              componentClass="number"
              min={0}
              max={24}
              id={`${index}`}
              value={item.endTime || ''}
              onChange={(event: any) => onChangeConfig(event, index, 'endTime')}
            />
          </FlexItem>
          <FlexItem>
            <Button
              id="skill-edit-skill"
              btnStyle="link"
              onClick={() => removeConfig(index)}
            >
              <Tip text={__('remove')} placement="bottom">
                <Icon icon="times-circle" />
              </Tip>
            </Button>
          </FlexItem>
        </FlexRow>
      </>
    ));

    if (configs.length > 0)
      return (
        <>
          <ControlLabel>New Labels</ControlLabel>
          {renderState}
        </>
      );

    return null;
  };

  const renderConfigData = () => {
    return configsData.map((item: any, index: number) => (
      <>
        <FlexRow>
          <FlexItem>
            <FormControl
              type="text"
              id={`${index}`}
              value={item.name || ''}
              placeholder={'Name'}
              onChange={(event: any) =>
                onChangeConfigData(event, index, 'name')
              }
            />
          </FlexItem>
          <FlexItem>
            <FormControl
              componentClass="textarea"
              id={`${index}`}
              value={item.description || ''}
              placeholder={'Description'}
              onChange={(event: any) =>
                onChangeConfigData(event, index, 'description')
              }
            />
          </FlexItem>
          <FlexItem>
            <FormControl
              type="number"
              componentClass="number"
              min={0}
              max={24}
              id={`${index}`}
              value={item.startTime || ''}
              onChange={(event: any) =>
                onChangeConfigData(event, index, 'startTime')
              }
            />
          </FlexItem>
          <FlexItem>
            <FormControl
              type="number"
              componentClass="number"
              min={0}
              max={24}
              id={`${index}`}
              value={item.endTime || ''}
              onChange={(event: any) =>
                onChangeConfigData(event, index, 'endTime')
              }
            />
          </FlexItem>
          <FlexItem>
            <Button
              id="skill-edit-skill"
              btnStyle="link"
              onClick={() => removeConfigData(index, item._id)}
            >
              <Tip text={__('remove')} placement="bottom">
                <Icon icon="times-circle" />
              </Tip>
            </Button>
          </FlexItem>
        </FlexRow>
      </>
    ));
  };

  const renderTab = () => {
    const cancel = (
      <Button
        btnStyle="simple"
        type="button"
        onClick={onCancel}
        icon="times-circle"
        uppercase={false}
      >
        Cancel
      </Button>
    );

    const saveButton = (
      <Button
        btnStyle="success"
        type="button"
        onClick={onSave}
        icon="check-circle"
        uppercase={false}
      >
        Save
      </Button>
    );

    return (
      <>
        <FlexRow>
          <FlexItem>
            <ControlLabel>Name</ControlLabel>
          </FlexItem>
          <FlexItem>
            <ControlLabel>Description</ControlLabel>
          </FlexItem>
          <FlexItem>
            <ControlLabel>Start time (Hour)</ControlLabel>
          </FlexItem>
          <FlexItem>
            <ControlLabel>End time (Hour)</ControlLabel>
          </FlexItem>
          <FlexItem>
            <ControlLabel>Action</ControlLabel>
          </FlexItem>
        </FlexRow>
        {renderConfigData()}
        {renderConfig()}
        <Button
          type="button"
          onClick={addConfig}
          icon="plus-circle"
          uppercase={false}
        >
          Add config
        </Button>
        <ModalFooter>
          {cancel}
          {saveButton}
        </ModalFooter>
      </>
    );
  };

  return (
    <FullContent center={true} align={true}>
      <MiddleContent transparent={true}>{renderTab()}</MiddleContent>
      <ModalFooter></ModalFooter>
    </FullContent>
  );
};
export default ManageConfigs;

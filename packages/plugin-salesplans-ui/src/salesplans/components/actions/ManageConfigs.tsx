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
  save: (update: any, add: any) => void;
  data: any;
  closeModal: () => void;
  // refetch: () => void;
  removedata: (_id: string) => void;
};

const ManageConfigs = (props: Props) => {
  const { save, data, closeModal, removedata } = props;

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

  const onChangeConfig = (e, index, key) => {
    const updatedLabels: any = [...configs];

    let value = (e.target as HTMLInputElement).value;

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

  const onChangeConfigData = (e, index, key) => {
    const updatedLabels = [...configsData];

    let value = (e.target as HTMLInputElement).value;

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

  const removeConfig = index => {
    setConfigs(configs.filter((_element, i) => i !== index));
  };

  const removeConfigData = (index, _id) => {
    setConfigsData(configsData.filter((_element, i) => i !== index));
    removedata(_id);
  };

  const onCancel = () => {
    closeModal();
  };

  const onSave = () => {
    save(configsData, configs);
    closeModal();
  };

  const renderConfig = () => {
    const renderState = configs.map((t, index) => (
      <>
        <FlexRow>
          <FlexItem>
            <FormControl
              type="text"
              id={`${index}`}
              value={t.name || ''}
              placeholder={'Name'}
              onChange={e => onChangeConfig(e, index, 'name')}
            />
          </FlexItem>
          <FlexItem>
            <FormControl
              componentClass="textarea"
              id={`${index}`}
              value={t.description || ''}
              placeholder={'Description'}
              onChange={e => onChangeConfig(e, index, 'description')}
            />
          </FlexItem>
          <FlexItem>
            <FormControl
              type="number"
              componentClass="number"
              min={0}
              max={24}
              id={`${index}`}
              value={t.startTime || ''}
              onChange={e => onChangeConfig(e, index, 'startTime')}
            />
          </FlexItem>
          <FlexItem>
            <FormControl
              type="number"
              componentClass="number"
              min={0}
              max={24}
              id={`${index}`}
              value={t.endTime || ''}
              onChange={e => onChangeConfig(e, index, 'endTime')}
            />
          </FlexItem>
          <FlexItem>
            <Button
              id="skill-edit-skill"
              btnStyle="link"
              onClick={e => removeConfig(index)}
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
    return configsData.map((t, index) => (
      <>
        <FlexRow>
          <FlexItem>
            <FormControl
              type="text"
              id={`${index}`}
              value={t.name || ''}
              placeholder={'Name'}
              onChange={e => onChangeConfigData(e, index, 'name')}
            />
          </FlexItem>
          <FlexItem>
            <FormControl
              componentClass="textarea"
              id={`${index}`}
              value={t.description || ''}
              placeholder={'Description'}
              onChange={e => onChangeConfigData(e, index, 'description')}
            />
          </FlexItem>
          <FlexItem>
            <FormControl
              type="number"
              componentClass="number"
              min={0}
              max={24}
              id={`${index}`}
              value={t.startTime || ''}
              onChange={e => onChangeConfigData(e, index, 'startTime')}
            />
          </FlexItem>
          <FlexItem>
            <FormControl
              type="number"
              componentClass="number"
              min={0}
              max={24}
              id={`${index}`}
              value={t.endTime || ''}
              onChange={e => onChangeConfigData(e, index, 'endTime')}
            />
          </FlexItem>
          <FlexItem>
            <Button
              id="skill-edit-skill"
              btnStyle="link"
              onClick={e => removeConfigData(index, t._id)}
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

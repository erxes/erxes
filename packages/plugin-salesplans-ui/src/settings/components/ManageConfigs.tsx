import React, { useEffect, useState } from 'react';
import {
  __,
  Button,
  ControlLabel,
  FormControl,
  Icon,
  Tip
} from '@erxes/ui/src';
import { FlexItem, FlexRow } from '@erxes/ui-settings/src/styles';
import {
  FullContent,
  MiddleContent,
  ModalFooter
} from '@erxes/ui/src/styles/main';
import { ITimeframe } from '../types';

type Props = {
  data: ITimeframe[];
  closeModal: () => void;
  edit: (doc: any) => void;
};

const ManageConfigs = (props: Props) => {
  const { data, closeModal, edit } = props;

  const [configsData, setConfigsData] = useState<ITimeframe[]>(
    data ? data : []
  );
  const [sumPercent, setSumPercent] = useState<number>(0);

  useEffect(() => {
    setConfigsData(data);
    setSumPercent(
      data.length
        ? data.map(d => d.percent || 0).reduce((sum, d) => sum + d)
        : 0
    );
  }, [data]);

  const addConfig = () => {
    setConfigsData([...configsData, {}]);
  };

  const onCancel = () => {
    closeModal();
  };

  const onSave = () => {
    edit(configsData);
  };

  const renderConfigData = () => {
    return configsData.map((item: any, index: number) => {
      const onChangeConfigData = (event: any, key: string) => {
        const updatedLabels = [...configsData];

        let value: any = (event.target as HTMLInputElement).value;
        if (['startTime', 'endTime', 'percent'].includes(key)) {
          value = Number(value);
        }
        item[key] = value;

        setConfigsData(updatedLabels);
        setSumPercent(
          configsData.length
            ? configsData.map(d => d.percent || 0).reduce((sum, d) => sum + d)
            : 0
        );
      };

      const removeConfigData = (index: number, _id?: string) => {
        setConfigsData(
          configsData.filter((_element, _index) => _index !== index)
        );
      };

      return (
        <div key={index}>
          <FlexRow>
            <FlexItem>
              <FormControl
                type="text"
                id={`${index}`}
                value={item.name || ''}
                placeholder={'Name'}
                onChange={(event: any) => onChangeConfigData(event, 'name')}
              />
            </FlexItem>
            <FlexItem>
              <FormControl
                id={`${index}`}
                value={item.description || ''}
                placeholder={'Description'}
                onChange={(event: any) =>
                  onChangeConfigData(event, 'description')
                }
              />
            </FlexItem>
            <FlexItem>
              <FormControl
                type="number"
                componentClass="number"
                min={0}
                max={100}
                id={`${index}`}
                value={item.percent || 0}
                onChange={(event: any) => onChangeConfigData(event, 'percent')}
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
                  onChangeConfigData(event, 'startTime')
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
                onChange={(event: any) => onChangeConfigData(event, 'endTime')}
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
        </div>
      );
    });
  };

  const renderContent = () => {
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
            <ControlLabel>Percent</ControlLabel>
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
        <FlexRow>Summary Percent: {sumPercent}</FlexRow>
        <Button
          type="button"
          onClick={addConfig}
          icon="plus-circle"
          uppercase={false}
        >
          Add config
        </Button>
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={onCancel}
            icon="times-circle"
            uppercase={false}
          >
            Cancel
          </Button>
          <Button
            btnStyle="success"
            type="button"
            onClick={onSave}
            icon="check-circle"
            uppercase={false}
          >
            Save
          </Button>
        </ModalFooter>
      </>
    );
  };

  return (
    <FullContent center={true} align={true}>
      <MiddleContent transparent={true}>{renderContent()}</MiddleContent>
      <ModalFooter></ModalFooter>
    </FullContent>
  );
};
export default ManageConfigs;

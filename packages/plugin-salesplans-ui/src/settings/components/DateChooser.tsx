import React, { useState, useEffect } from 'react';
import {
  FullContent,
  MiddleContent,
  ModalFooter
} from '@erxes/ui/src/styles/main';
import dayjs from 'dayjs';
import Select from 'react-select-plus';
import { FlexItem, FlexRow } from '@erxes/ui-settings/src/styles';
import { __, ControlLabel, FormControl, Button, Icon } from '@erxes/ui/src';
import { MONTH, DAYS } from '../../constants';
type Props = {
  labelData: any;
  data: any;
  timeframes: any;
  closeModal: () => void;
  configs: any;
  save: (salesLogId: string, timeframes: any) => void;
};

function DateChooser({
  labelData,
  data,
  timeframes,
  configs,
  closeModal,
  save
}: Props) {
  const [labels, setLabels] = useState([]);
  const [labelsData, setLabelsData] = useState({});
  const [dateTimes, setDateTimes] = useState([]);
  const [days, setDays] = useState([]);

  useEffect(() => {
    let upDatedLabel = {};

    let type,
      key = 'value';

    switch (data.type) {
      case 'Year':
        if (configs) {
          configs.forEach(element => {
            upDatedLabel[element.month] = {
              _id: element._id,
              data: element.labelIds
            };
          });
        } else {
          type = MONTH;
          type.forEach(element => {
            upDatedLabel[element[key]] = { _id: '', data: [] };
          });
        }
        break;
      case 'Month':
        const dateObj = new Date(data.date);

        if (dateObj.getMonth() % 2 === 0) {
          type = DAYS;
        } else {
          if (dateObj.getMonth() === 1) {
            if (dateObj.getFullYear() % 4 === 0) {
              type = DAYS.slice(0, 29);
            } else type = DAYS.slice(0, 28);
          } else type = DAYS.slice(0, 30);
        }

        setDays(type);
        if (configs) {
          configs.map(element => {
            upDatedLabel[element.day] = {
              _id: element._id,
              data: element.labelIds
            };
          });
        } else {
          type.forEach(element => {
            upDatedLabel[element[key]] = { _id: '', data: [] };
          });
        }
        break;
      case 'Day':
        type = timeframes;
        key = '_id';
        if (configs) {
          configs.map(t => {
            upDatedLabel[t.timeframeId] = { _id: t._id, data: t.labelIds };
          });
        } else {
          type.forEach(element => {
            upDatedLabel[element._id] = { _id: '', data: [] };
          });
        }

        break;
    }

    setLabels({ ...labels, ...upDatedLabel });
  }, [timeframes, configs]);

  const onChangeLabels = (option, key) => {
    const upDatedLabel: any = { ...labels };

    upDatedLabel[key].data = option.map(option => option.value);

    setLabels(upDatedLabel);
  };

  const setDefaultLabels = key => {
    const upDatedLabel = { ...labelsData };

    upDatedLabel[key] = [];

    setLabelsData(upDatedLabel);
  };

  const onSave = () => {
    save(data._id, labels);
  };

  const selectForm = value => {
    const optionsData: [] = labelData.map(t => {
      return { value: t._id, label: t.title };
    });

    return (
      <Select
        placeholder={'Select Label'}
        options={optionsData}
        multi={true}
        value={labels[value] ? labels[`${value}`].data : ''}
        onChange={option => onChangeLabels(option, value)}
      />
    );
  };

  const onChange = (time, index, key) => {
    const updateLabels: any = dateTimes;

    updateLabels[index][key] = time;
  };

  const renderDateLabels = currentDate => {
    switch (data.type) {
      case 'Year':
        return MONTH.map((t: any) => (
          <FlexRow>
            <FlexItem>
              <ControlLabel uppercase={false}>
                {currentDate}/{t.label}
                <Icon icon="calendar" />
              </ControlLabel>
            </FlexItem>
            <FlexItem>{selectForm(t.value)}</FlexItem>
          </FlexRow>
        ));

      case 'Month':
        return days.map((t: any) => (
          <FlexRow>
            <FlexItem>
              <ControlLabel uppercase={false}>
                {currentDate}/{t.label}
                <Icon icon="calendar" />
              </ControlLabel>
            </FlexItem>
            <FlexItem>{selectForm(t.value)}</FlexItem>
          </FlexRow>
        ));

      case 'Day':
        return timeframes.map((t: any) => (
          <FlexRow>
            <FlexItem>
              <ControlLabel uppercase={false}>
                {currentDate}/{t.name}
                <Icon icon="calendar" />
              </ControlLabel>
            </FlexItem>
            <FlexItem>{selectForm(t._id)}</FlexItem>
          </FlexRow>
        ));

      default: {
        return;
      }
    }
  };

  const renderTabContent = () => {
    var currentDate;
    const dateObj = new Date(data.date);
    switch (data.type) {
      case 'Year':
        currentDate = `${dateObj.getFullYear()}`;
        break;

      case 'Month':
        currentDate = `${dateObj.getFullYear()} / ${dateObj.getMonth() + 1}`;
        break;

      case 'Day':
        currentDate = `${dateObj.getFullYear()} / ${dateObj.getMonth() +
          1} / ${dateObj.getDate() - 1}`;
        break;
    }
    return (
      <>
        <br />
        <FlexRow>
          <FlexItem>
            <ControlLabel>{data.type} :</ControlLabel>
          </FlexItem>
          <FlexItem>
            <ControlLabel>{currentDate}</ControlLabel>
          </FlexItem>
        </FlexRow>
        <br />
        <FlexRow>
          <FlexItem>
            <ControlLabel>Date</ControlLabel>
          </FlexItem>
          <FlexItem>
            <ControlLabel>Label</ControlLabel>
          </FlexItem>
        </FlexRow>
        {renderDateLabels(currentDate)}
        <br />
      </>
    );
  };

  const renderTab = () => {
    const cancel = (
      <Button
        btnStyle="simple"
        type="button"
        onClick={closeModal}
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
        <ControlLabel>Name</ControlLabel>
        <FormControl value={data.name}></FormControl>
        {renderTabContent()}
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
    </FullContent>
  );
}
export default DateChooser;

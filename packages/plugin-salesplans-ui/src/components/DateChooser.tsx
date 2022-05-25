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
import { MONTH, DAYS } from '../constant';
type Props = {
  labelData: any;
  data: any;
  dayConfigs: any;
  closeModal: () => void;
  dayPlanConf: any;
  save: (salesLogId: string, dayConfigs: any) => void;
};

function DateChooser({
  labelData,
  data,
  dayConfigs,
  dayPlanConf,
  closeModal,
  save
}: Props) {
  const [labels, setLabels] = useState([]);
  const [labelsData, setLabelsData] = useState({});
  const [dateTimes, setDateTimes] = useState([]);
  const [days, setDays] = useState([]);

  useEffect(() => {
    console.log('test', labels);
  }, [labels]);

  useEffect(() => {
    let upDatedLabel = {};

    let type,
      key = 'value';

    switch (data.type) {
      case 'Year':
        type = MONTH;
        type.forEach(element => {
          upDatedLabel[element[key]] = { _id: '', data: [] };
        });
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
        type.forEach(element => {
          upDatedLabel[element[key]] = { _id: '', data: [] };
        });
        if (dayPlanConf) {
          dayPlanConf.map(t => {
            const date = new Date(t.date);
            const month = date.getMonth() + 1;
            upDatedLabel[month] = { _id: t._id, data: t.labelIds };
          });
        }
        break;
      case 'Day':
        type = dayConfigs;
        key = '_id';
        type.forEach(element => {
          upDatedLabel[element[key]] = { _id: '', data: [] };
        });
        if (dayPlanConf) {
          dayPlanConf.map(t => {
            upDatedLabel[t.dayConfigId] = { _id: t._id, data: t.labelIds };
          });
        }

        break;
    }
    setLabels({ ...labels, ...upDatedLabel });
  }, [dayConfigs, dayPlanConf]);

  const onChangeLabels = (option, key) => {
    const upDatedLabel = { ...labels };

    upDatedLabel[key].data = option.map(option => option.value);

    setLabels(upDatedLabel);
  };

  const setDefaultLabels = key => {
    const upDatedLabel = { ...labelsData };

    upDatedLabel[key] = [];

    setLabelsData(upDatedLabel);
  };

  const onSave = () => {
    console.log('heeey', data._id, labels);
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
    const updateLabels = dateTimes;

    updateLabels[index][key] = time;
  };

  const renderDateLabels = currentDate => {
    switch (data.type) {
      case 'Year':
        return MONTH.map(t => (
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
        return days.map(t => (
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
        return dayConfigs.map(t => (
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

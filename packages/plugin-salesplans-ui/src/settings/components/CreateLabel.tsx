import React, { useState, useEffect } from 'react';
import Select from 'react-select-plus';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import {
  FullContent,
  MiddleContent,
  ModalFooter
} from '@erxes/ui/src/styles/main';
import { FlexItem, FlexRow } from '@erxes/ui-settings/src/styles';
import {
  __,
  FormGroup,
  ControlLabel,
  FormControl,
  Tip,
  Icon,
  Button
} from '@erxes/ui/src';
import { COLORS } from '../constant';
import { ColorPickerWrapper, ColorPick, ColorPicker } from '../styles';

type Props = {
  getLabels: any;
  type: string;
  remove: (_id: string) => void;
  save: (update: any, add: any) => void;
  onChangeType: (type: string) => void;
  closeModal: () => void;
  refetch: () => void;
};

function Config({
  getLabels,
  onChangeType,
  type,
  save,
  remove,
  closeModal,
  refetch
}: Props) {
  const [labels, setLabels] = useState([]);

  const [labelsData, setLabelsData] = useState(getLabels);

  useEffect(() => {
    getLabels.map(value => {
      delete value.__typename;
    });
    setLabelsData(getLabels);
  }, [getLabels]);

  const onchangeLabel = (e, index, key) => {
    const updatedLabels = [...labels];

    updatedLabels[index][key] = (e.target as HTMLInputElement).value;

    setLabels(updatedLabels);
  };

  const onchangeLabelStatus = (e, index, key) => {
    const updatedLabels = [...labels];
    updatedLabels[index][key] = e.value;
    setLabels(updatedLabels);
  };

  const onchangeDataLabel = (e, index, key) => {
    const updatedLabels = [...labelsData];
    updatedLabels[index][key] = (e.target as HTMLInputElement).value;
    setLabelsData(updatedLabels);
  };

  const onchangeDataLabelStatus = (e, index, key) => {
    const updatedLabels = [...labelsData];
    updatedLabels[index][key] = e.value;
    setLabelsData(updatedLabels);
  };

  const removeLabel = index => {
    setLabels(labels.filter((_element, i) => i !== index));
  };

  const removeDataLabel = (index, _id) => {
    setLabelsData(labelsData.filter((_element, i) => i !== index));
    remove(_id);
  };

  const addLabel = e => {
    setLabels([
      ...labels,
      {
        type: type,
        status: 'active'
      }
    ]);
  };

  const colorPopover = (color, onChange, id: string) => {
    return (
      <Popover id={id}>
        <TwitterPicker
          width="140px"
          triangle="hide"
          color={{ hex: color }}
          onChange={onChange}
          colors={COLORS}
        />
      </Popover>
    );
  };

  const onChangeColor = (e, index) => {
    const updatedLabels = [...labels];

    updatedLabels[index].color = e.hex;

    setLabels(updatedLabels);
  };

  const onChangeDataColor = (e, index) => {
    const updatedLabels = [...labelsData];

    updatedLabels[index].color = e.hex;

    setLabelsData(updatedLabels);
  };

  const renderLabels = () => {
    const statusOptions = [
      { value: 'archived', label: 'archived' },
      { value: 'active', label: 'active' }
    ];

    const render = labels.map((t, index) => (
      <FlexRow id={`${index}`}>
        <FlexItem>
          <FormControl
            type="text"
            id={`${index}`}
            value={t.title || ''}
            placeholder={'Title'}
            onChange={e => onchangeLabel(e, index, 'title')}
          />
        </FlexItem>
        <FlexItem>
          <ColorPickerWrapper>
            <OverlayTrigger
              trigger="click"
              placement="bottom"
              overlay={colorPopover(
                t.color,
                e => onChangeColor(e, index),
                `${index}`
              )}
              rootClose={true}
            >
              <ColorPick>
                <ColorPicker style={{ backgroundColor: t.color || '' }} />
              </ColorPick>
            </OverlayTrigger>
          </ColorPickerWrapper>
        </FlexItem>
        <FlexItem>
          <Select
            options={statusOptions}
            value={t.status}
            onChange={e => onchangeLabelStatus(e, index, 'status')}
            clearable={false}
            searchable={false}
          />
        </FlexItem>
        <FlexItem>
          <Button
            id="skill-edit-skill"
            btnStyle="link"
            onClick={e => removeLabel(index)}
          >
            <Tip text={__('remove')} placement="bottom">
              <Icon icon="times-circle" />
            </Tip>
          </Button>
        </FlexItem>
      </FlexRow>
    ));

    if (labels.length > 0)
      return (
        <>
          <ControlLabel>New Labels</ControlLabel>
          {render}
        </>
      );
  };

  const renderLabelsData = () => {
    const statusOptions = [
      { value: 'archived', label: 'archived' },
      { value: 'active', label: 'active' }
    ];

    const render = labelsData.map((t, index) => (
      <FlexRow id={`${index}`}>
        <FlexItem>
          <FormControl
            type="text"
            id={`${index}`}
            value={t.title || ''}
            placeholder={'Title'}
            onChange={e => onchangeDataLabel(e, index, 'title')}
          />
        </FlexItem>
        <FlexItem>
          <ColorPickerWrapper>
            <OverlayTrigger
              trigger="click"
              rootClose={true}
              placement="bottom"
              overlay={colorPopover(
                t.color,
                e => onChangeDataColor(e, index),
                `${index}`
              )}
            >
              <ColorPick>
                <ColorPicker style={{ backgroundColor: t.color || '' }} />
              </ColorPick>
            </OverlayTrigger>
          </ColorPickerWrapper>
        </FlexItem>
        <FlexItem>
          <Select
            options={statusOptions}
            value={t.status}
            onChange={e => onchangeDataLabelStatus(e, index, 'status')}
            clearable={false}
            searchable={false}
          />
        </FlexItem>
        <FlexItem>
          <Button
            id="skill-edit-skill"
            btnStyle="link"
            onClick={e => removeDataLabel(index, t._id)}
          >
            <Tip text={__('remove')} placement="bottom">
              <Icon icon="times-circle" />
            </Tip>
          </Button>
        </FlexItem>
      </FlexRow>
    ));

    return render;
  };

  const changeType = value => {
    setLabels([]);

    onChangeType(value);
  };

  const onSave = () => {
    save(labelsData, labels);
    // refetch;
  };

  const renderTab = () => {
    const labelsType = [
      { value: 'Year', label: 'Year' },
      { value: 'Month', label: 'Month' },
      { value: 'Day', label: 'Day' }
    ];

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
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl></FormControl>
        </FormGroup>
        <FormGroup>
          <ControlLabel>Type</ControlLabel>
          <Select
            placeholder={__('Choose a type')}
            options={labelsType}
            value={type}
            onChange={e => changeType(e.value)}
            clearable={false}
            searchable={false}
          />
        </FormGroup>
        <ControlLabel>Labels</ControlLabel>
        <FlexRow>
          <FlexItem>
            <ControlLabel>Title</ControlLabel>
          </FlexItem>
          <FlexItem>
            <ControlLabel>Color</ControlLabel>
          </FlexItem>
          <FlexItem>
            <ControlLabel>Status</ControlLabel>
          </FlexItem>
          <FlexItem>
            <ControlLabel>Action</ControlLabel>
          </FlexItem>
        </FlexRow>
        {renderLabelsData()}
        {renderLabels()}
        <br />
        <Button
          type="button"
          onClick={e => addLabel(e)}
          icon="plus-circle"
          uppercase={false}
        >
          Add Label
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
}

export default Config;

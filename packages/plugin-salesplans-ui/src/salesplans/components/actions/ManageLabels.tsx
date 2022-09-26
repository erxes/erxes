import React, { useState, useEffect } from 'react';
import Select from 'react-select-plus';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import { FlexRow } from '@erxes/ui-settings/src/styles';
import {
  FullContent,
  MiddleContent,
  ModalFooter
} from '@erxes/ui/src/styles/main';
import {
  __,
  FormGroup,
  ControlLabel,
  FormControl,
  Tip,
  Icon,
  Button,
  FlexItem,
  FlexRightItem
} from '@erxes/ui/src';
import { COLORS } from '../../../constants';
import { ColorPickerWrapper, ColorPick, ColorPicker } from '../../styles';

type Props = {
  getLabels: any;
  type: string;
  onChangeType: (type: string) => void;
  closeModal: () => void;
  edit: (update: any, add: any) => void;
  remove: (_id: string) => void;
};

const ManageLabels = (props: Props) => {
  const { getLabels, onChangeType, type, closeModal, edit, remove } = props;
  const [labels, setLabels] = useState<any[]>([]);
  const [labelsData, setLabelsData] = useState(getLabels);

  useEffect(() => {
    getLabels.map((value: any) => {
      delete value.__typename;
    });
    setLabelsData(getLabels);
  }, [getLabels]);

  const handleLabel = (event: any, index: number, key: string) => {
    const updatedLabels: any = [...labels];

    updatedLabels[index][key] = (event.target as HTMLInputElement).value;

    setLabels(updatedLabels);
  };

  const handleLabelStatus = (event: any, index: number, key: string) => {
    const updatedLabels: any = [...labels];
    updatedLabels[index][key] = event.value;
    setLabels(updatedLabels);
  };

  const handleDataLabel = (event: any, index: number, key: string) => {
    const updatedLabels: any = [...labelsData];
    updatedLabels[index][key] = (event.target as HTMLInputElement).value;
    setLabelsData(updatedLabels);
  };

  const handleDataLabelStatus = (event: any, index: number, key: string) => {
    const updatedLabels = [...labelsData];
    updatedLabels[index][key] = event.value;
    setLabelsData(updatedLabels);
  };

  const handleColor = (event: any, index: number) => {
    const updatedLabels: any = [...labels];

    updatedLabels[index].color = event.hex;

    setLabels(updatedLabels);
  };

  const handleDataColor = (event: any, index: number) => {
    const updatedLabels = [...labelsData];

    updatedLabels[index].color = event.hex;

    setLabelsData(updatedLabels);
  };

  const removeLabel = (index: number) => {
    setLabels(labels.filter((_element: any, _index: any) => _index !== index));
  };

  const removeDataLabel = (index: number, _id: string) => {
    setLabelsData(
      labelsData.filter((_element: any, _index: any) => _index !== index)
    );
    remove(_id);
  };

  const addLabel = () => {
    setLabels([
      ...labels,
      {
        type: type,
        status: 'active'
      }
    ]);
  };

  const colorPopover = (
    color: string,
    id: string,
    onChange: (event: any, index: number) => void
  ) => {
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

  const renderLabelsContent = () => {
    const renderLabelsExisting = () => {
      const statusOptions = [
        { value: 'archived', label: 'archived' },
        { value: 'active', label: 'active' }
      ];

      console.log(labelsData);

      const render = labelsData.map((item: any, index: number) => (
        <FlexRow id={`${index}`}>
          <FlexItem>
            <FormControl
              type="text"
              id={`${index}`}
              value={item.title || ''}
              placeholder={'Title'}
              onChange={(event: any) => handleDataLabel(event, index, 'title')}
            />
          </FlexItem>
          <FlexItem>
            <ColorPickerWrapper>
              <OverlayTrigger
                trigger="click"
                rootClose={true}
                placement="bottom"
                overlay={colorPopover(item.color, `${index}`, (event: any) =>
                  handleDataColor(event, index)
                )}
              >
                <ColorPick>
                  <ColorPicker style={{ backgroundColor: item.color || '' }} />
                </ColorPick>
              </OverlayTrigger>
            </ColorPickerWrapper>
          </FlexItem>
          <FlexItem>
            <Select
              options={statusOptions}
              value={item.status}
              onChange={(event: any) =>
                handleDataLabelStatus(event, index, 'status')
              }
              clearable={false}
              searchable={false}
            />
          </FlexItem>
          <FlexRightItem>
            <Button
              id="skill-edit-skill"
              btnStyle="link"
              onClick={() => removeDataLabel(index, item._id)}
            >
              <Tip text={__('Remove')} placement="bottom">
                <Icon icon="times-circle" />
              </Tip>
            </Button>
          </FlexRightItem>
        </FlexRow>
      ));

      return render;
    };

    const renderLabelsNew = () => {
      const statusOptions = [
        { value: 'archived', label: 'archived' },
        { value: 'active', label: 'active' }
      ];

      const render = labels.map((item: any, index: number) => (
        <FlexRow id={`${index}`}>
          <FlexItem>
            <FormControl
              type="text"
              id={`${index}`}
              value={item.title || ''}
              placeholder={'Title'}
              onChange={(event: any) => handleLabel(event, index, 'title')}
            />
          </FlexItem>
          <FlexItem>
            <ColorPickerWrapper>
              <OverlayTrigger
                trigger="click"
                placement="bottom"
                overlay={colorPopover(item.color, `${index}`, (event: any) =>
                  handleColor(event, index)
                )}
                rootClose={true}
              >
                <ColorPick>
                  <ColorPicker style={{ backgroundColor: item.color || '' }} />
                </ColorPick>
              </OverlayTrigger>
            </ColorPickerWrapper>
          </FlexItem>
          <FlexItem>
            <Select
              options={statusOptions}
              value={item.status}
              onChange={(event: any) =>
                handleLabelStatus(event, index, 'status')
              }
              clearable={false}
              searchable={false}
            />
          </FlexItem>
          <FlexRightItem>
            <Button
              id="skill-edit-skill"
              btnStyle="link"
              onClick={() => removeLabel(index)}
            >
              <Tip text={__('remove')} placement="bottom">
                <Icon icon="times-circle" />
              </Tip>
            </Button>
          </FlexRightItem>
        </FlexRow>
      ));

      if (labels.length > 0)
        return (
          <>
            <ControlLabel>New Labels</ControlLabel>
            {render}
          </>
        );

      return null;
    };

    return (
      <>
        <ControlLabel>Labels</ControlLabel>
        <br />
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
          <FlexRightItem>
            <ControlLabel>Action</ControlLabel>
          </FlexRightItem>
        </FlexRow>
        {renderLabelsExisting()}
        <br />
        {renderLabelsNew()}
      </>
    );
  };

  const renderLabelAddButton = () => {
    if (type)
      return (
        <Button
          type="button"
          onClick={addLabel}
          icon="plus-circle"
          size="small"
          uppercase={false}
        >
          Add Label
        </Button>
      );

    return null;
  };

  const changeType = (value: string) => {
    setLabels([]);

    onChangeType(value);
  };

  const onSave = () => {
    edit(labelsData, labels);
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
          <ControlLabel required={true}>Type</ControlLabel>
          <Select
            placeholder={__('Choose a type')}
            options={labelsType}
            value={type}
            onChange={e => changeType(e.value)}
            clearable={false}
            searchable={false}
          />
        </FormGroup>
        {renderLabelsContent()}
        {renderLabelAddButton()}
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

export default ManageLabels;

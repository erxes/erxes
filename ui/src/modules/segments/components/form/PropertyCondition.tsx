import { IBoard } from 'modules/boards/types';
import Select from 'react-select-plus';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { __ } from 'modules/common/utils';
import { IField, ISegmentCondition, ISegmentMap } from 'modules/segments/types';
import React from 'react';
import { PROPERTY_TYPES } from '../constants';
import PropertyForm from './PropertyForm';
import { FormControl } from 'modules/common/components/form';
import { SegmentBackIcon } from '../styles';
import Icon from 'modules/common/components/Icon';
import PropertyList from 'modules/segments/containers/form/PropertyList';
import { isBoardKind } from 'modules/segments/utils';

type Props = {
  contentType: string;
  boards?: IBoard[];
  segment: ISegmentMap;
  addCondition: (
    condition: ISegmentCondition,
    segmentKey: string,
    boardId?: string,
    pipelineId?: string
  ) => void;
  onClickBackToList: () => void;
  hideBackButton: boolean;
  changeSubSegmentConjunction: (
    segmentKey: string,
    conjunction: string
  ) => void;
  fetchFields: (type: string) => void;
};

type State = {
  propertyType: string;
  chosenField?: IField;
  searchValue: string;
  boardId: string;
  pipelineId: string;
};

class PropertyCondition extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const propertyType = props.contentType;

    this.state = { propertyType, searchValue: '', boardId: '', pipelineId: '' };
  }

  onClickField = field => {
    this.setState({ chosenField: field });
  };

  onClickBack = () => {
    this.setState({ chosenField: undefined, searchValue: '' });
  };

  renderFieldDetail = () => {
    const { chosenField, propertyType, pipelineId, boardId } = this.state;

    if (chosenField) {
      return (
        <PropertyForm
          {...this.props}
          boardId={boardId}
          pipelineId={pipelineId}
          propertyType={propertyType}
          field={chosenField}
        />
      );
    }

    return;
  };

  onSearch = e => {
    const value = e.target.value;

    this.setState({ searchValue: value });
  };

  generatePipelineOptions = () => {
    const { boardId } = this.state;

    const board = (this.props.boards || []).find(b => b._id === boardId);

    if (!board) {
      return [];
    }

    return (board.pipelines || []).map(p => ({
      value: p._id,
      label: p.name
    }));
  };

  onChangeBoardItem = (key, e) => {
    const value = e ? e.value : '';

    this.setState(({ [key]: value } as unknown) as Pick<State, keyof State>);
  };

  renderBoardFields = () => {
    const { boards = [] } = this.props;
    const { boardId, pipelineId, propertyType } = this.state;

    if (!isBoardKind(propertyType)) {
      return null;
    }

    return (
      <>
        <FormGroup>
          <ControlLabel>Board</ControlLabel>
          <Select
            value={boardId}
            options={boards.map(b => ({ value: b._id, label: b.name }))}
            onChange={this.onChangeBoardItem.bind(this, 'boardId')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Pipeline</ControlLabel>

          <Select
            value={pipelineId}
            onChange={this.onChangeBoardItem.bind(this, 'pipelineId')}
            options={this.generatePipelineOptions()}
          />
        </FormGroup>
      </>
    );
  };

  render() {
    const {
      contentType,
      onClickBackToList,
      hideBackButton,
      fetchFields
    } = this.props;
    const {
      chosenField,
      propertyType,
      searchValue,
      pipelineId,
      boardId
    } = this.state;

    const options = PROPERTY_TYPES[contentType];

    const onChange = e => {
      const value = e.value;

      fetchFields(value);

      this.setState({ propertyType: value, chosenField: undefined });
    };

    const generateSelect = () => {
      return (
        <Select
          clearable={false}
          value={propertyType}
          options={options.map(option => ({
            value: option.value,
            label: option.label
          }))}
          onChange={onChange}
        />
      );
    };

    if (!chosenField) {
      return (
        <>
          {hideBackButton ? (
            <></>
          ) : (
            <SegmentBackIcon onClick={onClickBackToList}>
              <Icon icon="angle-left" size={20} /> back
            </SegmentBackIcon>
          )}

          <FormGroup>
            <ControlLabel>Property type</ControlLabel>
            {generateSelect()}
          </FormGroup>
          {this.renderBoardFields()}
          <FormGroup>
            <ControlLabel>Properties</ControlLabel>
            <FormControl
              type="text"
              placeholder={__('Type to search')}
              onChange={this.onSearch}
            />
          </FormGroup>
          <PropertyList
            pipelineId={pipelineId}
            onClickField={this.onClickField}
            contentType={propertyType}
            searchValue={searchValue}
          />
        </>
      );
    }

    return (
      <>
        <SegmentBackIcon onClick={this.onClickBack}>
          <Icon icon="angle-left" size={20} /> back
        </SegmentBackIcon>
        <PropertyForm
          {...this.props}
          propertyType={propertyType}
          field={chosenField}
          boardId={boardId}
          pipelineId={pipelineId}
        />
      </>
    );
  }
}

export default PropertyCondition;

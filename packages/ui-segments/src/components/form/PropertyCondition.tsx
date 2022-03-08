import { IBoard } from '@erxes/ui-cards/src/boards/types';
import Select from 'react-select-plus';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import { __ } from '@erxes/ui/src/utils';
import { IField, ISegmentCondition, ISegmentMap } from '../../types';
import React from 'react';
import PropertyForm from './PropertyForm';
import { SegmentBackIcon } from '../styles';
import Icon from '@erxes/ui/src/components/Icon';
import PropertyList from '../../containers/form/PropertyList';
import { isBoardKind } from '../../utils';
import { IIntegration } from '@erxes/ui-settings/src/integrations/types';

type Props = {
  contentType: string;
  serviceType: string;
  boards?: IBoard[];
  associationTypes: any[];
  forms?: IIntegration[];
  segment: ISegmentMap;
  addCondition: (
    condition: ISegmentCondition,
    segmentKey: string,
    boardId?: string,
    pipelineId?: string,
    formId?: string
  ) => void;
  onClickBackToList: () => void;
  hideBackButton: boolean;
  hideDetailForm: boolean;
  changeSubSegmentConjunction: (
    segmentKey: string,
    conjunction: string
  ) => void;
  fetchFields: (type: string) => void;
  boardId: string;
  pipelineId: string;
};

type State = {
  propertyType: string;
  chosenProperty?: IField;
  searchValue: string;
  boardId: string;
  pipelineId: string;
  formId: string;
};

class PropertyCondition extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { boardId = '', contentType, pipelineId = '', forms = [] } = props;

    this.state = {
      propertyType: contentType,
      searchValue: '',
      boardId,
      pipelineId,
      formId: forms[0] ? forms[0].formId : ''
    };
  }

  onClickProperty = field => {
    this.setState({ chosenProperty: field });
  };

  onClickBack = () => {
    this.setState({ chosenProperty: undefined, searchValue: '' });
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
    const { boards = [], hideDetailForm, contentType } = this.props;
    const { boardId, pipelineId, propertyType } = this.state;

    if (!isBoardKind(propertyType)) {
      return null;
    }

    if (!hideDetailForm && isBoardKind(contentType)) {
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

  renderFormFields = () => {
    const { forms = [] } = this.props;
    const { formId, propertyType } = this.state;

    if (propertyType !== 'form_submission') {
      return null;
    }

    if (forms[0] && formId === '') {
      this.setState({ formId: forms[0].formId });
    }

    return (
      <>
        <FormGroup>
          <ControlLabel>Form</ControlLabel>
          <Select
            value={formId}
            options={forms.map(b => ({ value: b.formId, label: b.name }))}
            onChange={this.onChangeBoardItem.bind(this, 'formId')}
          />
        </FormGroup>
      </>
    );
  };

  render() {
    const {
      contentType,
      associationTypes,
      onClickBackToList,
      hideBackButton,
      fetchFields,
      serviceType
    } = this.props;

    const {
      chosenProperty,
      propertyType,
      searchValue,
      pipelineId,
      boardId,
      formId
    } = this.state;

    const onChange = e => {
      const value = e.value;

      fetchFields(value);

      this.setState({ propertyType: value, chosenProperty: undefined });
    };

    const generateSelect = () => {
      return (
        <Select
          clearable={false}
          value={propertyType}
          options={associationTypes.map(option => ({
            value: option.value,
            label: option.description
          }))}
          onChange={onChange}
        />
      );
    };

    if (!chosenProperty) {
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
          {this.renderFormFields()}
          <FormGroup>
            <ControlLabel>Properties</ControlLabel>
            <FormControl
              type="text"
              placeholder={__('Type to search')}
              onChange={this.onSearch}
            />
          </FormGroup>
          <PropertyList
            serviceType={serviceType}
            formId={formId}
            pipelineId={pipelineId}
            onClickProperty={this.onClickProperty}
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
          segmentKey={this.props.segment.key}
          propertyType={propertyType}
          field={chosenProperty}
          boardId={boardId}
          pipelineId={pipelineId}
          formId={formId}
        />
      </>
    );
  }
}

export default PropertyCondition;

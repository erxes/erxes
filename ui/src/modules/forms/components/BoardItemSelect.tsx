import CardSelect from 'modules/boards/components/portable/CardSelect';
import BoardSelect from 'modules/boards/containers/BoardSelect';
import { SelectContainer } from 'modules/boards/styles/common';
import { HeaderRow, HeaderContent } from 'modules/boards/styles/item';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import { ControlLabel, FormGroup } from 'modules/common/components/form';
import Select from 'react-select-plus';
import { __ } from 'modules/common/utils';

type Props = {
  type: string;
  boardId?: string;
  pipelineId?: string;
  stageId?: string;
  cardId?: string;
  cardName?: string;
  propertyId?: string;
  fetchCards: (stageId: string, callback: (cards: any) => void) => void;
  fetchProperties: (
    boardId: string,
    pipelineId: string,
    callback: (cards: any) => void
  ) => void;
  onChangeCard: (name?: string, cardId?: string) => void;
  onChangeStage: (stageId: string) => void;
  onChangeProperty: (selectedField?: IField) => void;
};

type State = {
  stageId: string;
  cardName: string;
  disabled: boolean;
  boardId: string;
  pipelineId: string;
  cards: any;
  cardId: string;
  properties?: IField[];
  propertyId?: string;
};

class AddForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      disabled: false,
      boardId: props.boardId || '',
      pipelineId: props.pipelineId || '',
      stageId: props.stageId || '',
      cardId: props.cardId || '',
      cards: [],
      cardName: props.cardName || '',
      properties: [],
      propertyId: props.propertyId || ''
    };
  }

  onChangeField = <T extends keyof State>(name: T, value: State[T]) => {
    if (name === 'stageId') {
      const { fetchCards, fetchProperties, onChangeStage } = this.props;
      fetchCards(String(value), (cards: any) => {
        if (cards) {
          this.setState({
            cards: cards.map(c => ({ value: c._id, label: c.name }))
          });
        }
      });

      fetchProperties(this.state.boardId, this.state.pipelineId, data => {
        if (data) {
          this.setState({ properties: data.fields });
        }
      });

      onChangeStage(value);
    }
    this.setState(({ [name]: value } as unknown) as Pick<State, keyof State>);
  };

  renderSelect() {
    const { type } = this.props;

    const { stageId, pipelineId, boardId } = this.state;

    const stgIdOnChange = stgId => this.onChangeField('stageId', stgId);
    const plIdOnChange = plId => this.onChangeField('pipelineId', plId);
    const brIdOnChange = brId => this.onChangeField('boardId', brId);

    return (
      <BoardSelect
        type={type}
        stageId={stageId || ''}
        pipelineId={pipelineId || ''}
        boardId={boardId || ''}
        onChangeStage={stgIdOnChange}
        onChangePipeline={plIdOnChange}
        onChangeBoard={brIdOnChange}
      />
    );
  }

  renderProperties() {
    if (this.state.cardName || this.state.cardId) {
      return null;
    }

    const { onChangeProperty } = this.props;
    const { properties = [] } = this.state;

    const onChange = option => {
      if (onChangeProperty && option) {
        const customProperty = properties.find(e => e._id === option.value);

        onChangeProperty(customProperty);

        return this.setState({
          propertyId: customProperty && customProperty._id
        });
      }

      this.setState({ propertyId: '' });
      onChangeProperty();
    };

    return (
      <FormGroup>
        <ControlLabel>Property</ControlLabel>
        <Select
          placeholder={__('Select property')}
          value={this.state.propertyId}
          onChange={onChange}
          options={properties.map(e => ({ label: e.text || '', value: e._id }))}
          multi={false}
          clearable={true}
        />
      </FormGroup>
    );
  }

  onChangeCardSelect = option => {
    const { cardId, name } = option;

    if (cardId && cardId !== 'copiedItem') {
      this.setState({ cardId });
      return this.props.onChangeCard('', cardId);
    }

    this.props.onChangeCard(name, '');

    this.setState({ cardName: name, cardId });
  };

  onChangeName = e => {
    const name = (e.target as HTMLInputElement).value;
    this.props.onChangeCard(name, '');
  };

  renderCardSelect() {
    const { type } = this.props;

    if (this.state.propertyId) {
      return null;
    }

    return (
      <SelectContainer>
        <HeaderRow>
          <HeaderContent>
            <ControlLabel>Name</ControlLabel>

            <CardSelect
              placeholder={`Add a new ${type} or select one`}
              options={this.state.cards}
              onChange={this.onChangeCardSelect}
              type={type}
              // value={'copiedItem'}
              additionalValue={this.state.cardName}
            />
          </HeaderContent>
        </HeaderRow>
      </SelectContainer>
    );
  }

  render() {
    return (
      <>
        {this.renderSelect()}
        {this.renderProperties()}
        {this.renderCardSelect()}
      </>
    );
  }
}

export default AddForm;

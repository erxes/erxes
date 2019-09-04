import { IUser } from 'modules/auth/types';
import { PriorityIndicator } from 'modules/boards/components/editForm';
import Move from 'modules/boards/containers/editForm/Move';
import { ColorButton } from 'modules/boards/styles/common';
import {
  HeaderContent,
  HeaderRow,
  MetaInfo,
  TitleRow
} from 'modules/boards/styles/item';
import { IItem, IOptions } from 'modules/boards/types';
import FormControl from 'modules/common/components/form/Control';
import React from 'react';

type Props = {
  item: IItem;
  options: IOptions;
  name: string;
  description?: string;
  stageId: string;
  users: IUser[];
  priority: string;
  hackStages: string[];
  onChangeField: (name: 'name' | 'stageId', value: any) => void;
  onBlurFields: (name: 'description' | 'name', value: string) => void;
  saveFormFields: (
    itemId: string,
    destinationStageId: string,
    formFields: JSON
  ) => void;
  score?: () => React.ReactNode;
  dueDate?: React.ReactNode;
  formFields: JSON;
};

class Top extends React.Component<Props> {
  onChangeStage = stageId => {
    const { onChangeField, saveFormFields, item, formFields } = this.props;

    onChangeField('stageId', stageId);
    saveFormFields(item._id, stageId, formFields);
  };

  renderMove() {
    const { item, stageId, options } = this.props;

    return (
      <Move
        options={options}
        item={item}
        stageId={stageId}
        onChangeStage={this.onChangeStage}
      />
    );
  }

  renderHackStage() {
    const { hackStages } = this.props;

    if (hackStages.length === 0) {
      return null;
    }

    return (
      <ColorButton color="#666">
        {hackStages.map(i => (
          <span key={i}>
            <PriorityIndicator value={i} />
            {i}
          </span>
        ))}
      </ColorButton>
    );
  }

  render() {
    const {
      name,
      onChangeField,
      score,
      dueDate,
      priority,
      onBlurFields
    } = this.props;

    const nameOnChange = e =>
      onChangeField('name', (e.target as HTMLInputElement).value);

    const onSaveName = e => {
      onBlurFields('name', e.target.value);
    };

    return (
      <>
        <HeaderRow>
          <HeaderContent>
            <TitleRow>
              {priority && <PriorityIndicator value={priority} />}
              <FormControl
                componentClass="textarea"
                defaultValue={name}
                required={true}
                onChange={nameOnChange}
                onBlur={onSaveName}
              />
            </TitleRow>
            <MetaInfo>
              {dueDate}
              {this.renderHackStage()}
            </MetaInfo>
          </HeaderContent>

          {score && score()}
        </HeaderRow>

        <HeaderRow>
          <HeaderContent>{this.renderMove()}</HeaderContent>
        </HeaderRow>
      </>
    );
  }
}

export default Top;

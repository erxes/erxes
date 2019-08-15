import { IUser } from 'modules/auth/types';
import { PriorityIndicator } from 'modules/boards/components/editForm';
import Move from 'modules/boards/containers/editForm/Move';
import { HeaderContent, HeaderRow, TitleRow } from 'modules/boards/styles/item';
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
  hackStage: string;
  onChangeField: (name: 'name' | 'stageId', value: any) => void;
  saveFormFields: (
    itemId: string,
    destinationStageId: string,
    formFields: JSON
  ) => void;
  amount?: () => React.ReactNode;
  dueDate: React.ReactNode;
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

  render() {
    const { name, onChangeField, amount, dueDate, priority } = this.props;

    const nameOnChange = e =>
      onChangeField('name', (e.target as HTMLInputElement).value);

    return (
      <React.Fragment>
        <HeaderRow>
          <HeaderContent>
            <TitleRow>
              {priority && <PriorityIndicator value={priority} />}
              <FormControl
                componentClass="textarea"
                defaultValue={name}
                required={true}
                onChange={nameOnChange}
              />
            </TitleRow>
            {dueDate}
          </HeaderContent>

          {amount && amount()}
        </HeaderRow>

        <HeaderRow>
          <HeaderContent>{this.renderMove()}</HeaderContent>
        </HeaderRow>
      </React.Fragment>
    );
  }
}

export default Top;

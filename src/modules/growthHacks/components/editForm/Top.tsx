import { IUser } from 'modules/auth/types';
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
  onChangeField: (name: 'name' | 'stageId', value: any) => void;
  amount?: () => React.ReactNode;
};

class Top extends React.Component<Props> {
  onChangeStage = stageId => {
    this.props.onChangeField('stageId', stageId);
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
    const { name, onChangeField, amount } = this.props;

    const nameOnChange = e =>
      onChangeField('name', (e.target as HTMLInputElement).value);

    return (
      <React.Fragment>
        <HeaderRow>
          <HeaderContent>
            <TitleRow>
              <FormControl
                componentClass="textarea"
                defaultValue={name}
                required={true}
                onChange={nameOnChange}
              />
            </TitleRow>
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

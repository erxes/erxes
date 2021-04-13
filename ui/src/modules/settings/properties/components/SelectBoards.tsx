import { IBoard } from 'modules/boards/types';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { IButtonMutateProps, IOption } from 'modules/common/types';
import { LeftContent, Row } from 'modules/settings/integrations/styles';
import React from 'react';
import Select from 'react-select-plus';
import { __ } from '../../../common/utils';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Button from 'modules/common/components/Button';
import BoardForm from 'modules/settings/boards/components/BoardForm';

type Props = {
  boards: IBoard[];
  onChange?: (values: string[]) => any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  defaultValue?: string[];
  isRequired?: boolean;
  description?: string;
};

class SelectBoards extends React.Component<Props, {}> {
  renderAddBoard = () => {
    const { renderButton } = this.props;

    const trigger = (
      <Button btnStyle="primary" uppercase={false} icon="plus-circle">
        Create board
      </Button>
    );

    const content = props => (
      <BoardForm {...props} renderButton={renderButton} />
    );

    return (
      <ModalTrigger title="Create board" trigger={trigger} content={content} />
    );
  };

  generateUserOptions(array: IBoard[] = []): IOption[] {
    return array.map(item => {
      const board = item || ({} as IBoard);

      return {
        value: board._id,
        label: board.name
      };
    });
  }

  onChangeBoard = values => {
    if (this.props.onChange) {
      this.props.onChange(values.map(item => item.value) || []);
    }
  };

  render() {
    const {
      boards,
      defaultValue,
      isRequired,
      description = __(
        'In which Board(s) do you want to add this property group?'
      )
    } = this.props;

    return (
      <FormGroup>
        <ControlLabel required={isRequired}>Board</ControlLabel>
        <p>{description}</p>
        <Row>
          <LeftContent>
            <Select
              placeholder={__('Select board')}
              value={defaultValue}
              onChange={this.onChangeBoard}
              options={this.generateUserOptions(boards)}
              multi={true}
            />
          </LeftContent>
          {this.renderAddBoard()}
        </Row>
      </FormGroup>
    );
  }
}

export default SelectBoards;

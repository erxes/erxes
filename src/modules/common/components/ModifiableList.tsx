import { Button, FormControl, Icon } from 'modules/common/components';
import { colors } from 'modules/common/styles';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import styled from 'styled-components';

const List = styled.ul`
  list-style: none;
  padding: 0;

  button {
    margin-top: 10px;
  }

  li {
    position: relative;
    margin-bottom: 5px;
    background-color: ${colors.colorWhite};
    border: 1px solid ${colors.borderPrimary};
    padding: 5px 10px;
    display: flex;
    justify-content: space-between;

    &:hover {
      cursor: pointer;
    }
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
`;

type Props = {
  options: string[];
  addButtonLabel?: string;
  onAddingOption?: (options?: string[], optionValue?: string) => void;
  onRemovingOption?: (options?: string[]) => void;
};

type State = {
  options: string[];
  adding: boolean;
};

class ModifiableList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      adding: true,
      options: props.options || []
    };
  }

  handleAddOption = () => {
    this.setState({ adding: true });
  };

  handleCancelAddingOption = () => {
    this.setState({ adding: false });
  };

  handleSaveOption = () => {
    const { options } = this.state;
    const optionValue = (document.getElementById(
      'optionValue'
    ) as HTMLInputElement).value;

    this.setState({ options: [...options, optionValue] }, () => {
      if (this.props.onAddingOption) {
        this.props.onAddingOption(this.state.options, optionValue);
        (document.getElementById('optionValue') as HTMLInputElement).value = '';
      }
    });
  };

  handleRemoveOption = (i: string) => {
    const { options } = this.state;

    this.setState({
      options: options.filter(item => item !== i)
    });
  };

  renderButtonOrElement = () => {
    if (this.state.adding) {
      const onKeyPress = e => {
        if (e.key === 'Enter') {
          this.handleSaveOption();
        }
      };

      return (
        <>
          <FormControl
            id="optionValue"
            autoFocus={true}
            onKeyPress={onKeyPress}
          />
          <Actions>
            <Button
              type="success"
              icon="cancel-1"
              btnStyle="simple"
              size="small"
              onClick={this.handleCancelAddingOption}
            >
              Cancel
            </Button>
            <Button
              type="success"
              btnStyle="success"
              size="small"
              icon="checked-1"
              onClick={this.handleSaveOption}
            >
              Save
            </Button>
          </Actions>
        </>
      );
    }

    return (
      <Button onClick={this.handleAddOption} size="small" icon="add">
        {__(this.props.addButtonLabel || 'Add an option')}
      </Button>
    );
  };

  renderOption = (option, index) => {
    return (
      <li key={index}>
        {option}
        <Icon
          icon="cancel-1"
          onClick={this.handleRemoveOption.bind(this, option)}
        />
      </li>
    );
  };

  render() {
    console.log(this.state.options); //tslint:disable-line
    return (
      <List>
        {this.state.options.map((option, index) =>
          this.renderOption(option, index)
        )}
        {this.renderButtonOrElement()}
      </List>
    );
  }
}

export default ModifiableList;

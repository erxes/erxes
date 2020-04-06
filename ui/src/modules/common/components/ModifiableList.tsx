import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Icon from 'modules/common/components/Icon';
import { colors } from 'modules/common/styles';
import { Alert } from 'modules/common/utils';
import { __ } from 'modules/common/utils';
import React from 'react';
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
  onChangeOption?: (options?: string[], optionValue?: string) => void;
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

  componentWillReceiveProps(nextProps) {
    const { options } = nextProps;

    if (nextProps.options !== this.state.options) {
      this.setState({ options });
    }
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

    if (!optionValue) {
      return Alert.warning('Nothing inserted');
    }

    this.setState({ options: [...options, optionValue] }, () => {
      if (this.props.onChangeOption) {
        this.props.onChangeOption(this.state.options, optionValue);
        (document.getElementById('optionValue') as HTMLInputElement).value = '';
      }
    });
  };

  handleRemoveOption = (i: string) => {
    const { options } = this.state;

    this.setState(
      {
        options: options.filter(item => item !== i)
      },
      () => {
        if (this.props.onChangeOption) {
          this.props.onChangeOption(this.state.options);
        }
      }
    );
  };

  onKeyPress = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.handleSaveOption();
    }
  };

  renderButtonOrElement = () => {
    if (this.state.adding) {
      return (
        <>
          <FormControl
            id="optionValue"
            autoFocus={true}
            onKeyPress={this.onKeyPress}
          />
          <Actions>
            <Button
              icon="cancel-1"
              btnStyle="simple"
              size="small"
              onClick={this.handleCancelAddingOption}
            >
              Cancel
            </Button>
            <Button
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
      <Button onClick={this.handleAddOption} size="small" icon="plus-circle">
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

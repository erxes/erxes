import { Button, FormControl, Icon } from 'modules/common/components';
import { colors } from 'modules/common/styles';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import styled from 'styled-components';

const List = styled.ul`
  list-style: none;
  padding: 0;

  li {
    position: relative;

    &:hover {
      cursor: pointer;
    }
  }
`;

const TypeList = styled(List)`
  button {
    margin-top: 10px;
  }

  li {
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

class PropertyForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      adding: false,
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
      }

      this.handleCancelAddingOption();
    });
  };

  handleRemoveOption = index => {
    const { options } = this.state;

    this.setState(
      {
        options: options.splice(index, 1) && options
      },
      () => {
        if (this.props.onRemovingOption) {
          this.props.onRemovingOption(options);
        }
      }
    );
  };

  renderButtonOrElement = () => {
    if (this.state.adding) {
      const onKeyPress = e => {
        if (e.key === 'Enter') {
          this.handleSaveOption();
        }
      };

      return (
        <React.Fragment>
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
              onClick={this.handleSaveOption}
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
        </React.Fragment>
      );
    }

    return (
      <Button onClick={this.handleAddOption} size="small" icon="add">
        {__(this.props.addButtonLabel || 'Add an option')}
      </Button>
    );
  };

  removeClick = index => {
    return this.handleRemoveOption(index);
  };

  renderOption = (option, index) => {
    return (
      <li key={index}>
        {option}
        <Icon icon="cancel-1" onClick={this.removeClick} />
      </li>
    );
  };

  render() {
    return (
      <TypeList>
        {this.state.options.map((option, index) =>
          this.renderOption(option, index)
        )}
        {this.renderButtonOrElement()}
      </TypeList>
    );
  }
}

export default PropertyForm;

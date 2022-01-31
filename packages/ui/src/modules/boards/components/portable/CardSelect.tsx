import React from 'react';
import Select from 'react-select-plus';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  input {
    display: block;
    width: 100%;
    border: none;
    background: none;
  }
`;

const FillContent = styled.div`
  flex: 1;
  margin-right: 5px;
`;

type Props = {
  placeholder: string;
  options: [{ label: string; value: string }];
  onChange: (option: { cardId?: string; name?: string }) => void;
  type: string;
  additionalValue?: string;
};

type State = {
  searchValue: string;
  selectedValue?: { label: string; value: string };
};

class CardSelect extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      searchValue: ''
    };
  }

  handleChange = option => {
    const { onChange } = this.props;

    if (option) {
      onChange({
        cardId: option.value,
        name: option.label
      });

      this.setState({
        searchValue: option.value === 'copiedItem' ? option.label : '',
        selectedValue: option
      });
    }
  };

  handleInput = (searchValue: string) => {
    this.setState({ searchValue });
  };

  handleKeyDown = event => {
    // enter key
    if (event.keyCode === 13) {
      this.handleAdd();
    }
  };

  handleAdd = () => {
    const { onChange } = this.props;

    const { selectedValue } = this.state;

    if (selectedValue && selectedValue.value !== 'copiedItem') {
      return;
    }

    onChange({
      name: this.state.searchValue
    });
  };

  render() {
    const { placeholder, options, additionalValue } = this.props;
    const { selectedValue } = this.state;

    if (additionalValue) {
      options.push({ value: 'copiedItem', label: additionalValue });
    }

    return (
      <Wrapper>
        <FillContent>
          <Select
            placeholder={placeholder}
            options={options}
            value={selectedValue}
            onSelectResetsInput={true}
            onBlur={this.handleAdd}
            onBlurResetsInput={false}
            onChange={this.handleChange}
            onInputChange={this.handleInput}
            onInputKeyDown={this.handleKeyDown}
            clearable={false}
          />
        </FillContent>
      </Wrapper>
    );
  }
}

export default CardSelect;

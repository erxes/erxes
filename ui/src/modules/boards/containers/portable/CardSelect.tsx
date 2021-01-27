import Button from 'erxes-ui/lib/components/Button';
import React from 'react';
import Select from 'react-select-plus';
import styled from 'styled-components';
// import Button from './Button';

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
  placeholder;
  options;
  onChange;
  type;
};

type State = {
  searchValue: string;
  selectedValue: { label: string; value: string };
};

class CardSelect extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      searchValue: '',
      selectedValue: { label: '', value: '' }
    };
  }

  handleChange = option => {
    const { onChange } = this.props;
    this.setState({ searchValue: '', selectedValue: option });

    if (option) {
      onChange({
        cardId: option.value,
        name: option.label
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

    onChange({
      name: this.state.searchValue
    });
  };

  renderNoResult() {
    const { type } = this.props;

    return (
      <Button
        btnStyle="link"
        uppercase={false}
        onClick={this.handleAdd}
        block={true}
        icon="plus-circle"
      >
        Add {type}
      </Button>
    );
  }

  render() {
    const { placeholder, options } = this.props;
    const { selectedValue } = this.state;

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
            noResultsText={this.renderNoResult()}
          />
        </FillContent>
      </Wrapper>
    );
  }
}

export default CardSelect;

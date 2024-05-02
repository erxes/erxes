import React from "react";
import Select from "react-select";
import styled from "styled-components";

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
  selectedValue?: { label: string; value: string } | null;
};

class CardSelect extends React.Component<Props, State> {
  private ref;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: "",
      selectedValue: null,
    };
  }

  handleChange = (option) => {
    const { onChange } = this.props;

    if (option) {
      onChange({
        cardId: option.value,
        name: option.label,
      });

      this.setState({
        searchValue: option.value === "copiedItem" ? option.label : "",
        selectedValue: option,
      });
    }
  };

  handleInput = (searchValue: string) => {
    this.setState({ searchValue });
  };

  handleKeyDown = (e) => {
    // enter key
    if (e.keyCode === 13) {
      this.handleAdd();
    }

    if (e.keyCode === 32 && this.ref.state.prevProps.inputValue !== "") {
      e.preventDefault();

      // this.handleInput(this.ref.state.prevProps.inputValue + " ");
      this.ref.onInputChange(
        this.ref.state.prevProps.inputValue + " ",
        "set-value"
      );
    }
  };

  handleAdd = () => {
    const { onChange } = this.props;

    const { selectedValue } = this.state;

    if (selectedValue && selectedValue.value !== "copiedItem") {
      return;
    }

    this.setState({
      selectedValue: { value: "copiedItem", label: this.state.searchValue },
    });

    onChange({
      name: this.state.searchValue,
    });
  };

  render() {
    const { placeholder, options, additionalValue } = this.props;
    const { selectedValue } = this.state;

    if (additionalValue) {
      options.push({ value: "copiedItem", label: additionalValue });
    }

    return (
      <Wrapper>
        <FillContent>
          <Select
            ref={(ref) => {
              this.ref = ref;
            }}
            placeholder={placeholder}
            options={options}
            value={selectedValue}
            // onSelectResetsInput={true}
            onBlur={this.handleAdd}
            // onBlurResetsInput={false}
            onChange={this.handleChange}
            onInputChange={this.handleInput}
            onKeyDown={this.handleKeyDown}
            isClearable={true}
            isSearchable={true}
          />
        </FillContent>
      </Wrapper>
    );
  }
}

export default CardSelect;

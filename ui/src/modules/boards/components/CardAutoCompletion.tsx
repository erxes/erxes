import Button from 'modules/common/components/Button';
import React, { useState } from 'react';
import Select from 'react-select-plus';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  input {
    display: block;
    width: 100%;
    border: none;
  }
`;

const OptionWrapper = styled(Wrapper)`
  padding: 8px 16px;
  font-weight: 500;
  border-bottom: 1px solid #eee;
  &:last-child {
    border: none;
  }
  &:hover {
    background: #fafafa;
    cursor: default;
  }
  i {
    color: #ea475d;
    &:hover {
      cursor: pointer;
    }
  }
`;

const FillContent = styled.div`
  flex: 1;
  margin-right: 5px;
`;

function Option(props: {
  option: { label: string; value: string };
  onSelect: (option: Option, e: any) => void;
}) {
  const { option, onSelect } = props;

  const onClick = e => {
    onSelect(option, e);
  };

  return (
    <OptionWrapper onClick={onClick}>
      <FillContent>{option.label}</FillContent>
    </OptionWrapper>
  );
}

type Option = {
  label: string;
  value?: string;
};

type Card = {
  _id: string;
  name: string;
};

type Props = {
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  defaultOptions: Card[];
  autoCompletionType: string;
  onChange: (params: { cardId?: string; cardName?: string }) => void;
};

function CardAutoCompletion({
  placeholder,
  defaultOptions,
  autoCompletionType,
  defaultValue,
  required,
  onChange
}: Props) {
  const selectRef = React.useRef<{ handleInputBlur: () => void }>(null);

  const [selectedValue, setSelectedValue] = useState<Option | null>(
    defaultValue ? { label: defaultValue, value: defaultValue } : null
  );
  const [searchValue, setSearchValue] = useState<string>('');

  const handleChange = option => {
    setSearchValue('');
    setSelectedValue(option);

    if (option) {
      onChange({
        cardId: option.value
      });
    }
  };

  const handleInput = (input: string) => {
    setSearchValue(input);
  };

  const handleAdd = () => {
    setSearchValue('');
    setSelectedValue({ label: searchValue, value: searchValue });

    onChange({
      cardName: searchValue
    });
  };

  const handleKeyDown = event => {
    // enter key
    if (event.keyCode === 13 && searchValue.length !== 0) {
      event.preventDefault();

      handleAdd();
    }
  };

  function renderNoResult() {
    if (searchValue.length === 0) {
      return 'Type to search';
    }

    return (
      <Button
        btnStyle="link"
        uppercase={false}
        onClick={handleAdd}
        block={true}
        icon="plus-circle"
      >
        Add {autoCompletionType}
      </Button>
    );
  }

  const inputRenderer = props => {
    return <input {...props} value={searchValue} />;
  };

  return (
    <Wrapper>
      <FillContent>
        <Select
          ref={selectRef}
          required={required}
          placeholder={placeholder}
          inputRenderer={inputRenderer}
          value={selectedValue}
          options={defaultOptions.map(item => ({
            label: item.name,
            value: item._id
          }))}
          onSelectResetsInput={true}
          onBlurResetsInput={true}
          autoBlur={true}
          onChange={handleChange}
          onInputKeyDown={handleKeyDown}
          onInputChange={handleInput}
          optionComponent={Option}
          noResultsText={renderNoResult()}
          clearable={false}
        />
      </FillContent>
    </Wrapper>
  );
}

export default CardAutoCompletion;

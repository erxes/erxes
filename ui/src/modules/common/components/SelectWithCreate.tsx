import client from 'apolloClient';
import gql from 'graphql-tag';
import debounce from 'lodash/debounce';
import React, { useState } from 'react';
import Select from 'react-select-plus';
import styled from 'styled-components';
import { __ } from '../utils';
import Button from './Button';

type Props = {
  name: string;
  placeholder?: string;
  queryName: string;
  customQuery: string;
  selector: {
    label: string
    value: string
  }
};

type Option = {
  label: string;
  value: string;
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

const FillContent = styled.div`
  flex: 1;
  margin-right: 5px;
`;

function generateOptions(options: any = [], selector: { label: string, value: string }) {
  if (options.length === 0) {
    return [];
  }

  return options.map(option => ({
    label: option[selector.label],
    value: option[selector.value]
  }));
};

function SelectWithCreate(props: Props) {
  const { placeholder, queryName, customQuery, name, selector } = props;
  const [options, setOptions] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [value, setValue] = useState('');
  const [companyFound, setCompanyFound] = useState(false);

  const handleChange = (option: Option) => {
    return setValue(option.value);
  };

  const handleInput = (input: string) => {
    return setSearchValue(input);
  };

  React.useEffect(() => {
    const fetch = () => {
      if (searchValue.length === 0) {
        return;
      }

      return client.query({
        query: gql(customQuery),
        variables: { searchValue },
      })
        .then(({ data }) => {
          const response = data[queryName];
          console.log(response.length > 0, response)

          setCompanyFound(response.length > 0);
          setOptions(generateOptions(response, selector));
        });
    };

    debounce(() => fetch())();

  }, [searchValue]);

  return (
    <Wrapper>
      <FillContent>
        <Select
          placeholder={placeholder}
          value={value}
          options={options}
          onBlurResetsInput={false}
          onCloseResetsInput={false}
          onChange={handleChange}
          onInputChange={handleInput}
        />
      </FillContent>
      {!companyFound ? (
        <Button
          size="small"
          btnStyle="primary"
          uppercase={false}
          icon="plus-circle"
        >
          {`${__('Add')} ${__(name)}`}
        </Button>
      ) : null}
    </Wrapper>
  );
}

export default SelectWithCreate
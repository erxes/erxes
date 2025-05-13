import React, { useState, useEffect } from 'react';
import Router from 'next/router';
import Icon from '../../common/Icon';
import { SearchContainer } from '../../styles/main';
import { useLanguage } from '../../../context/LanguageContext';

type Props = {
  searchValue?: string;
};

const Search: React.FC<Props> = ({ searchValue: initialSearchValue = '' }) => {
  const [searchValue, setSearchValue] = useState<string>(initialSearchValue);
  const [focused, setFocused] = useState<boolean>(false);
  const { t } = useLanguage();

  // Sync prop to state like componentWillReceiveProps
  useEffect(() => {
    setSearchValue(initialSearchValue || '');
  }, [initialSearchValue]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const onSearch = () => {
    Router.push({
      query: { searchValue },
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      Router.push({
        query: { searchValue },
      });
    }
  };

  const clearSearch = () => {
    setSearchValue('');
    Router.push({
      query: { searchValue: '' },
    });
  };

  return (
    <SearchContainer focused={focused}>
      <Icon icon="search-1" size={32} onClick={onSearch} />
      <input
        onChange={onChange}
        placeholder={`${t('Search for articles')}...`}
        value={searchValue}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {searchValue && (
        <Icon
          icon="times-circle"
          className="clear-icon"
          size={26}
          onClick={clearSearch}
        />
      )}
    </SearchContainer>
  );
};

export default Search;

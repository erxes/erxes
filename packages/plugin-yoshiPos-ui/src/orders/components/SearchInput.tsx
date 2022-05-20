import React from 'react';

import Icon from '../../common/components/Icon';
import { __ } from '../../common/utils';
import { SearchInputWrapper } from '../styles';

type Props = {
  onSearch: (e: any) => void;
  clearSearch: () => void;
  placeholder: string;
  searchValue?: string;
};

type State = {
  searchValue: string;
};

export default class SearchInput extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      searchValue: props.searchValue || ''
    };
  }

  render() {
    const { onSearch, clearSearch, placeholder } = this.props;
    const { searchValue } = this.state;

    const handleInput = e => {
      this.setState({ searchValue: e.target.value });
    };

    const closeInput = () => {
      this.setState({ searchValue: '' });

      clearSearch();
    };

    return (
      <SearchInputWrapper full={true}>
        <Icon icon="search-1" size={18} />
        {
          <>
            <input
              placeholder={__(placeholder)}
              value={searchValue}
              autoFocus={true}
              onKeyDown={onSearch}
              onChange={handleInput}
            />
            <Icon icon="times" size={18} onClick={closeInput} />
          </>
        }
      </SearchInputWrapper>
    );
  }
}

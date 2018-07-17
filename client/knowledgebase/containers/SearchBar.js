import React from 'react';
import { SearchBar } from '../components';
import { AppConsumer } from './AppContext';

const container = (props) => (
  <AppConsumer>
    {({ search, searchString }) =>
      <SearchBar {...props} searchString={searchString} onSearch={search} />
    }
  </AppConsumer>
)

export default container;

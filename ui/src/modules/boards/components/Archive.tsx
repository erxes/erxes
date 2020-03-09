import FormControl from 'modules/common/components/form/Control';
import { __ } from 'modules/common/utils';
import React, { useState } from 'react';
import ArchivedItems from '../containers/ArchivedItems';
import { HeaderButton } from '../styles/header';
import { ArchiveWrapper, TopBar } from '../styles/rightMenu';
import { IOptions } from '../types';

type Props = {
  options: IOptions;
  queryParams: any;
};

function Archive(props: Props) {
  const [type, changeType] = useState('item');
  const [searchValue, onSearch] = useState('');
  const { options, queryParams } = props;

  const switchType = (): string => (type === 'list' ? 'item' : 'list');

  const toggleType = () => changeType(switchType());

  const onEnterSearch = (e: React.KeyboardEvent<Element>) => {
    if (e.key === 'Enter') {
      const target = e.currentTarget as HTMLInputElement;
      onSearch(target.value || '');
    }
  };

  return (
    <ArchiveWrapper>
      <TopBar>
        <FormControl
          type="text"
          onKeyPress={onEnterSearch}
          autoFocus={true}
          placeholder={`Search ${type}...`}
        />
        <HeaderButton hasBackground={true} onClick={toggleType}>
          {__('Switch To')} {switchType()}
          {'s'}
        </HeaderButton>
      </TopBar>

      <ArchivedItems
        options={options}
        pipelineId={queryParams.pipelineId}
        search={searchValue}
        type={type}
      />
    </ArchiveWrapper>
  );
}

export default Archive;

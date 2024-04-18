import { __, router } from '../utils/core';

import Box from './Box';
import FilterByParams from './FilterByParams';
import { ITag } from '@erxes/ui-tags/src/types';
import Icon from './Icon';
import { Link } from 'react-router-dom';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';


interface IProps {
  tags: ITag[];
  counts: any;
  manageUrl: string;
  loading: boolean;
}

function CountsByTag({ tags, counts, manageUrl, loading }: IProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const onClick = () => {
    router.setParams(navigate, location, { tag: null });
  };

  const extraButtons = (
    <>
      <Link to={manageUrl}>
        <Icon icon="cog" />
      </Link>

      {router.getParam(location, 'tag') && (
        <a href="#cancel" tabIndex={0} onClick={onClick}>
          <Icon icon="times-circle" />
        </a>
      )}
    </>
  );

  return (
    <Box
      extraButtons={extraButtons}
      title={__('Filter by tags')}
      collapsible={tags.length > 7}
      name="showFilterByTags"
    >
      <FilterByParams
        fields={tags}
        paramKey="tag"
        counts={counts}
        icon="tag-alt"
        loading={loading}
        treeView={true}
        location={location}
        navigate={navigate}
      />
    </Box>
  );
}

export default CountsByTag;

import { __, router } from '../utils/core';

import Box from './Box';
import FilterByParams from './FilterByParams';
import Icon from './Icon';
import { Link } from 'react-router-dom';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IBundleRule } from '@erxes/ui-products/src/types';

interface IProps {
  bundleRules: IBundleRule[];
  counts: any;
  manageUrl: string;
  loading: boolean;
}

function CountByBundleRule({
  bundleRules,
  counts,
  manageUrl,
  loading
}: IProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const onClick = () => {
    router.setParams(navigate, location, { tag: null });
  };

  const extraButtons = (
    <>
      <Link to={manageUrl}>
        <Icon icon='cog' />
      </Link>

      {router.getParam(location, 'bundle') && (
        <a href='#cancel' tabIndex={0} onClick={onClick}>
          <Icon icon='times-circle' />
        </a>
      )}
    </>
  );

  return (
    <Box
      extraButtons={extraButtons}
      title={__('Filter by bundle')}
      collapsible={bundleRules.length > 7}
      name='showFilterByBundles'
    >
      <FilterByParams
        fields={bundleRules}
        paramKey='bundle'
        counts={counts}
        icon='box'
        loading={loading}
        treeView={true}
      />
    </Box>
  );
}

export default CountByBundleRule;

import FilterByParams from './FilterByParams';
import Icon from './Icon';
import { __, router } from '../utils/core';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { IRouterProps } from '../types';
import Box from './Box';
import { ITag } from '../tags/types';

interface IProps extends IRouterProps {
  tags: ITag[];
  counts: any;
  manageUrl: string;
  loading: boolean;
  noBackground?: boolean;
  noSpacing?: boolean;
  noShadow?: boolean;
}

function CountsByTag({
  history,
  tags,
  counts,
  manageUrl,
  loading,
  noBackground,
  noSpacing,
  noShadow
}: IProps) {
  const onClick = () => {
    router.setParams(history, { tag: null });
  };

  const extraButtons = (
    <>
      <Link to={manageUrl}>
        <Icon icon="cog" />
      </Link>

      {router.getParam(history, 'tag') && (
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
      noBackground={noBackground}
      noSpacing={noSpacing}
      noShadow={noShadow}
    >
      <FilterByParams
        fields={tags}
        paramKey="tag"
        counts={counts}
        icon="tag-alt"
        loading={loading}
        treeView={true}
      />
    </Box>
  );
}

export default withRouter<IProps>(CountsByTag);

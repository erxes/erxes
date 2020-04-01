import FilterByParams from 'modules/common/components/FilterByParams';
import Icon from 'modules/common/components/Icon';
import { __, router } from 'modules/common/utils';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { IRouterProps } from '../../common/types';
import { ITag } from '../../tags/types';
import Box from './Box';

interface IProps extends IRouterProps {
  tags: ITag[];
  counts: any;
  manageUrl: string;
  loading: boolean;
}

function CountsByTag({ history, tags, counts, manageUrl, loading }: IProps) {
  const onClick = () => {
    router.setParams(history, { tag: null });
  };

  const extraButtons = (
    <>
      <Link to={manageUrl}>
        <Icon icon="settings" />
      </Link>

      {router.getParam(history, 'tag') && (
        <a href="#cancel" tabIndex={0} onClick={onClick}>
          <Icon icon="cancel-1" />
        </a>
      )}
    </>
  );

  return (
    <Box
      extraButtons={extraButtons}
      title={__('Filter by tags')}
      collapsible={tags.length > 5}
      name="showFilterByTags"
    >
      <FilterByParams
        fields={tags}
        paramKey="tag"
        counts={counts}
        icon="tag-alt"
        loading={loading}
      />
    </Box>
  );
}

export default withRouter<IProps>(CountsByTag);

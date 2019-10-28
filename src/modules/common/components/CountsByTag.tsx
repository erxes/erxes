import FilterByParams from 'modules/common/components/FilterByParams';
import Icon from 'modules/common/components/Icon';
import { __, router } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
// import { ExtraButtons } from 'modules/layout/styles';
import React from 'react';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { IRouterProps } from '../../common/types';
import { ITag } from '../../tags/types';
import Box from './Box';

interface IProps extends IRouterProps {
  tags: ITag[];
  counts: any;
  manageUrl: string;
  loading: boolean;
  isOpen?: boolean;
}

function CountsByTag({
  history,
  tags,
  isOpen,
  counts,
  manageUrl,
  loading
}: IProps) {
  const { Section } = Wrapper.Sidebar;

  const onClick = () => {
    router.setParams(history, { tag: null });
  };

  const extraButtons = (
    <Section.QuickButtons>
      <Link to={manageUrl}>
        <Icon icon="settings" />
      </Link>

      {router.getParam(history, 'tag') ? (
        <a href="#cancel" tabIndex={0} onClick={onClick}>
          <Icon icon="cancel-1" />
        </a>
      ) : null}
    </Section.QuickButtons>
  );

  return (
    <Box
      extraButtons={extraButtons}
      title={__('Filter by tags')}
      isOpen={isOpen || false}
    >
      <Section collapsible={tags.length > 5}>
        <FilterByParams
          fields={tags}
          paramKey="tag"
          counts={counts}
          icon="tag"
          loading={loading}
        />
      </Section>
    </Box>
  );
}

export default withRouter<IProps>(CountsByTag);

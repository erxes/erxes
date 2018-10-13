import { FilterByParams, Icon } from 'modules/common/components';
import { __, router } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import * as React from 'react';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { IRouterProps } from '../../common/types';
import { ITag } from '../../tags/types';

interface IProps extends IRouterProps {
  tags: ITag[];
  counts: any;
  manageUrl: string;
  loading: boolean;
}

function CountsByTag({ history, tags, counts, manageUrl, loading }: IProps) {
  const { Section } = Wrapper.Sidebar;

  return (
    <Section collapsible={tags.length > 5}>
      <Section.Title>{__('Filter by tags')}</Section.Title>

      <Section.QuickButtons>
        <Link to={manageUrl}>
          <Icon icon="settings" />
        </Link>

        {router.getParam(history, 'tag') ? (
          <a
            tabIndex={0}
            onClick={() => {
              router.setParams(history, { tag: null });
            }}
          >
            <Icon icon="cancel-1" />
          </a>
        ) : null}
      </Section.QuickButtons>

      <FilterByParams
        fields={tags}
        paramKey="tag"
        counts={counts}
        icon="tag"
        loading={loading}
      />
    </Section>
  );
}

export default withRouter<IProps>(CountsByTag);

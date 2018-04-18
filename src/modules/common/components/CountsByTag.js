import React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Wrapper } from 'modules/layout/components';
import { Icon, FilterByParams } from 'modules/common/components';
import { router } from 'modules/common/utils';

CountsByTag.propTypes = {
  history: PropTypes.object.isRequired,
  tags: PropTypes.array.isRequired,
  counts: PropTypes.object.isRequired,
  manageUrl: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired
};

CountsByTag.contextTypes = {
  __: PropTypes.func
};

function CountsByTag({ history, tags, counts, manageUrl, loading }, { __ }) {
  const { Section } = Wrapper.Sidebar;

  return (
    <Section>
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

export default withRouter(CountsByTag);

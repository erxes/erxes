import React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { QuickButton } from '../../layout/styles';
import { Wrapper } from 'modules/layout/components';
import { Icon, FilterByParams } from 'modules/common/components';
import { router } from 'modules/common/utils';

CountsByTag.propTypes = {
  history: PropTypes.object.isRequired,
  tags: PropTypes.array.isRequired,
  counts: PropTypes.object.isRequired,
  manageUrl: PropTypes.string.isRequired
};

function CountsByTag({ history, tags, counts, manageUrl }) {
  const { Section } = Wrapper.Sidebar;

  return (
    <Section>
      <Section.Title>Filter by tags</Section.Title>

      <Section.QuickButtons>
        <QuickButton href={manageUrl}>
          <Icon icon="gear-a" />
        </QuickButton>

        {router.getParam(history, 'tag') ? (
          <QuickButton
            tabIndex={0}
            onClick={() => {
              router.setParams(history, { tag: null });
            }}
          >
            <Icon icon="close-circled" />
          </QuickButton>
        ) : null}
      </Section.QuickButtons>

      <FilterByParams
        fields={tags}
        paramKey="tag"
        counts={counts}
        icon="pricetag"
      />
    </Section>
  );
}

export default withRouter(CountsByTag);

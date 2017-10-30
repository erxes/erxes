import React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { SidebarList, QuickButton, SidebarCounter } from '../../layout/styles';
import { Wrapper } from 'modules/layout/components';
import { EmptyState, Icon } from 'modules/common/components';
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

      <SidebarList>
        {tags.length ? (
          tags.map(tag => (
            <li key={tag._id}>
              <a
                tabIndex={0}
                className={
                  router.getParam(history, 'tag') === tag._id ? 'active' : ''
                }
                onClick={() => {
                  router.setParams(history, { tag: tag._id });
                }}
              >
                <Icon icon="pricetag icon" style={{ color: tag.colorCode }} />
                {tag.name}
                <SidebarCounter>{counts[tag._id]}</SidebarCounter>
              </a>
            </li>
          ))
        ) : (
          <EmptyState icon="pricetag" text="No tags" size="small" />
        )}
      </SidebarList>
    </Section>
  );
}

export default withRouter(CountsByTag);

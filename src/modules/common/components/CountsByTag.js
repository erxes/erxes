import React from 'react';
import PropTypes from 'prop-types';
import { SidebarList, QuickButton, SideBarCounter } from '../../layout/styles';
import { Wrapper } from 'modules/layout/components';
import { EmptyState, Icon } from 'modules/common/components';

CountsByTag.propTypes = {
  tags: PropTypes.array.isRequired,
  counts: PropTypes.object.isRequired,
  manageUrl: PropTypes.string.isRequired
};

function CountsByTag({ tags, counts, manageUrl }) {
  const { Section, filter, getActiveClass } = Wrapper.Sidebar;

  return (
    <Section collapsible={tags.length > 5}>
      <Section.Title>Filter by tags</Section.Title>

      <Section.QuickButtons>
        <QuickButton href={manageUrl}>
          <Icon icon="gear-a" />
        </QuickButton>

        {window.location.search.includes('tag') ? (
          <QuickButton
            tabIndex={0}
            onClick={() => {
              filter('tag', null);
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
                className={getActiveClass('tag', tag._id)}
                onClick={() => {
                  filter('tag', tag._id);
                }}
              >
                <Icon icon="pricetag icon" style={{ color: tag.colorCode }} />
                {tag.name}
                <SideBarCounter>{counts[tag._id]}</SideBarCounter>
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

export default CountsByTag;

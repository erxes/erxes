import React from 'react';
import PropTypes from 'prop-types';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wrapper } from '/imports/react-ui/layout/components';
import { EmptyState } from '/imports/react-ui/common';

const propTypes = {
  tags: PropTypes.array.isRequired,
  manageUrl: PropTypes.string.isRequired,
  publishCountName: PropTypes.string.isRequired,
};

function TagFilter({ tags, manageUrl, publishCountName }) {
  const { Section, filter, getActiveClass } = Wrapper.Sidebar;

  return (
    <Section collapsible={tags.length > 5}>
      <Section.Title>Filter by tags</Section.Title>

      <Section.QuickButtons>
        <a href={FlowRouter.path(manageUrl)} className="quick-button">
          <i className="ion-gear-a" />
        </a>

        {FlowRouter.getQueryParam('tag')
          ? <a
              tabIndex={0}
              className="quick-button"
              onClick={() => {
                filter('tag', null);
              }}
            >
              <i className="ion-close-circled" />
            </a>
          : null}
      </Section.QuickButtons>

      <ul className="sidebar-list">
        {tags.length
          ? tags.map(tag => (
              <li key={tag._id}>
                <a
                  tabIndex={0}
                  className={getActiveClass('tag', tag._id)}
                  onClick={() => {
                    filter('tag', tag._id);
                  }}
                >
                  <i className="ion-pricetag icon" style={{ color: tag.colorCode }} />
                  {tag.name}
                  <span className="counter">
                    {Counts.get(`${publishCountName}${tag._id}`)}
                  </span>
                </a>
              </li>
            ))
          : <EmptyState icon={<i className="ion-pricetag" />} text="No tags" size="small" />}
      </ul>
    </Section>
  );
}

TagFilter.propTypes = propTypes;

export default TagFilter;

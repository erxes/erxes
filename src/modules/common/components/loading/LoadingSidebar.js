import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import { Wrapper } from 'modules/layout/components';

const propTypes = {
  items: PropTypes.number,
  size: PropTypes.string
};

function LoadingSidebar({ items, size = 'medium' }) {
  return (
    <Wrapper.Sidebar size={size}>
      {_.times(items, n => <Section key={n} />)}
    </Wrapper.Sidebar>
  );
}

function Section() {
  return (
    <Wrapper.Sidebar.Section>
      <div className="loading-wrapper side">
        <Lines title />
      </div>
    </Wrapper.Sidebar.Section>
  );
}

function Lines({ title }) {
  return (
    <div className="loading-item">
      <div className="line-wrapper">
        {title ? <div className="line title width40 animate" /> : null}
        <div className="line width85 animate" />
        <div className="line width65 animate" />
        <div className="line width85 animate" />
        <div className="line width70 animate" />
        <div className="line animate" />
      </div>
    </div>
  );
}

Lines.propTypes = {
  title: PropTypes.bool
};

LoadingSidebar.Section = Section;
LoadingSidebar.Lines = Lines;
LoadingSidebar.propTypes = propTypes;

export default LoadingSidebar;

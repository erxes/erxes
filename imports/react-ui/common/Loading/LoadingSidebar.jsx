import React, { PropTypes } from 'react';
import { _ } from 'meteor/underscore';
import { Wrapper } from '/imports/react-ui/layout/components';

const propTypes = {
  items: PropTypes.number,
};

function LoadingSidebar({ items }) {
  return (
    <Wrapper.Sidebar>
      {_.times(items, n => <Rows key={n} />)}
    </Wrapper.Sidebar>
  );
}

function Rows() {
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
  title: PropTypes.bool,
};

LoadingSidebar.Lines = Lines;
LoadingSidebar.propTypes = propTypes;

export default LoadingSidebar;

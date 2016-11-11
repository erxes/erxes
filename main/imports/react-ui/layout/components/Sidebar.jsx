import React, { PropTypes } from 'react';
import ScrollArea from 'react-scrollbar';


const propTypes = {
  children: PropTypes.node,
  size: PropTypes.oneOf(['narrow', 'medium', 'wide']),
};

function Sidebar({ children, size = 'medium' }) {
  return (
    <ScrollArea horizontal={false}>
      <div className={`sidebar ${size}`}>{children}</div>
    </ScrollArea>
  );
}

function Section({ children }) {
  return <div className="section">{children}</div>;
}

Section.propTypes = {
  children: PropTypes.node,
};

Sidebar.propTypes = propTypes;
Sidebar.Section = Section;

export default Sidebar;

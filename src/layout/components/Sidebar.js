import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SideContent, SidebarBox, HelperButtons, SidebarTitle } from '../styles';

const propTypes = {
  children: PropTypes.node,
  fixedContent: PropTypes.node,
  wide: PropTypes.bool,
};

function Sidebar({ children, wide, fixedContent }) {
  return (
    <SideContent wide={wide}>
      {fixedContent}
      {children}
    </SideContent>
  );
}

class Section extends Component {
  constructor(props) {
    super(props);

    this.state = { collapse: false, maxHeight: 220 };

    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.renderCollapseButton = this.renderCollapseButton.bind(this);
  }

  toggleCollapse() {
    this.setState({
      collapse: !this.state.collapse,
      maxHeight: this.state.collapse ? 220 : this.node.clientHeight + 20,
    });
  }

  renderCollapseButton() {
    const icon = this.state.collapse ? 'ion-chevron-up' : 'ion-chevron-down';
    return (
      <a tabIndex={0} onClick={this.toggleCollapse} className="toggle-collapse">
        <i className={icon} />
      </a>
    );
  }

  render() {
    const { children, collapsible } = this.props;

    const height = {
      maxHeight: collapsible ? this.state.maxHeight : 'none',
    };
    return (
      <SidebarBox style={height}>
        <div
          ref={node => {
            this.node = node;
          }}
        >
          {children}
        </div>
        {collapsible ? this.renderCollapseButton() : null}
      </SidebarBox>
    );
  }
}

function Title({ children }) {
  return (
    <SidebarTitle>
      {children}
    </SidebarTitle>
  );
}
Title.propTypes = {
  children: PropTypes.node.isRequired,
};

function QuickButtons({ children }) {
  return (
    <HelperButtons>
      {children}
    </HelperButtons>
  );
}
QuickButtons.propTypes = {
  children: PropTypes.node,
};

Section.Title = Title;
Section.QuickButtons = QuickButtons;

Section.propTypes = {
  children: PropTypes.node,
  collapsible: PropTypes.bool,
  className: PropTypes.string,
};

Sidebar.propTypes = propTypes;
Sidebar.Section = Section;

export default Sidebar;

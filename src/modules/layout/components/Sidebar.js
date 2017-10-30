import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  SideContent,
  SidebarBox,
  SidebarToggle,
  HelperButtons,
  SidebarTitle,
  SidebarHeader,
  SidebarMainContent,
  SidebarFooter
} from '../styles';

const propTypes = {
  children: PropTypes.node,
  header: PropTypes.node,
  footer: PropTypes.node,
  wide: PropTypes.bool,
  full: PropTypes.bool
};

function Sidebar({ children, wide, header, footer, full }) {
  return (
    <SideContent wide={wide} full={full}>
      {header}
      <SidebarMainContent>{children}</SidebarMainContent>
      {footer}
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
      maxHeight: this.state.collapse ? 220 : this.node.clientHeight + 20
    });
  }

  renderCollapseButton() {
    const icon = this.state.collapse ? 'ion-chevron-up' : 'ion-chevron-down';
    return (
      <SidebarToggle tabIndex={0} onClick={this.toggleCollapse}>
        <i className={icon} />
      </SidebarToggle>
    );
  }

  render() {
    const { children, collapsible, noShadow } = this.props;

    const height = {
      maxHeight: collapsible && this.state.maxHeight
    };
    return (
      <SidebarBox collapsible style={height} noShadow={noShadow}>
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
  return <SidebarTitle>{children}</SidebarTitle>;
}

Title.propTypes = {
  children: PropTypes.node.isRequired
};

function Header({ children }) {
  return <SidebarHeader>{children}</SidebarHeader>;
}

Header.propTypes = {
  children: PropTypes.node.isRequired
};

function Footer({ children }) {
  return <SidebarFooter>{children}</SidebarFooter>;
}

Footer.propTypes = {
  children: PropTypes.node.isRequired
};

function QuickButtons({ children }) {
  return <HelperButtons>{children}</HelperButtons>;
}

QuickButtons.propTypes = {
  children: PropTypes.node
};

Section.Title = Title;
Section.QuickButtons = QuickButtons;

Section.propTypes = {
  children: PropTypes.node,
  collapsible: PropTypes.bool,
  className: PropTypes.string,
  noShadow: PropTypes.bool
};

Sidebar.propTypes = propTypes;
Sidebar.Header = Header;
Sidebar.Section = Section;
Sidebar.Footer = Footer;

// TODO
Sidebar.filter = () => {};
Sidebar.getActiveClass = () => {
  return '';
};

export default Sidebar;

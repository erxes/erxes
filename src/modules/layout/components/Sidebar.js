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
  SidebarFooter,
  BoxContent
} from '../styles';
import { Icon } from 'modules/common/components';

const propTypes = {
  children: PropTypes.node,
  header: PropTypes.node,
  footer: PropTypes.node,
  wide: PropTypes.bool,
  full: PropTypes.bool,
  half: PropTypes.bool
};

function Sidebar({ children, wide, header, footer, full, half }) {
  return (
    <SideContent half={half} wide={wide} full={full}>
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
    const icon = this.state.collapse ? 'uparrow' : 'downarrow';
    return (
      <SidebarToggle tabIndex={0} onClick={this.toggleCollapse}>
        <Icon erxes icon={icon} />
      </SidebarToggle>
    );
  }

  render() {
    const { children, collapsible, noShadow, noBackground, full } = this.props;

    const height = {
      maxHeight: collapsible && this.state.maxHeight
    };
    return (
      <SidebarBox
        collapsible
        style={height}
        noShadow={noShadow}
        noBackground={noBackground}
        full={full}
      >
        <BoxContent
          ref={node => {
            this.node = node;
          }}
        >
          {children}
        </BoxContent>
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

function Header({ children, spaceBottom, uppercase, bold }) {
  return (
    <SidebarHeader spaceBottom={spaceBottom} uppercase={uppercase} bold={bold}>
      {children}
    </SidebarHeader>
  );
}

Header.propTypes = {
  children: PropTypes.node.isRequired,
  uppercase: PropTypes.bool,
  bold: PropTypes.bool,
  spaceBottom: PropTypes.bool
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
  noShadow: PropTypes.bool,
  noBackground: PropTypes.bool,
  full: PropTypes.bool
};

Sidebar.propTypes = propTypes;
Sidebar.Header = Header;
Sidebar.Section = Section;
Sidebar.Footer = Footer;

export default Sidebar;

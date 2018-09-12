import { Icon } from 'modules/common/components';
import { colors, dimensions } from 'modules/common/styles';
import * as React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import {
  BoxContent,
  HelperButtons,
  SidebarBox,
  SidebarFooter,
  SidebarHeader,
  SidebarMainContent,
  SidebarTitle,
  SidebarToggle
} from '../styles';

type SidebarProps = {
  children: any,
  header: any,
  footer: any,
  wide: boolean,
  full: boolean,
  half: boolean
};

type Props = {
  children: any,
  collapsible: boolean,
  className: string,
  noShadow: boolean,
  noBackground: boolean,
  full: boolean
};

type State = {
  collapse: boolean, 
  maxHeight: number
};

const SideContent = styledTS<SidebarProps>(styled.section)`
  box-sizing: border-box;
  display: flex;
  position: relative;
  flex-direction: column;
  flex-shrink: 0;
  width: ${props => (props.wide ? '360px' : '300px')};
  flex: ${props => (props.half ? '1' : 'none')};
  margin-right: ${dimensions.coreSpacing}px;
  background: ${props => (props.full ? colors.colorWhite : 'none')};
  box-shadow: ${props =>
    props.full ? `0 0 8px 1px ${colors.shadowPrimary}` : 'none'};
`;

function Sidebar({ children, wide, header, footer, half, full } : SidebarProps) {
  return (
    <SideContent half={half} wide={wide} full={full}>
      {header}
      <SidebarMainContent>{children}</SidebarMainContent>
      {footer}
    </SideContent>
  );
}

class Section extends React.Component<Props, State> {
  node: any;
  // tslint:disable-next-line:member-ordering
  static QuickButtons: ({ children }: QuickButtonProps) => JSX.Element;
  // tslint:disable-next-line:member-ordering
  static Title: ({ children }: TitleProps) => JSX.Element;

  constructor(props: Props) {
    super(props);

    this.state = { collapse: false, maxHeight: 240 };

    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.renderCollapseButton = this.renderCollapseButton.bind(this);
  }

  toggleCollapse() {
    this.setState({
      collapse: !this.state.collapse,
      maxHeight: this.state.collapse ? 240 : this.node.clientHeight + 20
    });
  }

  renderCollapseButton() {
    const icon = this.state.collapse ? 'uparrow-2' : 'downarrow';

    return (
      <SidebarToggle tabIndex={0} onClick={this.toggleCollapse}>
        <Icon icon={icon} />
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
        collapsible={collapsible}
        style={height}
        noShadow={noShadow}
        noBackground={noBackground}
        full={full}
      >
        <BoxContent
          innerRef={node => {
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

function Title({ children }: TitleProps) {
  return <SidebarTitle>{children}</SidebarTitle>;
}

type TitleProps = {
  children: any
};

function Header({ children, spaceBottom, uppercase, bold }: HeaderProps) {
  return (
    <SidebarHeader spaceBottom={spaceBottom} uppercase={uppercase} bold={bold}>
      {children}
    </SidebarHeader>
  );
}

type HeaderProps = {
  children: any,
  uppercase: boolean,
  bold: boolean,
  spaceBottom: boolean
};

function Footer({ children }: FooterProps) {
  return <SidebarFooter>{children}</SidebarFooter>;
}

type FooterProps = {
  children: any
};

function QuickButtons({ children }: QuickButtonProps) {
  return <HelperButtons>{children}</HelperButtons>;
}

type QuickButtonProps = {
  children: any
};

Section.Title = Title;
Section.QuickButtons = QuickButtons;

Sidebar.Header = Header;
Sidebar.Section = Section;
Sidebar.Footer = Footer;

export default Sidebar;

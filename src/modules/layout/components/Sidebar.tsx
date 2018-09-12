import { Icon } from 'modules/common/components';
import * as React from 'react';
import {
  BoxContent,
  HelperButtons,
  SidebarBox,
  SidebarFooter,
  SidebarHeader,
  SidebarMainContent,
  SidebarTitle,
  SidebarToggle,
  SideContent
} from '../styles';

function Title({ children }: { children: React.ReactNode }) {
  return <SidebarTitle>{children}</SidebarTitle>;
}

function QuickButtons({ children }: { children: React.ReactNode }) {
  return <HelperButtons>{children}</HelperButtons>;
}

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

class Section extends React.Component<Props, State> {
  static Title = Title;
  static QuickButtons = QuickButtons;

  node: any;

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

type HeaderProps = {
  children: any,
  uppercase?: boolean,
  bold?: boolean,
  spaceBottom?: boolean
};

function Header({ children, spaceBottom, uppercase, bold }: HeaderProps) {
  return (
    <SidebarHeader spaceBottom={spaceBottom} uppercase={uppercase} bold={bold}>
      {children}
    </SidebarHeader>
  );
}

function Footer({ children }: { children: React.ReactNode }) {
  return <SidebarFooter>{children}</SidebarFooter>;
}

type SidebarProps = {
  children: any,
  header?: any,
  footer?: any,
  wide?: boolean,
  full?: boolean,
  half?: boolean
};

export default class Sidebar extends React.Component<SidebarProps> {
  static Header = Header;
  static Section = Section;
  static Footer = Footer;

  render() {
    const { children, wide, header, footer, half, full } = this.props;

    return (
      <SideContent half={half} wide={wide} full={full}>
        {header}
        <SidebarMainContent>{children}</SidebarMainContent>
        {footer}
      </SideContent>
    );
  }
}
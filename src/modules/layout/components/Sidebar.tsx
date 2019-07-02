import { Icon } from 'modules/common/components';
import React from 'react';
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

function QuickButtons({
  children,
  isSidebarOpen
}: {
  children: React.ReactNode;
  isSidebarOpen?: boolean;
}) {
  return (
    <HelperButtons isSidebarOpen={isSidebarOpen}>{children}</HelperButtons>
  );
}

type Props = {
  children: React.ReactNode;
  collapsible?: boolean;
  className?: string;
  noShadow?: boolean;
  noBackground?: boolean;
  full?: boolean;
};

type State = {
  collapse: boolean;
  maxHeight: number;
};

class Section extends React.Component<Props, State> {
  static Title = Title;
  static QuickButtons = QuickButtons;

  node: any;

  constructor(props: Props) {
    super(props);

    this.state = { collapse: false, maxHeight: 240 };
  }

  toggleCollapse = () => {
    this.setState({
      collapse: !this.state.collapse,
      maxHeight: this.state.collapse ? 240 : this.node.clientHeight + 20
    });
  };

  renderCollapseButton = () => {
    const icon = this.state.collapse ? 'uparrow-2' : 'downarrow';

    return (
      <SidebarToggle tabIndex={0} onClick={this.toggleCollapse}>
        <Icon icon={icon} />
      </SidebarToggle>
    );
  };

  render() {
    const { children, collapsible, noShadow, noBackground, full } = this.props;

    const height = {
      maxHeight: collapsible ? this.state.maxHeight : undefined
    };

    const innerRef = node => {
      this.node = node;
    };

    return (
      <SidebarBox
        collapsible={collapsible}
        style={height}
        noShadow={noShadow}
        noBackground={noBackground}
        full={full}
      >
        <BoxContent innerRef={innerRef}>{children}</BoxContent>
        {collapsible ? this.renderCollapseButton() : null}
      </SidebarBox>
    );
  }
}

type HeaderProps = {
  children: React.ReactNode;
  uppercase?: boolean;
  bold?: boolean;
  spaceBottom?: boolean;
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
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
  full?: boolean;
  half?: boolean;
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

import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';
import {
  HelperButtons,
  SidebarBox,
  SidebarFooter,
  SidebarHeader,
  SidebarMainContent,
  SidebarTitle,
  SidebarToggle,
  SideContent
} from '../styles';
import { Column } from '@erxes/ui/src/styles/main';

function Title({
  children,
  onClick
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return <SidebarTitle onClick={onClick}>{children}</SidebarTitle>;
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
  maxHeight: number;
};

type State = {
  collapse: boolean;
};

class Section extends React.Component<Props, State> {
  static defaultProps = {
    maxHeight: 255
  };

  static Title = Title;
  static QuickButtons = QuickButtons;

  constructor(props: Props) {
    super(props);

    this.state = { collapse: false };
  }

  toggleCollapse = () => {
    this.setState({
      collapse: !this.state.collapse
    });
  };

  renderCollapseButton = () => {
    const icon = this.state.collapse ? 'angle-double-up' : 'angle-double-down';

    return (
      <SidebarToggle tabIndex={0} onClick={this.toggleCollapse}>
        <Icon icon={icon} />
      </SidebarToggle>
    );
  };

  render() {
    const {
      children,
      collapsible,
      noShadow,
      noBackground,
      full,
      maxHeight
    } = this.props;

    const style = collapsible
      ? {
          maxHeight: this.state.collapse ? undefined : maxHeight
        }
      : {};

    return (
      <SidebarBox
        collapsible={collapsible}
        style={style}
        noShadow={noShadow}
        noBackground={noBackground}
        full={full}
      >
        <Column>{children}</Column>
        {collapsible ? this.renderCollapseButton() : null}
      </SidebarBox>
    );
  }
}

type HeaderProps = {
  children: React.ReactNode;
  uppercase?: string;
  bold?: boolean;
  spaceBottom?: boolean;
  onClick?: () => void;
};

function Header({ children, spaceBottom, uppercase, bold, onClick }: HeaderProps) {
  return (
    <SidebarHeader onClick={onClick} spaceBottom={spaceBottom} uppercase={uppercase} bold={bold}>
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
  settings?: boolean;
};

export default class Sidebar extends React.Component<SidebarProps> {
  static Header = Header;
  static Section = Section;
  static Footer = Footer;

  render() {
    const { children, wide, header, footer, half, full, settings } = this.props;

    return (
      <SideContent half={half} wide={wide} full={full} settings={settings}>
        {header}
        <SidebarMainContent>{children}</SidebarMainContent>
        {footer}
      </SideContent>
    );
  }
}

import Icon from '@erxes/ui/src/components/Icon';
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

function Title({
  children,
  onClick,
  isSettings
}: {
  children: React.ReactNode;
  onClick?: () => void;
  isSettings?: boolean;
}) {
  return <SidebarTitle onClick={onClick} isSettings={isSettings}>{children}</SidebarTitle>;
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
  isSettings?: boolean;
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
      maxHeight,
      isSettings
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
        isSettings={isSettings}
      >
        <BoxContent>{children}</BoxContent>
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
  isSettings?: boolean;
};

function Header({ children, spaceBottom, uppercase, bold, isSettings }: HeaderProps) {
  return (
    <SidebarHeader isSettings={isSettings} spaceBottom={spaceBottom} uppercase={uppercase} bold={bold}>
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
  hasBorder?: boolean;
  isSettings?: boolean;
};

export default class Sidebar extends React.Component<SidebarProps> {
  static Header = Header;
  static Section = Section;
  static Footer = Footer;

  render() {
    const { children, wide, header, footer, half, full, hasBorder, isSettings } = this.props;

    return (
      <SideContent half={half} wide={wide} full={full} hasBorder={hasBorder} isSettings={isSettings}>
        {header}
        <SidebarMainContent>{children}</SidebarMainContent>
        {footer}
      </SideContent>
    );
  }
}

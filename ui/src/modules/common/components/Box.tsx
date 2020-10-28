import {
  SectionContainer,
  SidebarCollapse
} from 'modules/inbox/components/conversationDetail/sidebar/styles';
import { getConfig, setConfig } from 'modules/inbox/utils';
import Sidebar from 'modules/layout/components/Sidebar';
import React from 'react';
import Icon from './Icon';

type BoxProps = {
  title: string;
  name?: string;
  children: React.ReactNode;
  extraButtons?: React.ReactNode;
  callback?: () => void;
  collapsible?: boolean;
  isOpen?: boolean;
};

type BoxState = {
  isOpen?: boolean;
};

const STORAGE_KEY = `erxes_sidebar_section_config`;

export default class Box extends React.Component<BoxProps, BoxState> {
  constructor(props: BoxProps) {
    super(props);
    const { name, isOpen = false } = props;
    const config = getConfig(STORAGE_KEY) || {};

    this.state = {
      isOpen: name ? config[name] || isOpen : false
    };
  }

  toggle = () => {
    const { name, callback } = this.props;
    const { isOpen } = this.state;

    this.setState({ isOpen: !isOpen });

    if (name) {
      const config = getConfig(STORAGE_KEY) || {};

      config[name] = !isOpen;

      setConfig(STORAGE_KEY, config);

      return callback && callback();
    }
  };

  renderDropBtn() {
    const { isOpen } = this.state;
    const icon = isOpen ? 'angle-down' : 'angle-right';
    const { QuickButtons } = Sidebar.Section;
    const { extraButtons } = this.props;

    return (
      <>
        {isOpen && extraButtons && (
          <QuickButtons isSidebarOpen={true}>{extraButtons}</QuickButtons>
        )}
        <SidebarCollapse onClick={this.toggle}>
          <Icon icon={icon} size={16} />
        </SidebarCollapse>
      </>
    );
  }

  render() {
    const { Section } = Sidebar;
    const { Title } = Section;

    const { isOpen } = this.state;
    const { children, title, collapsible } = this.props;

    return (
      <SectionContainer>
        <Title onClick={this.toggle}>{title}</Title>
        {this.renderDropBtn()}
        {isOpen ? (
          <Section collapsible={collapsible}>{children}</Section>
        ) : null}
      </SectionContainer>
    );
  }
}

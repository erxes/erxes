import {
  SectionContainer,
  SidebarCollapse
} from 'modules/inbox/components/conversationDetail/sidebar/styles';
import Sidebar from 'modules/layout/components/Sidebar';
import React from 'react';
import Icon from './Icon';

type BoxProps = {
  title: string;
  name?: string;
  children: React.ReactNode;
  isOpen: boolean;
  toggle?: (params: { name: string; isOpen: boolean }) => void;
};

type BoxState = {
  isOpen: boolean;
};

export default class Box extends React.Component<BoxProps, BoxState> {
  constructor(props: BoxProps) {
    super(props);

    this.state = {
      isOpen: props.isOpen
    };
  }

  toggle = () => {
    const { name, toggle } = this.props;
    const { isOpen } = this.state;

    this.setState({ isOpen: !isOpen });

    if (toggle && name) {
      toggle({ name, isOpen: !isOpen });
    }
  };

  renderDropBtn() {
    const icon = this.state.isOpen ? 'downarrow' : 'rightarrow-2';

    return (
      <SidebarCollapse onClick={this.toggle}>
        <Icon icon={icon} />
      </SidebarCollapse>
    );
  }

  render() {
    const { Section } = Sidebar;
    const { Title } = Section;

    const { isOpen } = this.state;
    const { children, title } = this.props;

    if (!isOpen) {
      return (
        <SectionContainer>
          <Title>{title}</Title>
          {this.renderDropBtn()}
        </SectionContainer>
      );
    }

    return (
      <SectionContainer>
        {children}
        {this.renderDropBtn()}
      </SectionContainer>
    );
  }
}

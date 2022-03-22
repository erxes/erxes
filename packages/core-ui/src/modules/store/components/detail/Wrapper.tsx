import { FullContent, MiddleContent, Flex } from '@erxes/ui/src/styles/main';
import React from 'react';
import {
  Contents,
  HeightedWrapper,
  MainHead
} from '@erxes/ui/src/layout/styles';
import ActionBar from '@erxes/ui/src/layout/components/ActionBar';
import Header from '@erxes/ui/src/layout/components/Header';
import PageContent from '@erxes/ui/src/layout/components/PageContent';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import styled from 'styled-components';
import { colors, dimensions } from '@erxes/ui/src/styles';
import Icon from '@erxes/ui/src/components/Icon';
import Button from '../Button';

const VerticalContent = styled.div`
  display: flex;
  flex-direction: column;
  background: #fff;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  max-height: 100%;
  background: #fff;
`;

const RightSidebarWrapper = styled.div`
  margin: 0px ${dimensions.coreSpacing}px 0px 20px;
  position: relative;
  border-radius: 8px;
  border: 1px solid ${colors.borderDarker};
  width: 400px;
  margin-bottom: 20px;
  padding: 16px;
`;

const FullButton = styled.div`
  margin: 0px ${dimensions.coreSpacing}px 0px 20px;
  position: relative;
  border-radius: 8px;
  width: 400px;
  padding: 16px;
  text-align: center;
  background: ${colors.colorPrimary};
  color: ${colors.colorWhite};
`;

const Card = styled.div`
  height: 74px;
  display: flex;
  align-items: center;
`;

const MemberPic = styled.div`
  width: 40px;
  height: 40px;
  border: 2px solid ${colors.borderDarker};
  background: ${colors.colorWhite};
  border-radius: 50%;
`;

const Information = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0px 12px;
`;

const StyledHeader = styled.p`
  color: ${colors.colorPrimary};
`;

const TextwithBorder = styled.div`
  color: ${colors.colorPrimary};
  border: 1px solid ${colors.colorPrimary};
  border-radius: 30px;
  padding: 0px 8px;
`;

const Widthed = styled.div`
  width: 30px;
  height: 40px;
`;

// const Flex = styled.div`
//   dis
// `;

type Props = {
  header?: React.ReactNode;
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  actionBar?: React.ReactNode;
  content: React.ReactNode;
  footer?: React.ReactNode;
  transparent?: boolean;
  center?: boolean;
  shrink?: boolean;
  mainHead?: React.ReactNode;
};

class Wrapper extends React.Component<Props> {
  static Header = Header;
  static Sidebar = Sidebar;
  static ActionBar = ActionBar;

  renderContent() {
    const {
      actionBar,
      content,
      footer,
      transparent,
      center,
      header,
      shrink
    } = this.props;

    if (center) {
      return (
        <FullContent center={true} align={true}>
          <MiddleContent shrink={shrink} transparent={transparent}>
            <PageContent
              actionBar={actionBar}
              footer={footer}
              transparent={transparent || false}
              center={center}
            >
              {content}
            </PageContent>
          </MiddleContent>
        </FullContent>
      );
    }

    return (
      <PageContent
        actionBar={actionBar}
        footer={footer}
        transparent={transparent || false}
        header={header}
      >
        {content}
      </PageContent>
    );
  }

  renderMembers() {
    return (
      <>
        <p>Creater</p>
        <Card>
          <MemberPic />
          <Information>
            <b>B.Ariunbold</b>
            <p>A knowledge worker based in Bodrum, TR.</p>
          </Information>
        </Card>
        <p>Contributers Team Members</p>
        <Card>
          <MemberPic />
          <Information>
            <b>Myagmardorj</b>
            <p>A knowledge worker based in Bodrum, TR.</p>
          </Information>
        </Card>
        <Card>
          <MemberPic />
          <Information>
            <b>Enkhtuvshin</b>
            <p>A knowledge worker based in Bodrum, TR.</p>
          </Information>
        </Card>
      </>
    );
  }

  renderRelease() {
    return (
      <>
        <StyledHeader><b>Releases 78</b></StyledHeader>
        <Card>
          <Icon icon="flag" size={16} />
          <Information>
            <b>Release 0.23.0</b>
            <p>On Nov 3, 2020</p>
          </Information>
          {/* <Button btnStyle="simple" border round size="small">Latest</Button> */}
          <TextwithBorder>Latest</TextwithBorder>
        </Card>
        <StyledHeader>+77 release</StyledHeader>
      </>
    );
  }

  renderShare() {
    return (
      <>
        <StyledHeader><b>Share</b></StyledHeader>
        <Button btnStyle="simple" ><Icon icon="github-circled" size={16} />Github</Button>
        <Button btnStyle="simple" ><Icon icon="facebook-official" size={16} />Facebook</Button>
        <Button btnStyle="simple" ><Icon icon="twitter-alt" size={16} />Twitter</Button>
      </>
    );
  }

  renderInstalledOrganizations() {
    return (
      <>
        <StyledHeader><b>Installed organizations</b></StyledHeader>
        <Card>
          <Flex>
            <Widthed>
              <MemberPic />
            </Widthed>
            <Widthed>
              <MemberPic />
            </Widthed>
            <Widthed>
              <MemberPic />
            </Widthed>
            <Widthed>
              <MemberPic />
            </Widthed>
            <Widthed>
              <MemberPic />
            </Widthed>
            <Widthed>
              <MemberPic />
            </Widthed>
            <Widthed>
              <MemberPic />
            </Widthed>
            <Widthed>
              <MemberPic />
            </Widthed>
            <Widthed>
              <MemberPic />
            </Widthed>
            <Widthed>
              <MemberPic />
            </Widthed>
          </Flex>
          <Information>+11k</Information>
        </Card>
      </>
    );
  }

  render() {
    const { leftSidebar, mainHead } = this.props;

    return (
      <VerticalContent>
        <MainHead>{mainHead}</MainHead>
        <Content>
          <HeightedWrapper>
            <Contents>
              {leftSidebar}
              {this.renderContent()}
            </Contents>
          </HeightedWrapper>
          <VerticalContent>
            <RightSidebarWrapper>
              {this.renderMembers()}
            </RightSidebarWrapper>
            <RightSidebarWrapper>
              {this.renderRelease()}
            </RightSidebarWrapper>
            <RightSidebarWrapper>
              {this.renderShare()}
            </RightSidebarWrapper>
            <RightSidebarWrapper>
              {this.renderInstalledOrganizations()}
            </RightSidebarWrapper>
            {/* <Button><b>Add to cart</b> $24</Button> */}
            <FullButton>
              <b>Add to cart</b> $24
            </FullButton>
          </VerticalContent>
        </Content>
      </VerticalContent>
    );
  }
}

export default Wrapper;

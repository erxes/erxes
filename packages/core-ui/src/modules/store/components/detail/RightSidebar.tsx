import Icon from "@erxes/ui/src/components/Icon";
import colors from "@erxes/ui/src/styles/colors";
import Button from "../Button";
import styled from "styled-components";
import styledTS from "styled-components-ts";
import { dimensions } from "@erxes/ui/src/styles";
import { Flex } from "@erxes/ui/src/styles/main";
import React from "react";

const VerticalContent = styled.div`
  display: flex;
  flex-direction: column;
  background: #fff;
  max-height: 100%;
  overflow: auto;
`;

const RightSidebarWrapper = styled.div`
  position: relative;
  border-radius: 8px;
  border: 1px solid ${colors.borderDarker};
  width: 350px;
  margin-bottom: ${dimensions.coreSpacing}px;
  padding: ${dimensions.unitSpacing}px;
`;

const Card = styledTS<{ center?: boolean }>(styled.div)`
  display: flex;
  align-items: ${(props) => props.center && "center"};
`;

const MemberPic = styled.div`
  width: 40px;
  height: 40px;
  border: 2px solid ${colors.borderDarker};
  background: ${colors.bgMain};
  border-radius: 50%;
`;

const Information = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0px 12px;
`;

const ColorHeader = styledTS<{ size?: number }>(styled.p)`
  color: ${colors.colorPrimary};
  font-size: ${(props) => props.size && props.size}px;
`;

const TextwithBorder = styled.div`
  color: ${colors.colorPrimary};
  border: 1px solid ${colors.colorPrimary};
  border-radius: 30px;
  padding: 0px 8px;
  height: 23px;
`;

const ContainerBox = styled.div`
  width: 25px;
  height: 40px;
`;

const SmallText = styled.p`
  font-size: 11px;
`;

type Props = {
  plugin?: any;
};

export default class RightSidebar extends React.Component<Props> {
  renderMembers() {
    return (
      <RightSidebarWrapper>
        <div>Creater</div>
        <Card center={true}>
          <MemberPic />
          <Information>
            <b>B.Ariunbold</b>
            <SmallText>A knowledge worker based in Bodrum, TR.</SmallText>
          </Information>
        </Card>
        <div>Contributers Team Members</div>
        <Card center={true}>
          <MemberPic />
          <Information>
            <b>Myagmardorj</b>
            <SmallText>A knowledge worker based in Bodrum, TR.</SmallText>
          </Information>
        </Card>
        <Card center={true}>
          <MemberPic />
          <Information>
            <b>Enkhtuvshin</b>
            <SmallText>A knowledge worker based in Bodrum, TR.</SmallText>
          </Information>
        </Card>
      </RightSidebarWrapper>
    );
  }

  renderRelease() {
    return (
      <RightSidebarWrapper>
        <ColorHeader>
          <b>Releases 78</b>
        </ColorHeader>
        <Card center={false}>
          <Icon icon="flag" size={16} />
          <Information>
            Release 0.23.0
            <SmallText>On Nov 3, 2020</SmallText>
          </Information>
          <TextwithBorder>Latest</TextwithBorder>
        </Card>
        <ColorHeader size={11}>+77 release</ColorHeader>
      </RightSidebarWrapper>
    );
  }

  renderShare() {
    return (
      <RightSidebarWrapper>
        <ColorHeader>
          <b>Share</b>
        </ColorHeader>
        <Button btnStyle="simple" padding="6px">
          <Icon icon="github-circled" size={16} />
          Github
        </Button>
        <Button btnStyle="simple" padding="6px">
          <Icon icon="facebook-official" size={16} />
          Facebook
        </Button>
        <Button btnStyle="simple" padding="6px">
          <Icon icon="twitter-alt" size={16} />
          Twitter
        </Button>
      </RightSidebarWrapper>
    );
  }

  renderInstalledOrganizations() {
    const space = "\u00a0";
    return (
      <RightSidebarWrapper>
        <ColorHeader>
          <b>Installed organizations</b>
        </ColorHeader>
        <Card>
          <Flex>
            <ContainerBox>
              <MemberPic />
            </ContainerBox>
            <ContainerBox>
              <MemberPic />
            </ContainerBox>
            <ContainerBox>
              <MemberPic />
            </ContainerBox>
            <ContainerBox>
              <MemberPic />
            </ContainerBox>
            <ContainerBox>
              <MemberPic />
            </ContainerBox>
            <ContainerBox>
              <MemberPic />
            </ContainerBox>
            <ContainerBox>
              <MemberPic />
            </ContainerBox>
            <ContainerBox>
              <MemberPic />
            </ContainerBox>
            <ContainerBox>
              <MemberPic />
            </ContainerBox>
            <ContainerBox>
              <MemberPic />
            </ContainerBox>
          </Flex>
          <Information>{space}+11k</Information>
        </Card>
      </RightSidebarWrapper>
    );
  }

  render() {
    return (
      <VerticalContent>
        {this.renderMembers()}
        {this.renderRelease()}
        {this.renderShare()}
        {this.renderInstalledOrganizations()}
        <Button block padding="16px">
          <b>Add to cart</b> $24
        </Button>
      </VerticalContent>
    );
  }
}

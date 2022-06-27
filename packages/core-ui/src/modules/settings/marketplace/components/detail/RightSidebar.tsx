import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import {
  VerticalContent,
  RightSidebarWrapper,
  DetailCard,
  MemberPic,
  Information,
  SmallText,
  ColorHeader
} from '../../styles';

// const TextwithBorder = styled.div`
//   color: ${colors.colorPrimary};
//   border: 1px solid ${colors.colorPrimary};
//   border-radius: 30px;
//   padding: 0px 8px;
//   height: 23px;
// `;

// const ContainerBox = styled.div`
//   width: 25px;
//   height: 40px;
// `;

type Props = {
  plugin?: {};
};

export default class RightSidebar extends React.Component<Props> {
  renderMembers() {
    return (
      <RightSidebarWrapper>
        <ColorHeader>Creater</ColorHeader>
        <DetailCard>
          <MemberPic>
            <img src="/images/glyph_dark.png" alt="creator"></img>
          </MemberPic>
          <Information>
            <b>Erxes Inc</b>
            <SmallText withMargin>6525 Woodman Avenue, Los Angeles</SmallText>
            <SmallText>California, USA, 91401</SmallText>
            <SmallText withMargin>Tel: +1 617 506 9010</SmallText>
            <SmallText>Email: info@erxes.io</SmallText>
          </Information>
        </DetailCard>
      </RightSidebarWrapper>
    );
  }

  // renderRelease() {
  //   return (
  //     <RightSidebarWrapper>
  //       <ColorHeader>
  //         <b>Releases 78</b>
  //       </ColorHeader>
  //       <DetailCard center={false}>
  //         <Icon icon="flag" size={16} />
  //         <Information>
  //           Release 0.23.0
  //           <SmallText>On Nov 3, 2020</SmallText>
  //         </Information>
  //         <TextwithBorder>Latest</TextwithBorder>
  //       </DetailCard>
  //       <ColorHeader size={11}>+77 release</ColorHeader>
  //     </RightSidebarWrapper>
  //   );
  // }

  renderShare() {
    return (
      <RightSidebarWrapper>
        <ColorHeader>Useful links</ColorHeader>
        <Button
          href="https://github.com/erxes/erxes"
          target="_blank"
          btnStyle="simple"
        >
          <Icon icon="github-circled" size={16} />
          Github
        </Button>
        <Button
          href="https://www.facebook.com/erxesHQ"
          target="_blank"
          btnStyle="simple"
        >
          <Icon icon="facebook-official" size={16} />
          Facebook
        </Button>
        <Button
          href="https://twitter.com/erxesHQ"
          target="_blank"
          btnStyle="simple"
        >
          <Icon icon="twitter-alt" size={16} />
          Twitter
        </Button>
      </RightSidebarWrapper>
    );
  }

  // renderInstalledOrganizations() {
  //   const space = "\u00a0";
  //   return (
  //     <RightSidebarWrapper>
  //       <ColorHeader>
  //         <b>Installed organizations</b>
  //       </ColorHeader>
  //       <DetailCard>
  //         <Flex>
  //           <ContainerBox>
  //             <MemberPic />
  //           </ContainerBox>
  //           <ContainerBox>
  //             <MemberPic />
  //           </ContainerBox>
  //           <ContainerBox>
  //             <MemberPic />
  //           </ContainerBox>
  //           <ContainerBox>
  //             <MemberPic />
  //           </ContainerBox>
  //           <ContainerBox>
  //             <MemberPic />
  //           </ContainerBox>
  //           <ContainerBox>
  //             <MemberPic />
  //           </ContainerBox>
  //           <ContainerBox>
  //             <MemberPic />
  //           </ContainerBox>
  //           <ContainerBox>
  //             <MemberPic />
  //           </ContainerBox>
  //           <ContainerBox>
  //             <MemberPic />
  //           </ContainerBox>
  //           <ContainerBox>
  //             <MemberPic />
  //           </ContainerBox>
  //         </Flex>
  //         <Information>{space}+11k</Information>
  //       </DetailCard>
  //     </RightSidebarWrapper>
  //   );
  // }

  render() {
    return (
      <VerticalContent>
        {this.renderMembers()}
        {/* {this.renderRelease()} */}
        {this.renderShare()}
        {/* {this.renderInstalledOrganizations()} */}
        {/* <Button block style={{padding: "16px"}}>
          <b>Add to cart</b> $24
        </Button> */}
        <Button
          href="https://github.com/erxes/erxes/issues"
          target="_blank"
          block
          style={{ padding: '16px' }}
        >
          <b>Report an issue</b>
        </Button>
      </VerticalContent>
    );
  }
}

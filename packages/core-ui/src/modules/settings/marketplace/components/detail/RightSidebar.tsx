import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import {
  SidebarWrapper,
  SidebarBox,
  DetailCard,
  MemberPic,
  CardInformation,
  SmallText,
  ColorHeader,
  PluginContainer
} from '../../styles';

type Props = {
  plugin?: {};
};

export default class RightSidebar extends React.Component<Props> {
  renderCreator() {
    return (
      <SidebarBox>
        <ColorHeader>Creater</ColorHeader>
        <DetailCard>
          <MemberPic>
            <img src="/images/glyph_dark.png" alt="creator"></img>
          </MemberPic>
          <CardInformation>
            <b>Erxes Inc</b>
            <SmallText withMargin>6525 Woodman Avenue, Los Angeles</SmallText>
            <SmallText>California, USA, 91401</SmallText>
            <SmallText withMargin>Tel: +1 617 506 9010</SmallText>
            <SmallText>Email: info@erxes.io</SmallText>
          </CardInformation>
        </DetailCard>
      </SidebarBox>
    );
  }

  renderShare() {
    return (
      <SidebarBox>
        <ColorHeader>Useful links</ColorHeader>
        <PluginContainer>
          <Button
            href="https://github.com/erxes/erxes"
            target="_blank"
            btnStyle="simple"
          >
            <Icon icon="github-circled" size={20} />
            Github
          </Button>
          <Button
            href="https://www.facebook.com/erxesHQ"
            target="_blank"
            btnStyle="simple"
          >
            <Icon icon="facebook-official" size={20} />
            Facebook
          </Button>
          <Button
            href="https://twitter.com/erxesHQ"
            target="_blank"
            btnStyle="simple"
          >
            <Icon icon="twitter-alt" size={20} />
            Twitter
          </Button>
        </PluginContainer>
      </SidebarBox>
    );
  }

  render() {
    return (
      <SidebarWrapper>
        {this.renderCreator()}
        {this.renderShare()}
        <Button
          href="https://github.com/erxes/erxes/issues"
          target="_blank"
          block
        >
          Report an issue
        </Button>
      </SidebarWrapper>
    );
  }
}

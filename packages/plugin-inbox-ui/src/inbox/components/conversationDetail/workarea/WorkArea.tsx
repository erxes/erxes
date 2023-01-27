import { __ } from 'coreui/utils';
import ActionBar from './ActionBar';
import { ContentBox } from '@erxes/ui/src/layout/styles';
import React from 'react';
import { IConversation } from '@erxes/ui-inbox/src/inbox/types';
import { RenderConversationWrapper } from './styles';

type Props = {
  currentConversation: IConversation;
  content: any;
};
export default class WorkArea extends React.Component<Props> {
  render() {
    const { currentConversation, content } = this.props;

    return (
      <>
        <ActionBar currentConversation={currentConversation} />

        <ContentBox>
          <RenderConversationWrapper>{content}</RenderConversationWrapper>
        </ContentBox>
      </>
    );
  }
}

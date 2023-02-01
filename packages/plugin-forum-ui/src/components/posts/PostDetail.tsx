import React from 'react';
import { IPost } from '../../types';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Button from '@erxes/ui/src/components/Button';
import { Title } from '@erxes/ui-settings/src/styles';
import { FlexContent, FlexItem } from '@erxes/ui/src/layout/styles';
import {
  FlexRow,
  Subject
} from '@erxes/ui-inbox/src/settings/integrations/components/mail/styles';
import { PreviewContent } from '@erxes/ui-engage/src/styles';
import { postUsername } from '../../utils';
import Comments from '../../containers/Comments';
import { Thumbnail } from '../../styles';

type Props = {
  post: IPost;
  onDraft: () => void;
  onApproveClick: () => void;
  onDenyClick: () => void;
  onPublish: () => void;
};

function PageDetail(props: Props) {
  const { post, onDraft, onPublish, onApproveClick, onDenyClick } = props;

  const renderThumbnail = () => {
    if (post.thumbnail) {
      return (
        <>
          <Subject noBorder={true}>
            <FlexRow>
              <label>{__('Thumbnail')}</label>
            </FlexRow>
            <Thumbnail src={post.thumbnail} alt="thumbnail" />
          </Subject>
          <Subject noBorder={true}>
            <FlexRow>
              <label>{__('Thumbnail url')}</label>
            </FlexRow>
            <strong>{post.thumbnail}</strong>
          </Subject>
        </>
      );
    }

    return null;
  };

  const renderPublishButton = () => {
    if (post.state === 'DRAFT') {
      return (
        <Button onClick={onPublish} btnStyle="success" size="small">
          Publish
        </Button>
      );
    }

    return (
      <Button onClick={onDraft} btnStyle="simple" size="small">
        Turn into a draft
      </Button>
    );
  };

  const renderApproveButton = () => {
    if (post.categoryApprovalState === 'DENIED') {
      return (
        <Button btnStyle="success" size="small" onClick={onApproveClick}>
          Approve
        </Button>
      );
    }

    return (
      <Button btnStyle="warning" size="small" onClick={onDenyClick}>
        Deny
      </Button>
    );
  };

  const content = (
    <>
      <Subject>
        <FlexContent>
          <FlexItem>
            <FlexRow>
              <label>{__('State')}</label>
              <strong>{post.state}</strong>
            </FlexRow>
          </FlexItem>
          <FlexItem>
            <FlexRow>
              <label>{__('Category')}</label>
              <strong>{post.category?.name || 'No Category'}</strong>
            </FlexRow>
          </FlexItem>
        </FlexContent>
      </Subject>
      {renderThumbnail()}
      <Subject>
        <FlexContent>
          <FlexItem>
            <FlexRow>
              <label>{__('Created at')}</label>
              <strong>{post.createdAt}</strong>
            </FlexRow>
          </FlexItem>
          <FlexItem>
            <FlexRow>
              <label>{__('Created by')}</label>
              <strong>
                {postUsername({
                  post,
                  typeKey: 'createdUserType',
                  crmKey: 'createdBy',
                  cpKey: 'createdByCp'
                })}
              </strong>
            </FlexRow>
          </FlexItem>
        </FlexContent>
      </Subject>
      <Subject>
        <FlexContent>
          <FlexItem>
            <FlexRow>
              <label>{__('Updated at')}</label>
              <strong>{post.updatedAt}</strong>
            </FlexRow>
          </FlexItem>
          <FlexItem>
            <FlexRow>
              <label>{__('Updated by')}</label>
              <strong>
                {postUsername({
                  post,
                  typeKey: 'updatedUserType',
                  crmKey: 'updatedBy',
                  cpKey: 'updatedByCp'
                })}
              </strong>
            </FlexRow>
          </FlexItem>
        </FlexContent>
      </Subject>
      <Subject>
        <FlexContent>
          <FlexItem>
            <FlexRow>
              <label>{__('State changed at')}</label>
              <strong>{post.stateChangedAt}</strong>
            </FlexRow>
          </FlexItem>
          <FlexItem>
            <FlexRow>
              <label>{__('State changed by')}</label>
              <strong>
                {postUsername({
                  post,
                  typeKey: 'stateChangedUserType',
                  crmKey: 'stateChangedBy',
                  cpKey: 'stateChangedByCp'
                })}
              </strong>
            </FlexRow>
          </FlexItem>
        </FlexContent>
      </Subject>
      <Subject>
        <FlexContent>
          <FlexItem>
            <FlexRow>
              <label>{__('Up vote count')}</label>
              <strong>{post.upVoteCount}</strong>
            </FlexRow>
          </FlexItem>
          <FlexItem>
            <FlexRow>
              <label>{__('Down vote count')}</label>
              <strong>{post.downVoteCount}</strong>
            </FlexRow>
          </FlexItem>
        </FlexContent>
      </Subject>
      <Subject>
        <FlexContent>
          <FlexItem>
            <FlexRow>
              <label>{__('View count')}</label>
              <strong>{post.viewCount}</strong>
            </FlexRow>
          </FlexItem>
          <FlexItem>
            <FlexRow>
              <label>{__('Comments')}</label>
              <strong>{post.commentCount}</strong>
            </FlexRow>
          </FlexItem>
        </FlexContent>
      </Subject>
      <Subject>
        <FlexContent>
          <FlexItem>
            <FlexRow>
              <label>{__('State')}</label>
              <strong>{post.state}</strong>&nbsp;&nbsp;&nbsp;
              {renderPublishButton()}
            </FlexRow>
          </FlexItem>
          <FlexItem>
            <FlexRow>
              <label>{__('Category approval')}</label>
              <strong>{post.categoryApprovalState}</strong>&nbsp;&nbsp;&nbsp;
              {renderApproveButton()}
            </FlexRow>
          </FlexItem>
        </FlexContent>
      </Subject>
      <Subject>
        <FlexRow>
          <label>{__('Description')}</label>
        </FlexRow>
        <strong>{post.description}</strong>
      </Subject>
      <Subject>
        <FlexRow>
          <label>{__('Content')}</label>
        </FlexRow>
        <PreviewContent
          isFullmessage={true}
          showOverflow={true}
          dangerouslySetInnerHTML={{
            __html: post.content || ''
          }}
        />
      </Subject>
      <Comments postId={post._id} />
    </>
  );

  const breadcrumb = [
    { title: __('Forum Post'), link: '/forums/posts' },
    { title: post.title }
  ];

  return (
    <Wrapper
      header={<Wrapper.Header title={__('Post')} breadcrumb={breadcrumb} />}
      actionBar={
        <Wrapper.ActionBar
          left={<Title>{post.title}</Title>}
          wideSpacing={true}
        />
      }
      center={true}
      content={<DataWithLoader data={content} loading={false} />}
    />
  );
}

export default PageDetail;

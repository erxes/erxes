import React from 'react';
import { IPage } from '../../types';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { Title } from '@erxes/ui-settings/src/styles';
import { FlexContent, FlexItem } from '@erxes/ui/src/layout/styles';
import {
  FlexRow,
  Subject
} from '@erxes/ui-inbox/src/settings/integrations/components/mail/styles';
import { PreviewContent } from '@erxes/ui-engage/src/styles';
import { Thumbnail } from '../../styles';

type Props = {
  page: IPage;
};

function PageDetail(props: Props) {
  const { page } = props;

  const renderThumbnail = () => {
    if (page.thumbnail) {
      return (
        <Subject noBorder={true}>
          <FlexRow>
            <label>{__('Thumbnail')}</label>
          </FlexRow>
          <Thumbnail src={page.thumbnail} alt="thumbnail" />
        </Subject>
      );
    }

    return null;
  };

  const content = (
    <>
      <Subject>
        <FlexContent>
          <FlexItem>
            <FlexRow>
              <label>{__('Code')}</label>
              <strong>{page.code}</strong>
            </FlexRow>
          </FlexItem>
          <FlexItem>
            <FlexRow>
              <label>{__('List Order')}</label>
              <strong>{page.listOrder}</strong>
            </FlexRow>
          </FlexItem>
        </FlexContent>
      </Subject>
      {renderThumbnail()}
      <Subject noBorder={true}>
        <FlexRow>
          <label>{__('Description')}</label>
        </FlexRow>
        <strong>{page.description}</strong>
      </Subject>
      <Subject noBorder={true}>
        <FlexRow>
          <label>{__('Content')}</label>
        </FlexRow>
        <PreviewContent
          isFullmessage={true}
          showOverflow={true}
          dangerouslySetInnerHTML={{
            __html: page.content || ''
          }}
        />
      </Subject>
    </>
  );

  const breadcrumb = [
    { title: __('Forum Page'), link: '/forums/pages' },
    { title: page.title }
  ];

  return (
    <Wrapper
      header={<Wrapper.Header title={__('Pages')} breadcrumb={breadcrumb} />}
      actionBar={
        <Wrapper.ActionBar
          left={<Title>{page.title}</Title>}
          wideSpacing={true}
        />
      }
      center={true}
      content={<DataWithLoader data={content} loading={false} />}
    />
  );
}

export default PageDetail;

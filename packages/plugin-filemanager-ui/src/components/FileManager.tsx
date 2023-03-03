import React from 'react';
import { Title } from '@erxes/ui-settings/src/styles';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from 'coreui/utils';

type Props = {
  queryParams: any;
};

function FileManager({ queryParams }: Props) {
  const title = <Title capitalize={true}>{__('FileManager')}</Title>;

  const content = <div>content</div>;

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('FileManager'), link: '/documents' }
  ];

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('FileManager')} breadcrumb={breadcrumb} />
      }
      content={content}
      transparent={true}
      hasBorder
    />
  );
}

export default FileManager;

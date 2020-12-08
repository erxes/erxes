import HeaderDescription from 'modules/common/components/HeaderDescription';
import { __ } from 'modules/common/utils';
import parseMd from 'modules/common/utils/parseMd';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import styled from 'styled-components';

type Props = {
  info;
};

const Container = styled.div`
  padding: 30px;

  h2 {
    margin-top: 0;
  }

  h3 {
    font-size: 22px;
    margin-bottom: 15px;
  }

  em {
    text-transform: capitalize;
  }
`;

const ReleaseInfo = (props: Props) => {
  const releaseInfo = props.info.releaseInfo || {};

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('System status') }
  ];

  const content = (
    <Container>
      <div
        dangerouslySetInnerHTML={{
          __html: parseMd(releaseInfo.body || '')
        }}
      />
    </Container>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('Release Info')} breadcrumb={breadcrumb} />
      }
      actionBar={
        <Wrapper.ActionBar
          left={
            <HeaderDescription
              icon="/images/actions/28.svg"
              title="Release Info"
              description={`This allows you to see erxes's real-time information about releases.`}
            />
          }
        />
      }
      content={content}
      center={true}
    />
  );
};

export default ReleaseInfo;

import { IUser } from '@erxes/ui/src/auth/types';
import { __ } from '@erxes/ui/src/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { ISafeRemainder } from '../types';
import React from 'react';
import { isEnabled } from '@erxes/ui/src/utils/core';

type Props = {
  safeRemainder: ISafeRemainder;
  currentUser: IUser;
};

class CompanyDetails extends React.Component<Props> {
  render() {
    const { safeRemainder } = this.props;

    const title = 'Safe Remainder';

    const breadcrumb = [
      { title: __('Safe Remainders'), link: '/inventories/safe-remainders' },
      { title }
    ];

    const content = <></>;

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Remainder detail')}
            submenu={[
              { title: 'Live Remainders', link: '/inventories/remainders' },
              { title: 'Safe Remainders', link: '/inventories/safe-remainders' }
            ]}
            breadcrumb={breadcrumb}
          />
        }
        // header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
        content={content}
        transparent={true}
      />
    );
  }
}

export default CompanyDetails;

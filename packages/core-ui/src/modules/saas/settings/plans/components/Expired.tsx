import dayjs from 'dayjs';
import { IUser } from 'modules/auth/types';
import Button from '@erxes/ui/src/components/Button';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import WithPermission from '@erxes/ui/src/components/WithPermission';
import { FullContent, MiddleContent } from '@erxes/ui/src/styles/main';
import { getEnv, __ } from '@erxes/ui/src/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { Layout } from 'modules/layout/styles';
import { CenterContainer } from '@erxes/ui/src/components/step/preview/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import { StatusBox, StatusTitle } from '../styles';
import { IOrganization } from '../types';

type Props = {
  currentUser: IUser;
  currentOrganization: IOrganization;
  usersTotalCount: number;
  logout: () => void;
};

class Expired extends React.Component<Props> {
  render() {
    const fallbackComponent = (
      <EmptyState text="Permission denied" image="/images/actions/21.svg" />
    );

    const { logout, currentUser } = this.props;

    const expiryDate = currentUser.currentOrganization.expiryDate;

    const { CORE_URL } = getEnv();

    const content = (
      <WithPermission
        action="editOrganizationInfo"
        fallbackComponent={fallbackComponent}
      >
        <FullContent center={true}>
          <MiddleContent transparent={true}>
            <CenterContainer>
              <div style={{ textAlign: 'center' }}>
                <StatusBox largePadding={true}>
                  <StatusTitle>
                    Your current plan has expired
                    <br />
                    <br />
                    <em>{dayjs(expiryDate).format('YYYY/MM/DD')}</em>
                  </StatusTitle>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`${CORE_URL}/signin`}
                  >
                    <Button
                      btnStyle="primary"
                      icon="clipboard-notes"
                      uppercase={false}
                    >
                      Manage plan
                    </Button>
                  </a>
                  <Link to="/settings/importHistories/">
                    <Button
                      btnStyle="primary"
                      icon="clipboard-notes"
                      uppercase={false}
                    >
                      Export data
                    </Button>
                  </Link>
                  <br />
                  <br />
                  <span onClick={logout}>{__('Sign out')}</span>
                </StatusBox>
              </div>
            </CenterContainer>
          </MiddleContent>
        </FullContent>
      </WithPermission>
    );

    return (
      <Layout>
        <Wrapper content={content} transparent={true} />
      </Layout>
    );
  }
}

export default Expired;

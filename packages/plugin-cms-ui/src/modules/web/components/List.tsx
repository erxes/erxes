import React from 'react';
import { IWebSite } from '../../../types';
import {
  Container,
  EmptyState,
  EmptyText,
  EmptyTitle,
  Grid,
  Header,
  IconWrapper,
  Main,
  PageContainer,
  Subtitle,
  Title,
} from '../../../styles';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';

import { WebsiteCard } from './WebsiteCard';
import Button from '@erxes/ui/src/components/Button';
import WebsiteForm from './Form';

type Props = {
  websites: IWebSite[];
};

const List = (props: Props) => {
  const { websites } = props;
  const handleDelete = (id: string) => {};

  const trigger = (
    <Button btnStyle='success' size='small' icon='plus-circle'>
      New website
    </Button>
  );

  const formContent = (formProps) => {
    return <WebsiteForm {...formProps} />;
  };

  return (
    <Container>
      <Main>
        <PageContainer>
          <Header>
            <div>
              <Title>My Websites</Title>
              <Subtitle>
                Select a website to manage or create a new one
              </Subtitle>
            </div>
            <ModalTrigger
              size='lg'
              title='New Website'
              autoOpenKey='showWebsiteAddModal'
              trigger={trigger}
              content={formContent}
            />
          </Header>

          {websites.length > 0 ? (
            <Grid>
              {websites.map((website) => (
                <WebsiteCard
                  key={website._id}
                  website={website}
                  deleteWebsite={handleDelete}
                />
              ))}
            </Grid>
          ) : (
            <EmptyState>
              <EmptyTitle>No Websites Yet</EmptyTitle>
              <EmptyText>
                Create your first website to start building your web presence.
              </EmptyText>
              {/* <Button variant="apple" onClick={() => setIsCreateModalOpen(true)} className="flex items-center">
              <Plus className="mr-1 h-4 w-4" />
              Create Your First Website
            </Button> */}

              <ModalTrigger
                size='lg'
                title='Add page'
                autoOpenKey='showAppAddModal'
                trigger={trigger}
                content={formContent}
              />
            </EmptyState>
          )}
        </PageContainer>
      </Main>

      {/* <CreateWebsiteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      /> */}
    </Container>
  );
};

export default List;

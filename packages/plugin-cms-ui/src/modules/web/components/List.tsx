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
import { Button } from '@erxes/ui';
import { WebsiteCard } from './WebsiteCard';

type Props = {
  websites: IWebSite[];
};

const List = (props: Props) => {
  const { websites } = props;
  const handleDelete = (id: string) => {};
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
            <Button
              id='directionEdit'
              btnStyle='link'
              onClick={() => {
                console.log('Edit website');
              }}
              icon='plus'
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
                Each website can have its own posts, categories, and pages.
              </EmptyText>
              {/* <Button variant="apple" onClick={() => setIsCreateModalOpen(true)} className="flex items-center">
              <Plus className="mr-1 h-4 w-4" />
              Create Your First Website
            </Button> */}
              <Button
                id='directionEdit'
                btnStyle='link'
                onClick={() => {
                  console.log('Edit website');
                }}
                icon='plus'
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

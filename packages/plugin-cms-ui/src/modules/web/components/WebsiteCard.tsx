import { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { IWebSite } from '../../../types';
import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';

interface WebsiteCardProps {
  website: IWebSite;
  deleteWebsite: (id: string) => void;
}

const Card = styled.div<{ isSelected: boolean }>`
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid ${({ isSelected }) => (isSelected ? '#3b82f6' : '#e5e7eb')};
  background: ${({ isSelected }) => (isSelected ? '#eff6ff' : '#ffffff')};
  transition: all 0.2s;
  cursor: pointer;
  box-shadow: ${({ isSelected }) =>
    isSelected ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none'};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 8px;
`;

const Title = styled.h3`
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 4px;
`;

const Description = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  margin-top: 16px;
  border-top: 1px solid #f3f4f6;
`;

export function WebsiteCard({ website, deleteWebsite }: WebsiteCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  //   const { selectedWebsiteId, setSelectedWebsiteId } = useSelectedWebsite();
  const [selectedWebsiteId, setSelectedWebsiteId] = useState('');
  //   const { deleteWebsite } = useStore();

  const isSelected = selectedWebsiteId === website._id;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      confirm(
        'Are you sure you want to delete this website? All content will be permanently removed.'
      )
    ) {
      deleteWebsite(website._id);
    }
  };

  const handleSelect = () => {
    if (!isSelected) {
      setSelectedWebsiteId(website._id);
    }
  };

  return (
    <Card
      isSelected={isSelected}
      onClick={handleSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className='p-5'>
        <Header>
          <Title>{website.name}</Title>
          <div
            style={{
              display: isHovered || isSelected ? 'flex' : 'none',
              gap: '4px',
            }}
          >
            <Button
              id='directionEdit'
              btnStyle='link'
              onClick={() => {
                console.log('Edit website');
              }}
              icon='edit'
            />
            <Button
              id='directionEdit'
              btnStyle='link'
              onClick={() => {}}
              icon='trash-alt'
            />
          </div>
        </Header>
        <Description>
          {website.description || 'No description provided'}
        </Description>
        <Footer>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            Created: {new Date(website.createdAt || '').toLocaleDateString()}
          </span>
          <Link
            to={`/website/${website._id}/posts`}
            style={{ fontSize: '0.75rem', fontWeight: 500, color: '#3b82f6' }}
          >
            Manage <Icon icon="comment-plus" />
          </Link>
        </Footer>
      </div>
    </Card>
  );
}

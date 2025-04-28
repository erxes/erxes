import { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { IWebSite } from '../../../types';
import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import { ActionButton } from '@erxes/ui/src/components/ActionButtons';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils/core';
import { useNavigate } from 'react-router-dom';

interface WebsiteCardProps {
  website: IWebSite;
  deleteWebsite: (id: string) => void;
}

const Card = styled.div`
  padding: 16px;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  transition: all 0.2s;
  cursor: pointer;
  box-shadow: none;

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
  overflow: hidden;
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
  const navigate = useNavigate();

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

  return (
    <Card
      // isSelected={isSelected}
      onClick={() => {
        navigate(`/cms/website/${website._id}/posts`);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Header>
        <Title>{website.name}</Title>
        <div
          style={{
            display: isHovered ? 'flex' : 'none',
            //   gap: '4px',
            justifyContent: 'flex-end',
          }}
        >
          <ActionButton>
            <Tip text={__('Edit')} placement='top'>
              <Button
                id='websiteEdit'
                btnStyle='link'
                onClick={() => {
                  // http://localhost:3000/settings/business-portal/client?_id=kWKLaHhRFgX9Sje0dAfsp
                  navigate(
                    `/settings/business-portal/${website.kind}?_id=${website._id}`
                  );
                }}
                icon='edit'
              />
            </Tip>
            <Tip text={__('Delete')} placement='top'>
              <Button
                id='websiteDelete'
                btnStyle='link'
                onClick={() => {}}
                icon='trash-alt'
              />
            </Tip>
          </ActionButton>
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
          to={`/cms/website/${website._id}/posts`}
          style={{ fontSize: '0.75rem', fontWeight: 500, color: '#3b82f6' }}
        >
          Manage <Icon icon='edit-3' />
        </Link>
      </Footer>
    </Card>
  );
}

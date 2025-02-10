import React, { useState } from 'react';
import styled from 'styled-components';
import { __ } from '@erxes/ui/src/utils/core';

const Container = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  font-family: Arial, sans-serif;
  font-size: 14px;
`;

const StyledLink = styled.a`
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background-color: #f5f5f5;
  transition: background-color 0.3s, color 0.3s;

  &:hover {
    background-color: #007bff;
    color: white;
    text-decoration: none;
  }
`;

const NameDisplay = styled.span`
  font-weight: bold;
  color: #333;
`;

const SeeMoreButton = styled.button`
  background: none;
  border: none;
  color: #007bff;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  padding: 0;
  margin-left: 0.5rem;

  &:hover {
    text-decoration: underline;
  }
`;

type Props = {
  PostInfo: {
    permalink_url: string;
    content: string;
  };
};

export default function Post({ PostInfo }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const MAX_LENGTH = 50; 

  const truncatedContent =
    PostInfo.content.length > MAX_LENGTH && !isExpanded
      ? `${PostInfo.content.slice(0, MAX_LENGTH)}...`
      : PostInfo.content;

  return (
    <Container>
      <StyledLink href={PostInfo.permalink_url} target="_blank" rel="noreferrer">
        {__('Go to Post')}
      </StyledLink>
      <NameDisplay>
        {truncatedContent}
        {PostInfo.content.length > MAX_LENGTH && (
          <SeeMoreButton onClick={toggleExpanded}>
            {isExpanded ? __('See less') : __('See more')}
          </SeeMoreButton>
        )}
      </NameDisplay>
    </Container>
  );
}

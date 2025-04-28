import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f9fafb;
`;

const Main = styled.main`
  flex-grow: 1;
  padding-bottom: 4rem;
  animation: fade-in 0.3s ease-in-out;
`;

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
`;

const Subtitle = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const EmptyState = styled.div<{ $border?: boolean }>`
  background: white;
  border:${({ $border }) => ($border ? '1px solid #e5e7eb' : 'none')};
  border-radius: 8px;
  padding: 3rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const IconWrapper = styled.div`
  background: #f3f4f6;
  padding: 0.75rem;
  border-radius: 50%;
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: medium;
  color: #111827;
  margin-bottom: 0.5rem;
`;

const EmptyText = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  max-width: 400px;
  margin-bottom: 1.5rem;
`;

export {
  Container,
  Main,
  PageContainer,
  Header,
  Title,
  Subtitle,
  Grid,
  EmptyState,
  IconWrapper,
  EmptyTitle,
  EmptyText,
};

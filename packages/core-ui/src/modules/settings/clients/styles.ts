import { styled } from 'styled-components';

const Card = styled.div`
  border: 1px solid #ddd;
  padding: 16px;
  border-radius: 8px;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`;

const IpList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const IpItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background-color: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 8px;
`;

const CredentialsRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

export { Card, InputContainer, IpList, IpItem, CredentialsRow };

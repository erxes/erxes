import { Button, Skeleton, useQueryState } from 'erxes-ui';
import { useUsedIntegrationTypes } from '../hooks/useUsedIntegrationTypes';
import { IIntegrationType } from '../types/Integration';
import { IconCheck } from '@tabler/icons-react';

export const ChooseIntegrationTypeContent = () => {
  const { integrationTypes, loading } = useUsedIntegrationTypes();

  if (loading) return <Skeleton className="w-32 h-4 mt-1" />;

  return integrationTypes?.map((integrationType: IIntegrationType) => (
    <IntegrationTypeItem key={integrationType._id} {...integrationType} />
  ));
};

export const IntegrationTypeItem = ({ _id, name }: IIntegrationType) => {
  const [integrationType, setIntegrationType] =
    useQueryState<string>('integrationType');

  const isActive = integrationType === _id;

  const handleClick = () => {
    setIntegrationType(_id === integrationType ? null : _id);
  };

  return (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      className="justify-start pl-7 relative overflow-hidden text-left flex-auto"
      onClick={handleClick}
    >
      {isActive && <IconCheck className="absolute left-1.5" />}
      {name}
    </Button>
  );
};

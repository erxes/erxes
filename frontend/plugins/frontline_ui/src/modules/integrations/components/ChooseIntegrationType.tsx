import {
  Button,
  cn,
  Skeleton,
  TextOverflowTooltip,
  useQueryState,
} from 'erxes-ui';
import { useUsedIntegrationTypes } from '../hooks/useUsedIntegrationTypes';
import { IIntegrationType } from '../types/Integration';
import { IntegrationType } from '@/types/Integration';
import { FacebookPostSheet } from '../facebook/components/FacebookPostSheet';
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

  const canCreatePost = _id === IntegrationType.FACEBOOK_POST;

  const trigger = (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      className={cn(
        'justify-start pl-7 relative overflow-hidden text-left flex-auto',
        canCreatePost && 'bg-transparent hover:bg-transparent',
      )}
      onClick={handleClick}
    >
      {isActive && <IconCheck className="absolute left-1.5" />}
      <TextOverflowTooltip value={name} />
    </Button>
  );

  if (!canCreatePost) {
    return trigger;
  }

  return (
    <div
      className={cn(
        'group/integration-type flex items-center w-full rounded-md pr-1',
        isActive ? 'bg-secondary' : 'hover:bg-accent',
      )}
    >
      {trigger}
      <div className="invisible shrink-0 group-hover/integration-type:visible focus-within:visible">
        <FacebookPostSheet />
      </div>
    </div>
  );
};

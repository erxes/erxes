import { Avatar, Skeleton, readImage } from 'erxes-ui';
import { IconRobot, IconUser } from '@tabler/icons-react';
import { createContext, ReactNode, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { IUser, useMemberInline } from 'ui-modules';

interface ActivityActorContextValue {
  isSystem: boolean;
  loading: boolean;
  user?: IUser;
}

const ActivityActorContext = createContext<ActivityActorContextValue | null>(
  null,
);

const useActivityActorContext = () => {
  const context = useContext(ActivityActorContext);

  if (!context) {
    throw new Error(
      'ActivityActor components must be used within ActivityActor.Provider',
    );
  }

  return context;
};

const ActivityActorProvider = ({
  actorId,
  children,
}: {
  actorId?: string;
  children: ReactNode;
}) => {
  const isSystem = actorId === 'system';
  const { userDetail, loading } = useMemberInline({
    variables: { _id: actorId },
    skip: !actorId || isSystem,
    fetchPolicy: 'cache-and-network',
  });

  return (
    <ActivityActorContext.Provider
      value={{ isSystem, loading, user: userDetail }}
    >
      {children}
    </ActivityActorContext.Provider>
  );
};

const ActivityActorAvatar = () => {
  const { isSystem, loading, user } = useActivityActorContext();
  const fullName = user?.details?.fullName;
  const avatar = user?.details?.avatar;

  if (isSystem) {
    return (
      <div className="size-5 rounded-full bg-muted flex items-center justify-center">
        <IconRobot className="size-3 text-muted-foreground" />
      </div>
    );
  }

  if (loading) {
    return <Skeleton className="size-5 rounded-full" />;
  }

  if (!user) {
    return (
      <div className="size-5 rounded-full bg-muted flex items-center justify-center">
        <IconUser className="size-3 text-muted-foreground" />
      </div>
    );
  }

  return (
    <Avatar className="size-5">
      {avatar && (
        <Avatar.Image src={readImage(avatar, 200)} alt={fullName || ''} />
      )}
      <Avatar.Fallback className="text-[10px]">
        {fullName?.charAt(0) || <IconUser className="size-3" />}
      </Avatar.Fallback>
    </Avatar>
  );
};

const ActivityActorName = () => {
  const { t } = useTranslation('operation');
  const { isSystem, loading, user } = useActivityActorContext();

  if (isSystem) {
    return <span className="text-accent-foreground">{t('system')}</span>;
  }

  if (loading) {
    return <Skeleton className="h-4 w-20" />;
  }

  return (
    <span className="text-accent-foreground">
      {user?.details?.fullName || t('unknown')}
    </span>
  );
};

export const ActivityActor = Object.assign(ActivityActorProvider, {
  Provider: ActivityActorProvider,
  Avatar: ActivityActorAvatar,
  Name: ActivityActorName,
});

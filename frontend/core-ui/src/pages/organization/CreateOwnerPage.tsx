import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { currentOrganizationState } from 'ui-modules';

import { isDefined } from 'erxes-ui';

import { CreateOwner } from '@/organization/owner/components/CreateOwner';
import { AppPath } from '@/types/paths/AppPath';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

const CreateOwnerPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('organization', { keyPrefix: 'create-owner' });
  const [currentOrganization] = useAtom(currentOrganizationState);

  useEffect(() => {
    if (isDefined(currentOrganization) && currentOrganization.hasOwner) {
      navigate(AppPath.Index);
    }
  }, [currentOrganization, navigate]);

  return (
    <div className="flex items-center justify-center my-40">
      <div className="motion-preset-slide-down-md grid gap-5">
        <div className="flex flex-col items-center gap-2">
          <h2 className="font-semibold text-2xl">
            {t('initial-configuration-steps')}
          </h2>
          <p className="text-xs text-muted-foreground">{t('fill-out-form')}</p>
        </div>
        <CreateOwner />
      </div>
    </div>
  );
};

export default CreateOwnerPage;

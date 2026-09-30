import { useConfirm } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { getProfileUrl } from '../../scores/components/ScoreMoreColumn';
import { ILoyaltyAccount } from '../types';
import { useLoyaltyAccountFreeze } from './useLoyaltyAccountFreeze';

export const useLoyaltyAccountRowActions = (account: ILoyaltyAccount) => {
  const { t } = useTranslation('loyalty');
  const { confirm } = useConfirm();
  const navigate = useNavigate();
  const { unfreeze, loading } = useLoyaltyAccountFreeze();
  const [menuOpen, setMenuOpen] = useState(false);
  const [freezeOpen, setFreezeOpen] = useState(false);
  const { _id, number, ownerId, ownerType, status } = account;

  const run = (action: () => void) => () => {
    setMenuOpen(false);
    action();
  };

  return {
    menuOpen,
    setMenuOpen,
    freezeOpen,
    setFreezeOpen,
    loading,
    isFrozen: status === 'frozen',
    hasOwner: !!ownerId && !!ownerType,
    toggleFreeze: run(() =>
      status === 'frozen'
        ? confirm({
            message: t('loyalty-account-unfreeze-confirm', { number }),
          }).then(() => unfreeze(_id))
        : setFreezeOpen(true),
    ),
    openScoreHistory: run(() =>
      navigate(
        `/loyalty/scores?scoreOwnerType=${ownerType}&scoreOwnerId=${ownerId}`,
      ),
    ),
    openProfile: run(() =>
      navigate(getProfileUrl(ownerId || '', ownerType || '')),
    ),
  };
};

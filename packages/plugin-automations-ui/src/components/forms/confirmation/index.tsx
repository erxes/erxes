import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Alert from '@erxes/ui/src/utils/Alert';

type Props = {
  when: boolean;
  children: (
    showModal: boolean,
    onConfirm: () => void,
    onCancel: () => void
  ) => React.ReactNode;
  queryParams: any;
  id: string;
  name: string;
  save: () => void;
  removeAutomations: (
    doc: { automationIds: string[] },
    navigateToNextLocation: () => void
  ) => void;
};

const Confirmation: React.FC<Props> = ({
  when,
  children,
  queryParams,
  id,
  name,
  save,
  removeAutomations
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [nextLocation, setNextLocation] = useState<any>({});
  const [showModal, setShowModal] = useState(false);
  const [isConfirm, setIsConfirm] = useState(false);

  useEffect(() => {
    const unblock = () => {
      if (
        when &&
        nextLocation.pathname &&
        nextLocation.pathname !== location.pathname
      ) {
        setShowModal(true);
        setNextLocation(nextLocation);
        return false; // Guard against navigation
      }
      return true; // Allow navigation
    };

    return () => {
      unblock();
    };
  }, [when, location, nextLocation]);

  const onCancel = () => {
    if (queryParams.isCreate) {
      removeAutomations({ automationIds: [id] }, navigateToNextLocation);
    } else {
      navigateToNextLocation();
    }
  };

  const onConfirm = () => {
    if (!name || name === 'Your automation title') {
      Alert.error('Enter an Automation title');
      return setShowModal(false);
    } else {
      setIsConfirm(true);
      return navigateToNextLocation();
    }
  };

  const navigateToNextLocation = () => {
    if (queryParams.isCreate && isConfirm && name) {
      save();
    }

    if (!queryParams.isCreate && isConfirm) {
      save();
    }

    navigate(nextLocation.pathname);
  };

  return children(showModal, onConfirm, onCancel);
};

export default Confirmation;

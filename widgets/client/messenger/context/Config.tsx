import * as React from 'react';
import { useEffect, useState, useContext, createContext } from 'react';
import { connection } from '../connection';
import { getLocalStorageItem } from '../../common';
import { useMutation } from '@apollo/react-hooks';
import { CHANGE_CONVERSATION_OPERATOR } from '../graphql/mutations';

interface ConfigContextType {
  selectedSkill: string | null;
  isInputDisabled: boolean;
  isLoggedIn: () => boolean;
  setIsInputDisabled: (bool: boolean) => void;
  setSelectedSkill: (skill: string) => void;
  setIsAttachingFile: (bool: boolean) => void;
  onSelectSkill: (skillId: string) => void;
  changeOperatorStatus: (
    _id: string,
    operatorStatus: string,
    callback: () => void
  ) => void;
  isAttachingFile: boolean;
  headHeight: number;
  setHeadHeight: (height: number) => void;
}
const ConfigContext = createContext<ConfigContextType>({} as ConfigContextType);

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [headHeight, setHeadHeight] = useState(200);
  const [selectedSkill, setSelectedSkill] = useState<string>('');

  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [isAttachingFile, setIsAttachingFile] = useState(false);

  useEffect(() => {
    const { messengerData } = connection.data;
    const { requireAuth, showChat, skillData = {} } = messengerData;

    const { options = [] } = skillData;

    if (options.length > 0) {
      setIsInputDisabled(true);
    }
  }, []);

  const [mutateChangeConversationOperator, { data, loading, error }] =
    useMutation(CHANGE_CONVERSATION_OPERATOR);

  const isLoggedIn = () => {
    const { email, phone }: any = connection.setting;

    return email || phone || getLocalStorageItem('getNotifiedType');
  };

  const onSelectSkill = (skillId: string) => {
    setSelectedSkill(skillId);
    setIsInputDisabled(false);
  };

  const changeOperatorStatus = async (
    _id: string,
    operatorStatus: string,
    callback: () => void
  ) => {
    await mutateChangeConversationOperator({
      variables: {
        _id,
        operatorStatus,
      },
    });
    if (callback) {
      callback();
    }
  };

  return (
    <ConfigContext.Provider
      value={{
        selectedSkill,
        isLoggedIn,
        setIsInputDisabled,
        setSelectedSkill,
        setIsAttachingFile,
        onSelectSkill,
        changeOperatorStatus,
        isAttachingFile,
        isInputDisabled,
        setHeadHeight,
        headHeight,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);

const PROCESS_ID_STORAGE_KEY = 'processId';
export const PROCESS_ID_CHANGED_EVENT = 'erxes-process-id-changed';

export const getCurrentProcessId = () =>
  sessionStorage.getItem(PROCESS_ID_STORAGE_KEY) || '';

export const setCurrentProcessId = (processId: string) => {
  sessionStorage.setItem(PROCESS_ID_STORAGE_KEY, processId);
  window.dispatchEvent(new Event(PROCESS_ID_CHANGED_EVENT));
};

export const generateCurrentProcessId = () => {
  const processId = Math.random().toString();
  setCurrentProcessId(processId);

  return processId;
};

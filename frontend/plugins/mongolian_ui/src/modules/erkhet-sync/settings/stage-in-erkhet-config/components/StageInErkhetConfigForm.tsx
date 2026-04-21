import { ConfigForm } from './ConfigForm';

export const StageInErkhetConfigForm = () => {
  return (
    <div className="h-full w-full mx-auto max-w-6xl px-9 py-5 overflow-y-auto">
      <ConfigForm configCode="ebarimtConfig" />
    </div>
  );
};

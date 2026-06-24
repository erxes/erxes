import { useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  emPreviewTabAtom,
  emPreviewWebsiteAppHeaderTitle,
  emPreviewWebsiteAppUrl,
} from '../states/emPreviewStates';
import { IconArrowLeft } from '@tabler/icons-react';

export const EMPreviewWebsiteApp = () => {
  const { t } = useTranslation('frontline');
  const url = useAtomValue(emPreviewWebsiteAppUrl);
  const title = useAtomValue(emPreviewWebsiteAppHeaderTitle);
  const setActiveTab = useSetAtom(emPreviewTabAtom);

  if (!url) {
    return <div>{t('loading-communication-portal')}</div>;
  }

  return (
    <div className="flex flex-col h-full min-h-full">
      <div className="flex-1 overflow-y-auto hide-scroll min-h-0 bg-muted flex flex-col">
        <div className="pb-5.5 px-5 pt-4.5 bg-primary flex-none relative">
          <button
            onClick={() => setActiveTab('default')}
            className="text-primary-foreground cursor-pointer"
          >
            <IconArrowLeft size={24} />
          </button>
          <h1 className="text-primary-foreground text-2xl">
            {title || t('schedule-a-call')}
          </h1>
        </div>
        <div className="relative flex-1 h-full overflow-y-auto hide-scroll p-0">
          <iframe
            title="web-call"
            src={url}
            sandbox="allow-scripts allow-same-origin"
            className="*:hide-scroll! bg-transparent!"
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
};

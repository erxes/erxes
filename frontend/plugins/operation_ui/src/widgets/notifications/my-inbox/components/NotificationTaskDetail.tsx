import { isRecord } from '@/operation/utils/isRecord';
import { TaskDetails } from '@/task/components/detail/TaskDetails';
import { TaskDetailSheet } from '@/task/components/TaskDetailSheet';
import { useGetTask } from '@/task/hooks/useGetTask';
import { useGetTriage } from '@/triage/hooks/useGetTriage';
import { IconExternalLink } from '@tabler/icons-react';
import { Button, FocusSheet } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { TaskSideWidgets } from '~/widgets/relation/TaskSideWidgets';

const SCROLL_VIEWPORT_SELECTOR = '[data-radix-scroll-area-viewport]';

const useScrollViewportHeight = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();

  useEffect(() => {
    const viewport = ref.current?.closest(SCROLL_VIEWPORT_SELECTOR);

    if (!viewport) {
      return;
    }

    const observer = new ResizeObserver(() => setHeight(viewport.clientHeight));

    observer.observe(viewport);

    return () => observer.disconnect();
  }, []);

  return { ref, height };
};

export const NotificationTaskDetail = ({
  contentTypeId,
  showOpenTask,
}: {
  contentTypeId: string;
  showOpenTask: boolean;
}) => {
  const { t } = useTranslation('operation');
  const { task, loading: loadingTask } = useGetTask(contentTypeId);
  const { triage } = useGetTriage(contentTypeId, {
    skip: loadingTask || !!task,
  });
  const { ref, height } = useScrollViewportHeight();
  const sideContentId = task?._id ?? triage?._id;

  return (
    <div ref={ref} className="flex w-full lg:min-h-dvh">
      <TaskDetailSheet />
      <div className="min-w-0 flex-1">
        {showOpenTask && (
          <div className="mx-auto flex max-w-3xl justify-end px-6 pt-6">
            <Button variant="secondary" asChild>
              <Link to={`/operation/tasks/${contentTypeId}`}>
                <IconExternalLink className="size-4" />
                {t('open-task', 'Open task')}
              </Link>
            </Button>
          </div>
        )}
        <div className="mx-auto w-full p-6 xl:max-w-3xl">
          <TaskDetails taskId={contentTypeId} checkTriage={true} />
        </div>
      </div>
      {sideContentId && !!height && (
        <div
          className="sticky top-0 flex shrink-0 self-start"
          style={{ height }}
        >
          <FocusSheet>
            <TaskSideWidgets
              contentId={sideContentId}
              propertiesData={
                task?.propertiesData && isRecord(task.propertiesData)
                  ? task.propertiesData
                  : undefined
              }
            />
          </FocusSheet>
        </div>
      )}
    </div>
  );
};

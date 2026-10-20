import { IProject } from '@/project/types';
import { TAddTask } from '@/task/types';
import {
  IconCaretLeftRight,
  IconListCheck,
  IconPlus,
} from '@tabler/icons-react';
import { Button, cn, Sheet, Spinner, Tooltip } from 'erxes-ui';
import { lazy, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Can } from 'ui-modules';

const AddTaskForm = lazy(() =>
  import('@/task/components/add-task/AddTaskForm').then((module) => ({
    default: module.AddTaskForm,
  })),
);
const AddTriageForm = lazy(() =>
  import('@/triage/components/add-triage/AddTriageForm').then((module) => ({
    default: module.AddTriageForm,
  })),
);

interface AddTaskRelationProps {
  onComplete: (id: string, projectId?: string) => Promise<boolean>;
  project?: IProject;
  showText?: boolean;
}

export const AddTaskRelation = ({
  onComplete,
  project,
  showText = false,
}: AddTaskRelationProps) => {
  const { t } = useTranslation('operation');
  const [mode, setMode] = useState<'task' | 'triage'>();
  const [created, setCreated] = useState<{ id: string; projectId?: string }>();
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const close = () => {
    if (saving) return;
    setMode(undefined);
    setCreated(undefined);
    setFailed(false);
  };

  const connect = async (id: string, projectId?: string) => {
    setCreated({ id, projectId });
    setSaving(true);
    setFailed(false);
    const connected = await onComplete(id, projectId);
    setSaving(false);
    if (connected) {
      setMode(undefined);
      setCreated(undefined);
    } else {
      setFailed(true);
    }
  };

  const initialValues: Partial<TAddTask> = project
    ? {
        projectId: project._id,
        ...(project.teamIds?.[0] ? { teamId: project.teamIds[0] } : {}),
      }
    : {};

  return (
    <Can actions={['taskCreate', 'triageCreate']}>
      <Tooltip.Provider>
        <div
          className={cn(
            'flex shrink-0',
            showText ? 'flex-col items-center gap-4' : 'items-center gap-2',
          )}
        >
          <Can action="taskCreate">
            <Tooltip>
              <Tooltip.Trigger asChild>
                <Button
                  size={showText ? 'default' : 'icon'}
                  variant={showText ? 'default' : 'ghost'}
                  aria-label={t('add-task')}
                  onClick={() => setMode('task')}
                >
                  {showText ? (
                    <>
                      <IconPlus /> {t('add-task')}
                    </>
                  ) : (
                    <IconListCheck />
                  )}
                </Button>
              </Tooltip.Trigger>
              {!showText && <Tooltip.Content>{t('add-task')}</Tooltip.Content>}
            </Tooltip>
          </Can>
          <Can action="triageCreate">
            <Tooltip>
              <Tooltip.Trigger asChild>
                <Button
                  size={showText ? 'sm' : 'icon'}
                  variant={showText ? 'secondary' : 'ghost'}
                  aria-label={t('add-triage')}
                  onClick={() => setMode('triage')}
                >
                  {showText ? (
                    <>
                      <IconPlus /> {t('add-triage')}
                    </>
                  ) : (
                    <IconCaretLeftRight />
                  )}
                </Button>
              </Tooltip.Trigger>
              {!showText && (
                <Tooltip.Content>{t('add-triage')}</Tooltip.Content>
              )}
            </Tooltip>
          </Can>
        </div>
      </Tooltip.Provider>
      <Sheet open={!!mode} onOpenChange={(open) => !open && close()}>
        <Sheet.View className="sm:max-w-3xl w-full p-0">
          {created ? (
            <>
              <Sheet.Header>
                <Sheet.Title>{t('tasks-and-triages')}</Sheet.Title>
              </Sheet.Header>
              <Sheet.Content className="p-6">
                {saving && <Spinner containerClassName="py-6" />}
                {failed && (
                  <div className="space-y-4" role="alert">
                    <p>
                      {t('record-created-connection-failed', {
                        defaultValue:
                          'The record was created, but could not be linked. Retry the connection without creating another record.',
                      })}
                    </p>
                    <Button
                      onClick={() =>
                        void connect(created.id, created.projectId)
                      }
                    >
                      {t('retry', { defaultValue: 'Retry' })}
                    </Button>
                    <Button variant="secondary" onClick={close}>
                      {t('close', { defaultValue: 'Close' })}
                    </Button>
                  </div>
                )}
              </Sheet.Content>
            </>
          ) : (
            <Suspense fallback={<Spinner containerClassName="py-20" />}>
              {mode === 'task' && (
                <AddTaskForm
                  initialValues={initialValues}
                  onClose={close}
                  onComplete={(id) => void connect(id)}
                />
              )}
              {mode === 'triage' && (
                <AddTriageForm
                  initialTeamId={project?.teamIds?.[0] ?? undefined}
                  onComplete={(id) => void connect(id, project?._id)}
                />
              )}
            </Suspense>
          )}
        </Sheet.View>
      </Sheet>
    </Can>
  );
};

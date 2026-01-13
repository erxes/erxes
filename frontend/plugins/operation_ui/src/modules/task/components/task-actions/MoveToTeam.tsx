import { useApolloClient } from '@apollo/client';
import { useProjects } from '@/project/hooks/useGetProjects';
import { useUpdateProject } from '@/project/hooks/useUpdateProject';
import { useUpdateTask } from '@/task/hooks/useUpdateTask';
import { useGetTeams } from '@/team/hooks/useGetTeams';
import { IconAlertTriangle, IconUsersGroup } from '@tabler/icons-react';
import {
  Button,
  Command,
  Dialog,
  IconComponent,
  RecordTable,
  useToast,
} from 'erxes-ui';
import { createContext, useContext, useMemo, useState } from 'react';

interface MoveToTeamContextType {
  tasks: {
    taskId: string;
    projectId: string | null;
  }[];
  moveTasksToTeam: (
    taskIds: string[],
    teamId: string,
    options?: { clearProject?: boolean },
  ) => Promise<void>;
  loading: boolean;
}

export const MoveToTeamContext = createContext<MoveToTeamContextType | null>(
  null,
);

export const useMoveToTeamContext = () => {
  const context = useContext(MoveToTeamContext);
  if (!context) {
    throw new Error(
      'useMoveToTeamContext must be used within MoveToTeamProvider',
    );
  }
  return context;
};

export const MoveToTeamProvider = ({
  children,
  tasks,
}: {
  children: React.ReactNode;
  tasks: {
    taskId: string;
    projectId: string | null;
  }[];
}) => {
  const { updateTask } = useUpdateTask();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const client = useApolloClient();

  const handleMoveToTeam = async (
    taskIds: string[],
    teamId: string,
    options?: { clearProject?: boolean },
  ) => {
    if (taskIds.length === 0) return;

    setLoading(true);
    try {
      await Promise.all(
        taskIds.map((taskId) =>
          updateTask({
            variables: {
              _id: taskId,
              teamId,
              ...(options?.clearProject ? { projectId: null } : {}),
            },
          }),
        ),
      );

      toast({
        title: 'Success',
        description: `Successfully moved ${taskIds.length} ${
          taskIds.length === 1 ? 'task' : 'tasks'
        } to team.`,
        variant: 'default',
      });
      client.refetchQueries({ include: ['GetTasks'] });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MoveToTeamContext.Provider
      value={{ tasks, moveTasksToTeam: handleMoveToTeam, loading }}
    >
      {children}
    </MoveToTeamContext.Provider>
  );
};

export const TaskMoveToTeamContent = ({
  setOpen,
  currentTeamId,
}: {
  setOpen: (open: boolean) => void;
  currentTeamId?: string;
}) => {
  const { tasks, moveTasksToTeam, loading } = useMoveToTeamContext();
  const { teams, loading: teamsLoading } = useGetTeams();
  const { table } = RecordTable.useRecordTable();

  const { projects } = useProjects({
    variables: { _ids: tasks?.map((t) => t.projectId) },
    skip: !tasks || tasks.every((t) => !t.projectId),
  });

  const projectsById = useMemo(() => {
    if (!projects)
      return new Map<
        string,
        { _id: string; name: string; teamIds?: string[] }
      >();

    return new Map(
      projects.map((project) => [
        project._id,
        {
          _id: project._id,
          name: project.name,
          teamIds: project.teamIds || [],
        },
      ]),
    );
  }, [projects]);

  const [conflictDialog, setConflictDialog] = useState<{
    open: boolean;
    targetTeamId: string;
    targetTeamName: string;
    conflictingProjects: Array<{
      projectId: string;
      projectName: string;
      taskIds: string[];
    }>;
  } | null>(null);

  const handleSelectTeam = async (teamId: string, teamName: string) => {
    if (!tasks || tasks.length === 0) {
      setOpen(false);
      return;
    }

    const movableTaskIds: string[] = [];
    const conflictingProjectsMap = new Map<
      string,
      {
        projectId: string;
        projectName: string;
        taskIds: string[];
        teamIds?: string[];
      }
    >();

    tasks.forEach((task) => {
      if (!task.projectId) {
        movableTaskIds.push(task.taskId);
        return;
      }

      const project = projectsById.get(task.projectId) || {
        _id: task.projectId,
        name: 'Unknown project',
        teamIds: [],
      };
      const projectTeamIds = project.teamIds || [];

      if (projectTeamIds.includes(teamId)) {
        movableTaskIds.push(task.taskId);
        return;
      }

      if (!conflictingProjectsMap.has(project._id)) {
        conflictingProjectsMap.set(project._id, {
          projectId: project._id,
          projectName: project.name,
          taskIds: [],
          teamIds: projectTeamIds,
        });
      }

      const conflictEntry = conflictingProjectsMap.get(project._id);
      if (conflictEntry) {
        conflictEntry.taskIds.push(task.taskId);
      }
    });

    if (movableTaskIds.length > 0) {
      await moveTasksToTeam(movableTaskIds, teamId);
    }

    const conflictingProjects = Array.from(conflictingProjectsMap.values());

    if (conflictingProjects.length > 0) {
      setConflictDialog({
        open: true,
        targetTeamId: teamId,
        targetTeamName: teamName,
        conflictingProjects,
      });
      return;
    }

    table?.toggleAllRowsSelected(false);
    setOpen(false);
  };
  return (
    <Command>
      <Command.Input placeholder="Search teams..." />

      {teamsLoading ? (
        <div className="p-4 text-center text-sm text-muted-foreground">
          Loading teams...
        </div>
      ) : teams && teams.length > 0 ? (
        <Command.List>
          <Command.Group>
            {teams.map((team) => (
              <Command.Item
                key={team._id}
                onSelect={() => handleSelectTeam(team._id, team.name)}
                className="cursor-pointer"
                disabled={team._id === currentTeamId || loading}
              >
                <IconComponent name={team.icon} className="size-4 mr-2" />
                <div className="flex flex-col flex-1">
                  <span>{team.name}</span>
                  {team._id === currentTeamId && (
                    <span className="text-xs text-muted-foreground">
                      Current team
                    </span>
                  )}
                </div>
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      ) : (
        <div className="p-4 text-center text-sm text-muted-foreground">
          No teams available
        </div>
      )}

      {conflictDialog && conflictDialog.conflictingProjects.length > 0 && (
        <ProjectTeamConflictDialog
          open={conflictDialog.open}
          onOpenChange={(open) =>
            setConflictDialog(open ? conflictDialog : null)
          }
          conflictingProjects={conflictDialog.conflictingProjects}
          targetTeamId={conflictDialog.targetTeamId}
          targetTeamName={conflictDialog.targetTeamName}
          onSuccess={() => setOpen(false)}
        />
      )}
    </Command>
  );
};

export const TasksMoveToTeamCommandBarItem = ({
  tasks,
  setOpen,
  currentTeamId,
}: {
  tasks: { taskId: string; projectId: string | null }[];
  setOpen: (open: boolean) => void;
  currentTeamId?: string;
}) => {
  return (
    <MoveToTeamProvider tasks={tasks}>
      <TaskMoveToTeamContent currentTeamId={currentTeamId} setOpen={setOpen} />
    </MoveToTeamProvider>
  );
};

export const TasksMoveToTeamTrigger = ({
  setCurrentContent,
}: {
  setCurrentContent: (content: string) => void;
}) => {
  return (
    <Command.Item onSelect={() => setCurrentContent('moveToTeam')}>
      <IconUsersGroup className="size-4" />
      <div className="flex items-center">Move to team</div>
    </Command.Item>
  );
};

interface ProjectTeamConflictDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflictingProjects: Array<{
    projectId: string;
    projectName: string;
    taskIds: string[];
    teamIds?: string[];
  }>;
  targetTeamId: string;
  targetTeamName: string;
  onSuccess?: () => void;
}

export const ProjectTeamConflictDialog = ({
  open,
  onOpenChange,
  conflictingProjects,
  targetTeamId,
  targetTeamName,
  onSuccess,
}: ProjectTeamConflictDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { updateProject } = useUpdateProject();
  const { updateTask } = useUpdateTask();
  const { toast } = useToast();
  const client = useApolloClient();
  const { table } = RecordTable.useRecordTable();

  const handleAddTeamToProjects = async () => {
    setIsProcessing(true);
    try {
      await Promise.all(
        conflictingProjects.map((cp) =>
          updateProject({
            variables: {
              _id: cp.projectId,
              teamIds: [...(cp.teamIds || []), targetTeamId],
            },
          }),
        ),
      );

      await Promise.all(
        conflictingProjects.flatMap((cp) =>
          cp.taskIds.map((id) =>
            updateTask({
              variables: {
                _id: id,
                teamId: targetTeamId,
              },
            }),
          ),
        ),
      );

      toast({
        title: 'Success',
        description: 'Added team to projects and moved tasks successfully',
        variant: 'default',
      });
      client.refetchQueries({ include: ['GetTasks'] });
      table?.toggleAllRowsSelected(false);
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFromProjects = async () => {
    setIsProcessing(true);
    try {
      await Promise.all(
        conflictingProjects.flatMap((cp) =>
          cp.taskIds.map(async (id) => {
            await updateTask({
              variables: {
                _id: id,
                projectId: null,
              },
            });

            await updateTask({
              variables: {
                _id: id,
                teamId: targetTeamId,
              },
            });
          }),
        ),
      );

      toast({
        title: 'Success',
        description:
          'Removed tasks from projects and moved to team successfully',
        variant: 'default',
      });
      client.refetchQueries({ include: ['GetTasks'] });
      table?.toggleAllRowsSelected(false);
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const projectCount = conflictingProjects.length;
  const projectNames = conflictingProjects
    .map((cp) => cp.projectName)
    .join(', ');
  const totalTaskCount = conflictingProjects.reduce(
    (sum, cp) => sum + cp.taskIds.length,
    0,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="sm:max-w-[500px]">
        <Dialog.Header>
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-full bg-warning/10">
              <IconAlertTriangle className="size-5 text-warning" />
            </div>
            <Dialog.Title>Project Team Conflict</Dialog.Title>
          </div>
          <Dialog.Description className="pt-4">
            {projectCount === 1 ? (
              <>
                The project{' '}
                <span className="font-semibold">{projectNames}</span> is not a
                part of the team{' '}
                <span className="font-semibold">{targetTeamName}</span>.
              </>
            ) : (
              <>
                Some projects are not a part of the{' '}
                <span className="font-semibold">{targetTeamName}</span> team:{' '}
                <span className="font-semibold">{projectNames}</span>
              </>
            )}
            <br />
            <br />
            You can either add the team to the{' '}
            {projectCount === 1 ? 'project' : 'projects'} or remove{' '}
            {totalTaskCount > 1 ? 'the tasks' : 'the task'} from the{' '}
            {projectCount === 1 ? 'project' : 'projects'}.
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer className="flex-col sm:flex-col gap-2 mt-4">
          <Button
            onClick={handleAddTeamToProjects}
            disabled={isProcessing}
            className="w-full"
          >
            Add "{targetTeamName}" to{' '}
            {projectCount === 1 ? 'project' : 'projects'}
          </Button>
          <Button
            onClick={handleRemoveFromProjects}
            disabled={isProcessing}
            variant="outline"
            className="w-full"
          >
            Remove {totalTaskCount > 1 ? 'tasks' : 'task'} from{' '}
            {projectCount === 1 ? 'project' : 'projects'} and move to team
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
            variant="ghost"
            className="w-full"
          >
            Cancel
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};

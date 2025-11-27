import { useProjects } from '@/project/hooks/useGetProjects';
import { useUpdateProject } from '@/project/hooks/useUpdateProject';
import { useUpdateTask } from '@/task/hooks/useUpdateTask';
import { useGetTeams } from '@/team/hooks/useGetTeams';
import { IconAlertTriangle, IconUsersGroup } from '@tabler/icons-react';
import { Button, Command, Dialog, IconComponent } from 'erxes-ui';
import { createContext, useContext, useState } from 'react';

interface MoveToTeamContextType {
  tasks: {
    taskId: string;
    projectId: string | null;
  }[];
  onMoveToTeam: (teamId: string) => void;
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
  const handleMoveToTeam = async (teamId: string) => {
    await Promise.all(
      tasks.map(({ taskId } : {taskId: string }) =>
        updateTask({
            variables: {
                _id: taskId,
            teamId: teamId,
          },
        }),
      ),
    );
  };
  return (
    <MoveToTeamContext.Provider
      value={{ tasks, onMoveToTeam: handleMoveToTeam }}
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
  const { tasks, onMoveToTeam } = useMoveToTeamContext();
  const { teams, loading: teamsLoading } = useGetTeams();

  const { projects } = useProjects({
    variables: { _ids: tasks?.map((t) => t.projectId) },
    skip: !tasks || tasks.every((t) => !t.projectId),
  });

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
    // Check if any tasks have projects that don't include the target team
    if (tasks && tasks.some((t) => t.projectId)) {
      const conflictingProjects: Array<{
        projectId: string;
        projectName: string;
        taskIds: string[];
        teamIds?: string[];
      }> = [];

      // Group tasks by project and check for conflicts
      const projectsMap = new Map<
        string,
        {
          project: { _id: string; name: string; teamIds?: string[] };
          taskIds: string[];
        }
      >();

      tasks.forEach((task) => {
        if (task.projectId) {
          for (const project of projects || []) {
            if (project._id === task.projectId) {
              if (!projectsMap.has(task.projectId)) {
                projectsMap.set(task.projectId, {
                  project: project,
                  taskIds: [],
                });
              }
            }
          }

          const projectEntry = projectsMap.get(task.projectId);
          if (projectEntry) {
            projectEntry.taskIds.push(task.taskId);
          }
        }
      });

      // Check each project for conflicts
      projectsMap.forEach(({ project, taskIds }) => {
        const projectTeamIds = project.teamIds || [];
        if (!projectTeamIds.includes(teamId)) {
          conflictingProjects.push({
            projectId: project._id,
            projectName: project.name,
            taskIds,
            teamIds: projectTeamIds,
          });
        }
      });

      // If there are conflicts, show dialog
      if (conflictingProjects.length > 0) {
        setConflictDialog({
          open: true,
          targetTeamId: teamId,
          targetTeamName: teamName,
          conflictingProjects,
        });
        return;
      }
    }

    // No conflict, proceed with move
    onMoveToTeam(teamId);
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
                onSelect={() => { handleSelectTeam(team._id, team.name); setOpen(false); }}
                className="cursor-pointer"
                disabled={team._id === currentTeamId}
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
          currentTeamId={currentTeamId}
          onSuccess={onMoveToTeam.bind(null, conflictDialog.targetTeamId)}
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
      <TaskMoveToTeamContent currentTeamId={currentTeamId} setOpen={setOpen}/>
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
  conflictingProjects: Array<{ projectId: string; projectName: string; taskIds: string[], teamIds?: string[] }>;
  targetTeamId: string;
  targetTeamName: string;
  currentTeamId?: string;
  onSuccess?: () => void;
}

export const ProjectTeamConflictDialog = ({
  open,
  onOpenChange,
  conflictingProjects,
  targetTeamId,
  targetTeamName,
  currentTeamId,
  onSuccess,
}: ProjectTeamConflictDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { updateProject } = useUpdateProject();
  const { updateTask } = useUpdateTask();
  
  // Fetch each conflicting project to get its current teamIds
  // We do this separately for each project
  const { projects } = useProjects({
    variables: { _ids: conflictingProjects?.map((t) => t.projectId) },
    skip: !conflictingProjects || conflictingProjects.every((t) => !t.projectId),
  });

  const handleAddTeamToProjects = async () => {
    if (projects?.length === 0) return;

    setIsProcessing(true);
    try {
      // STEP 1: Add team to all conflicting projects' teamIds first
      // Update them sequentially to ensure each completes before next
      for (const cp of conflictingProjects) {
        // const project = projects.find(p => p._id === cp.projectId);
        // if (!project) continue;
        
        const newTeamIds = [...(cp.teamIds || []), targetTeamId];
        await updateProject({
          variables: {
            _id: cp.projectId,
            teamIds: newTeamIds,
          },
        });
      }

      // STEP 2: Only after ALL projects are updated, move tasks to new team
      // Process tasks sequentially by project to avoid race conditions
      for (const cp of conflictingProjects) {
        // Move all tasks from this project
        await Promise.all(
          cp.taskIds.map((id) =>
            updateTask({
              variables: {
                _id: id,
                teamId: targetTeamId,
              },
            }),
          )
        );
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding team to projects:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFromProjects = async () => {
    setIsProcessing(true);
    try {
      // Remove tasks from their projects and move to new team
      await Promise.all(
        conflictingProjects.flatMap((cp) =>
          cp.taskIds.map((id) =>
            updateTask({
              variables: {
                _id: id,
                teamId: targetTeamId,
                projectId: null,
              },
            }),
          )
        )
      );

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error removing tasks from projects:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const projectCount = conflictingProjects.length;
  const projectNames = conflictingProjects.map(cp => cp.projectName).join(', ');
  const totalTaskCount = conflictingProjects.reduce((sum, cp) => sum + cp.taskIds.length, 0);

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
                The project <span className="font-semibold">{projectNames}</span> is not a part of the team{' '}
                <span className="font-semibold">{targetTeamName}</span>.
              </>
            ) : (
              <>
                Some projects are not a part of the <span className="font-semibold">{targetTeamName}</span> team:{' '}
                <span className="font-semibold">{projectNames}</span>
              </>
            )}
            <br />
            <br />
            You can either add the team to the {projectCount === 1 ? 'project' : 'projects'} or remove {totalTaskCount > 1 ? 'the tasks' : 'the task'} from the {projectCount === 1 ? 'project' : 'projects'}.
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer className="flex-col sm:flex-col gap-2 mt-4">
          <Button
            onClick={handleAddTeamToProjects}
            disabled={isProcessing}
            className="w-full"
          >
            Add "{targetTeamName}" to {projectCount === 1 ? 'project' : 'projects'}
          </Button>
          <Button
            onClick={handleRemoveFromProjects}
            disabled={isProcessing}
            variant="outline"
            className="w-full"
          >
            Remove {totalTaskCount > 1 ? 'tasks' : 'task'} from {projectCount === 1 ? 'project' : 'projects'} and move to team
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

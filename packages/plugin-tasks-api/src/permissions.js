module.exports = {
  tasks: {
    name: "tasks",
    description: "Tasks",
    actions: [
      {
        name: "tasksAll",
        description: "All",
        use: [
          "showTasks",
          "taskBoardsAdd",
          "taskBoardsEdit",
          "taskBoardsRemove",
          "taskPipelinesAdd",
          "taskPipelinesEdit",
          "taskPipelinesUpdateOrder",
          "taskPipelinesWatch",
          "taskPipelinesRemove",
          "taskPipelinesArchive",
          "taskPipelinesCopied",
          "taskStagesAdd",
          "taskStagesEdit",
          "taskStagesUpdateOrder",
          "taskStagesRemove",
          "tasksAdd",
          "tasksEdit",
          "tasksRemove",
          "tasksWatch",
          "tasksArchive",
          "tasksSort",
          "taskUpdateTimeTracking",
          "exportTasks"
        ]
      },
      {
        name: "showTasks",
        description: "Show tasks"
      },
      {
        name: "taskBoardsAdd",
        description: "Add task board"
      },
      {
        name: "taskBoardsRemove",
        description: "Remove task board"
      },
      {
        name: "taskPipelinesAdd",
        description: "Add task pipeline"
      },
      {
        name: "taskPipelinesEdit",
        description: "Edit task pipeline"
      },
      {
        name: "taskPipelinesRemove",
        description: "Remove task pipeline"
      },
      {
        name: "taskPipelinesArchive",
        description: "Archive task pipeline"
      },
      {
        name: "taskPipelinesCopied",
        description: "Duplicate task pipeline"
      },
      {
        name: "taskPipelinesWatch",
        description: "Task pipeline watch"
      },
      {
        name: "taskPipelinesUpdateOrder",
        description: "Update pipeline order"
      },
      {
        name: "taskStagesAdd",
        description: "Add task stage"
      },
      {
        name: "taskStagesEdit",
        description: "Edit task stage"
      },
      {
        name: "taskStagesUpdateOrder",
        description: "Update stage order"
      },
      {
        name: "taskStagesRemove",
        description: "Remove task stage"
      },
      {
        name: "tasksAdd",
        description: "Add task"
      },
      {
        name: "tasksEdit",
        description: "Edit task"
      },
      {
        name: "tasksRemove",
        description: "Remove task"
      },
      {
        name: "tasksWatch",
        description: "Watch task"
      },
      {
        name: "tasksArchive",
        description: "Archive all tasks in a specific stage"
      },
      {
        name: "tasksSort",
        description: "Sort all tasks in a specific stage"
      },
      {
        name: "taskUpdateTimeTracking",
        description: "Update time tracking"
      },
      {
        name: "exportTasks",
        description: "Export tasks"
      }
    ]
  }
};

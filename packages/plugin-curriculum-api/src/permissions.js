module.exports = {
  automations: {
    name: "curriculum",
    description: "Curriculum",
    actions: [
      {
        name: "CurriculumAll",
        description: "All",
        use: [
          "showCurriculum",
          "curriculumAdd",
          "curriculumEdit",
          "curriculumRemove",
        ],
      },
      {
        name: "showCurriculum",
        description: "Show curriculum",
      },
      {
        name: "curriculumAdd",
        description: "Add curriculum",
      },
      {
        name: "curriculumEdit",
        description: "Edit curriculum",
      },
      {
        name: "curriculumRemove",
        description: "Remove curriculum",
      },
    ],
  },
};

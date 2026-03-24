export const FORM_STORAGE_KEYS = {
  STEP: 'formStep',
  GENERAL: 'formGeneral',
  CONTENT: 'formContent',
  CONFIRMATION: 'formConfirmation',
} as const;

export const FORM_STATES_DEFAULT_VALUES = {
  GENERAL: {
    channelId: '',
    primaryColor: '#4f46e5',
    appearance: 'iframe',
    title: 'title',
    description: '',
    buttonText: '',
  },
  CONTENT: {
    steps: {
      initial: {
        name: 'Initial step',
        description: '',
        order: 1,
        fields: [],
      },
    },
  },
  CONFIRMATION: {
    title: 'title',
    description: 'description',
    image: null,
  },
};

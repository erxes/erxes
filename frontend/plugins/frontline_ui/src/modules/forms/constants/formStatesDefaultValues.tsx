export const FORM_STORAGE_KEYS = {
  STEP: 'formStep',
  GENERAL: 'formGeneral',
  CALLOUT: 'formCallout',
  CONTENT: 'formContent',
  CONFIRMATION: 'formConfirmation',
} as const;

export const FORM_SETUP_STEPS = {
  GENERAL: 1,
  CALLOUT: 2,
  CONTENT: 3,
  CONFIRMATION: 4,
} as const;

export const FORM_SETUP_STEPS_LENGTH = Object.keys(FORM_SETUP_STEPS).length;

export const FORM_STATES_DEFAULT_VALUES = {
  GENERAL: {
    channelId: '',
    primaryColor: '#4f46e5',
    appearance: 'iframe',
    loadType: 'embedded',
    title: 'title',
    description: '',
    buttonText: '',
  },
  CALLOUT: {
    title: '',
    body: '',
    buttonText: '',
    featuredImage: null,
    skip: false,
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

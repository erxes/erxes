import { __ } from '@erxes/ui/src/utils';

export const EMPTY_CONTENT_FILEMANAGER = {
  title: __('Getting Started with Contacts'),
  description: __('Coordinate and manage all your customer interactions'),
  steps: [
    {
      title: __('Import your previous contacts'),
      description: __(
        'Use Import feature to bulk import all your previous Customers or Leads'
      ),
      url: '/settings/importHistories',
      urlText: 'Go to Customer Import'
    },
    {
      title: __('Collect visitor information'),
      description: __(
        'Create your erxes Messenger to start capturing Visitors'
      ),
      url: '/settings/integrations/createMessenger',
      urlText: 'Create Messenger'
    },
    {
      title: __('Sync email contacts'),
      description: __(
        'Integrate your email address to sync previous email Leads'
      ),
      url: '/settings/integrations',
      urlText: 'Visit AppStore'
    },
    {
      title: __('Start capturing social media contacts'),
      description: __(
        'Integrate social media website to start capturing Leads'
      ),
      url: '/settings/integrations',
      urlText: 'Visit AppStore'
    },
    {
      title: __('Generate contacts through Forms'),
      description: 'Create your forms and start collecting Leads',
      url: '/forms/create',
      urlText: 'Create a Popup'
    }
  ]
};

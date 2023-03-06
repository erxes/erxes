import { __ } from '@erxes/ui/src/utils';

export const EMPTY_CONTENT_FOLDERS = {
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

export const EMPTY_CONTENT_FILES = {
  title: __('Getting Started with erxes Knowledgebase'),
  description: __(
    'Educate your customers and staff by creating help articles to reach higher levels of satisfaction'
  ),
  steps: [
    {
      title: __('Create your knowledgebase'),
      description: __(
        '<ul><li>Make sure you’ve created your Brands</li><li>Click on “Add Knowledgebase” to create one for a specific Brand</li><li>Click on the “Settings” button and “Add Categories”. A good one to get started with would be “General, Pricing, etc.”</li><li>Click on “Add Articles” to start adding help articles</li></ul>'
      ),
      html: true
    },
    {
      title: __('Install the script'),
      description:
        "<ul><li>Copy the individual script by clicking on the Settings button.</li><li>Use <a href='/settings/scripts'>Script Manager</a> to avoid script duplication errors if you’re planning to display this popup along with any other erxes widgets</li></ul>",
      html: true,
      url: '/settings/scripts',
      urlText: __('Go to Script Manager')
    }
  ]
};

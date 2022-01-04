import { __ } from '@erxes/ui/src/utils';

export const EMPTY_CONTENT_KNOWLEDGEBASE = {
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

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

export const EMPTY_CONTENT_BOOKINGS = {
  title: __('Getting Started with erxes Booking'),
  description: __(
    'erxes Booking widget helps you create listings of your Products and Services and receive bookings with your erxes Form.'
  ),
  steps: [
    {
      title: __('Prepare Product Properties'),
      description: __(
        'This widget is based on your erxes Products and Services. Depending on your products, you may need to create custom Properties first. For example, you can display additional information such as Amenities, Services, etc. in the product detail page or as user filters.'
      ),
      url: '/settings/properties?type=product',
      urlText: 'Create Custom Properties'
    },
    {
      title: __('Organize Your Products'),
      description: __(
        'The number of pages in this widget depends on how many sub-categories you’ll create for your products and services. If you haven’t created or organized them yet, please go to Products & Services first.'
      ),
      url: '/settings/product-service',
      urlText: 'Manage Products & Services'
    }
  ]
};

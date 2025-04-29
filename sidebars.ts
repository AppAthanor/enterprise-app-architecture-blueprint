import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // Custom sidebar for the Architecture Blueprint System
  tutorialSidebar: [
    'homepage',
    {
      type: 'category',
      label: 'Capabilities',
      items: [
        'capabilities/multi-market-application-setup',
        {
          type: 'category',
          label: 'App Integration',
          link: {
            type: 'doc',
            id: 'capabilities/app-integration',
          },
          items: [
            'capabilities/app-integration/sub-capabilities/feature-integration',
            'capabilities/app-integration/sub-capabilities/remote-feature-killswitch',
            'capabilities/app-integration/sub-capabilities/sdks-integration-per-market'
          ]
        },
        'capabilities/app-minimum-conditions',
        'capabilities/startup-business-process',
        'capabilities/startup-journeys',
        'capabilities/app-journeys'
      ]
    }
  ],

  // But you can create a sidebar manually
  /*
  tutorialSidebar: [
    'intro',
    'hello',
    {
      type: 'category',
      label: 'Tutorial',
      items: ['tutorial-basics/create-a-document'],
    },
  ],
   */
};

export default sidebars;

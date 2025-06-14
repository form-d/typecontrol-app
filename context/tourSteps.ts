import { TourStep } from '../components/overlay/GuidedTour';

/**
 * Returns the default guided tour steps, localized via the provided translation function `t`.
 */
export function getDefaultTourSteps(t: (key: string) => string): TourStep[] {
  return [
    {
      target: '#scale-col',
       title:"Type scale function",
      description: "Select a ratio to calculate a size scale. You find here the typical settings", 
    //   content:"Select you font here. You can user Google fonts, remote fonts and local font (sorry no safari)",
    //   content: t('ratingTitle'),
      placement: 'left-start',
    },
    {
      target: '#bezier-col',
       title:"Type scale function",
      description: "Select a ratio to calculate a size scale. You find here the typical settings", 
    //   content:"Select you font here. You can user Google fonts, remote fonts and local font (sorry no safari)",
    //   content: t('ratingTitle'),
      placement: 'left-start',
    },
    {
      target: '#font-col',
       title:"Type scale function",
      description: "Select a ratio to calculate a size scale. You find here the typical settings", 
    //   content:"Select you font here. You can user Google fonts, remote fonts and local font (sorry no safari)",
    //   content: t('ratingTitle'),
      placement: 'left-start',
    },
    {
      target: '#fontMode-btn',
       title:"Font Loading Mode",
      description: "Select you font here. You can user Google fonts, remote fonts and local font (sorry no safari)", 
    //   content:"Select you font here. You can user Google fonts, remote fonts and local font (sorry no safari)",
    //   content: t('ratingTitle'),
      placement: 'left-start',
    },
    {
      target: '#profile-btn',
      title: "App Prefernces",
      description: "Change the language, line clipping and more",
      placement: 'left',
    },
    {
      target: '#table-export-btn',
      title: "Export letter spacing values",
      description: "Export as csv or HTML table to use it in you tool",
      placement: 'left',
      offset: 500,
    },
    // add additional steps here as needed
  ];
}

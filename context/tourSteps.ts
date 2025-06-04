import { TourStep } from '../components/overlay/GuidedTour';

/**
 * Returns the default guided tour steps, localized via the provided translation function `t`.
 */
export function getDefaultTourSteps(t: (key: string) => string): TourStep[] {
  return [
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
    // add additional steps here as needed
  ];
}

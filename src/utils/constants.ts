const APPS_KEY = 'garuda_selectedApps';
const FAVORITES_KEY = 'garuda_favorites';
const MAX_FAVORITES = 3;

const STAGE = {
  AppsSetup: 'AppsSetup',
  ProjectsSelection: 'ProjectsSelection',
} as const;

type Stages = keyof typeof STAGE;

export { APPS_KEY, FAVORITES_KEY, MAX_FAVORITES, STAGE, type Stages };

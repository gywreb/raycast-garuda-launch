const APPS_KEY = 'garuda_selectedApps';
const RECENT_PROJECTS_KEY = 'garuda_recentProjects';
const MAX_RECENT_PROJECTS = 5;

const STAGE = {
  AppsSetup: 'AppsSetup',
  ProjectsSelection: 'ProjectsSelection',
} as const;

type Stages = keyof typeof STAGE;

export { APPS_KEY, MAX_RECENT_PROJECTS, RECENT_PROJECTS_KEY, STAGE, type Stages };

import { useGarudaLaunchContext } from '@hooks/useGarudaLaunchContext';
import { Action, ActionPanel, Keyboard, List, LocalStorage, open, showToast } from '@raycast/api';
import { showFailureToast } from '@raycast/utils';
import { APPS_KEY, MAX_RECENT_PROJECTS, RECENT_PROJECTS_KEY } from '@utils/constants';
import { readProjects } from '@utils/helpers';
import { join } from 'path';
import { useEffect, useState } from 'react';

interface Props {
  base: string;
  appEntries: { path: string; name: string; hotkey: string }[];
}

export const ProjectsSelection: React.FC<Props> = ({ base, appEntries }) => {
  const { setStage, setSelectedApps } = useGarudaLaunchContext();
  const [recentProjects, setRecentProjects] = useState<string[]>([]);

  const repos = (() => {
    try {
      return readProjects(base) || [];
    } catch {
      return [];
    }
  })();

  useEffect(() => {
    (async () => {
      const stored = await LocalStorage.getItem<string>(RECENT_PROJECTS_KEY);
      if (stored) {
        try {
          const parsed: string[] = JSON.parse(stored);
          const valid = parsed.filter((p) => repos.includes(p));
          setRecentProjects(valid.slice(0, MAX_RECENT_PROJECTS));
        } catch {
          setRecentProjects([]);
        }
      }
    })();
  }, []);

  const trackRecentProject = async (proj: string) => {
    const stored = await LocalStorage.getItem<string>(RECENT_PROJECTS_KEY);
    let current: string[] = [];
    try {
      current = stored ? JSON.parse(stored) : [];
    } catch {
      /* ignore */
    }
    const updated = [proj, ...current.filter((p) => p !== proj)].slice(0, MAX_RECENT_PROJECTS);
    await LocalStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(updated));
    setRecentProjects(updated.filter((p) => repos.includes(p)));
  };

  const renderProjectItem = (proj: string, keyPrefix: string) => {
    const target = join(base, proj);
    return (
      <List.Item
        key={`${keyPrefix}-${proj}`}
        title={proj}
        actions={
          <ActionPanel>
            {appEntries.map(({ path, name, hotkey }) => (
              <Action
                key={path}
                title={`Open in ${name}`}
                icon={{ fileIcon: path }}
                shortcut={{ modifiers: ['cmd'], key: hotkey as Keyboard.KeyEquivalent }}
                onAction={async () => {
                  await trackRecentProject(proj);
                  await open(target, path);
                }}
              />
            ))}
            <Action
              title="Reset Applications"
              icon={{ source: 'arrow.counterclockwise' }}
              onAction={async () => {
                try {
                  await LocalStorage.removeItem(APPS_KEY);
                  setStage('AppsSetup');
                  setSelectedApps([]);
                  showToast({ title: 'Applications reset successfully' });
                } catch (error) {
                  showFailureToast(error, { title: 'Failed to reset applications' });
                }
              }}
            />
          </ActionPanel>
        }
      />
    );
  };

  return (
    <List searchBarPlaceholder="Select a project…">
      {recentProjects.length > 0 && (
        <List.Section title="Recently Opened">
          {recentProjects.map((proj) => renderProjectItem(proj, 'recent'))}
        </List.Section>
      )}

      <List.Section title="Projects">
        {repos.map((proj) => renderProjectItem(proj, 'all'))}
      </List.Section>

      <List.Section title="Hotkeys">
        {appEntries.map(({ name, hotkey, path }) => (
          <List.Item key={path} title={`⌘ + ${hotkey} : ${name}`} icon={{ fileIcon: path }} />
        ))}
      </List.Section>
    </List>
  );
};

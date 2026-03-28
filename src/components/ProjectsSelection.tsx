import { useGarudaLaunchContext } from '@hooks/useGarudaLaunchContext';
import { Action, ActionPanel, Keyboard, List, LocalStorage, showToast } from '@raycast/api';
import { showFailureToast } from '@raycast/utils';
import { APPS_KEY } from '@utils/constants';
import { readProjects, RecentProject, getRecentProjects, trackRecentProject } from '@utils/helpers';
import { join } from 'path';
import { useEffect, useState, useCallback } from 'react';

interface Props {
  base: string;
  appEntries: { path: string; name: string; hotkey: string }[];
}

export const ProjectsSelection: React.FC<Props> = ({ base, appEntries }) => {
  const { setStage, setSelectedApps } = useGarudaLaunchContext();
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);

  const repos = (() => {
    try {
      return readProjects(base) || [];
    } catch {
      return [];
    }
  })();

  useEffect(() => {
    getRecentProjects().then(setRecentProjects);
  }, []);

  const handleProjectOpen = useCallback(async (projectName: string) => {
    const updated = await trackRecentProject(projectName);
    setRecentProjects(updated);
  }, []);

  const recentNames = new Set(recentProjects.map((r) => r.name));

  const renderProjectItem = (proj: string) => {
    const target = join(base, proj);
    return (
      <List.Item
        key={proj}
        title={proj}
        actions={
          <ActionPanel>
            {appEntries.map(({ path, name, hotkey }) => (
              <Action.Open
                key={path}
                title={`Open in ${name}`}
                target={target}
                application={path}
                shortcut={{ modifiers: ['cmd'], key: hotkey as Keyboard.KeyEquivalent }}
                onOpen={() => handleProjectOpen(proj)}
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
          {recentProjects
            .filter((r) => repos.includes(r.name))
            .map((r) => renderProjectItem(r.name))}
        </List.Section>
      )}

      <List.Section title="Projects">
        {repos
          .filter((proj) => !recentNames.has(proj))
          .map((proj) => renderProjectItem(proj))}
      </List.Section>

      <List.Section title="Hotkeys">
        {appEntries.map(({ name, hotkey, path }) => (
          <List.Item key={path} title={`⌘ + ${hotkey} : ${name}`} icon={{ fileIcon: path }} />
        ))}
      </List.Section>
    </List>
  );
};

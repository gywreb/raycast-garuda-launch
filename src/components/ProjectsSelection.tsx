import { useGarudaLaunchContext } from '@hooks/useGarudaLaunchContext';
import { Action, ActionPanel, Keyboard, List, LocalStorage, showToast } from '@raycast/api';
import { showFailureToast } from '@raycast/utils';
import { APPS_KEY } from '@utils/constants';
import { readProjects } from '@utils/helpers';
import { join } from 'path';
import { useState, useMemo } from 'react';

interface Props {
  base: string;
  appEntries: { path: string; name: string; hotkey: string }[];
}

export const ProjectsSelection: React.FC<Props> = ({ base, appEntries }) => {
  const { setStage, setSelectedApps } = useGarudaLaunchContext();
  const [searchText, setSearchText] = useState('');

  const repos = (() => {
    try {
      return readProjects(base) || [];
    } catch {
      return [];
    }
  })();

  const filteredRepos = useMemo(() => {
    if (!searchText) return repos;
    const query = searchText.toLowerCase();
    return repos.filter((proj) => proj.toLowerCase().includes(query));
  }, [repos, searchText]);

  return (
    <List
      filtering={false}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search projects by name…"
    >
      {filteredRepos.length === 0 && searchText && (
        <List.EmptyView title="No projects found" description={`No match for "${searchText}"`} />
      )}

      <List.Section title="Projects">
        {filteredRepos.map((proj) => {
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
        })}
      </List.Section>

      {!searchText && (
        <List.Section title="Hotkeys">
          {appEntries.map(({ name, hotkey, path }) => (
            <List.Item key={path} title={`⌘ + ${hotkey} : ${name}`} icon={{ fileIcon: path }} />
          ))}
        </List.Section>
      )}
    </List>
  );
};

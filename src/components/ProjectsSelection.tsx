import { useFavorites } from '@hooks/useFavorites';
import { useGarudaLaunchContext } from '@hooks/useGarudaLaunchContext';
import { Action, ActionPanel, Icon, Keyboard, List, LocalStorage, showToast } from '@raycast/api';
import { showFailureToast } from '@raycast/utils';
import { APPS_KEY } from '@utils/constants';
import { readProjects } from '@utils/helpers';
import { join } from 'path';

interface Props {
  base: string;
  appEntries: { path: string; name: string; hotkey: string }[];
}

export const ProjectsSelection: React.FC<Props> = ({ base, appEntries }) => {
  const { setStage, setSelectedApps } = useGarudaLaunchContext();
  const { addFavorite, removeFavorite, isFavorite, sortWithFavorites } = useFavorites();

  const repos = (() => {
    try {
      return readProjects(base) || [];
    } catch {
      return [];
    }
  })();

  const { starred, rest } = sortWithFavorites(repos);

  const renderProjectItem = (proj: string) => {
    const target = join(base, proj);
    const favorited = isFavorite(proj);

    return (
      <List.Item
        key={proj}
        title={proj}
        icon={favorited ? Icon.Star : Icon.Folder}
        accessories={favorited ? [{ icon: Icon.Star, tooltip: 'Favorite' }] : []}
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
            <ActionPanel.Section>
              {favorited ? (
                <Action
                  title="Remove from Favorites"
                  icon={Icon.StarDisabled}
                  shortcut={{ modifiers: ['cmd', 'shift'], key: 'f' }}
                  onAction={() => removeFavorite(proj)}
                />
              ) : (
                <Action
                  title="Add to Favorites"
                  icon={Icon.Star}
                  shortcut={{ modifiers: ['cmd', 'shift'], key: 'f' }}
                  onAction={() => addFavorite(proj)}
                />
              )}
            </ActionPanel.Section>
            <ActionPanel.Section>
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
            </ActionPanel.Section>
          </ActionPanel>
        }
      />
    );
  };

  return (
    <List searchBarPlaceholder="Select a project…">
      {starred.length > 0 && (
        <List.Section title="⭐ Favorites">
          {starred.map(renderProjectItem)}
        </List.Section>
      )}

      <List.Section title="Projects">
        {rest.map(renderProjectItem)}
      </List.Section>

      <List.Section title="Hotkeys">
        {appEntries.map(({ name, hotkey, path }) => (
          <List.Item key={path} title={`⌘ + ${hotkey} : ${name}`} icon={{ fileIcon: path }} />
        ))}
      </List.Section>
    </List>
  );
};

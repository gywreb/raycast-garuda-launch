import { showToast, Toast } from '@raycast/api';
import { FAVORITES_KEY, MAX_FAVORITES } from '@utils/constants';
import { useCallback, useMemo } from 'react';
import { useLocalStorage } from 'react-use';

export function useFavorites() {
  const [favorites = [], setFavorites] = useLocalStorage<string[]>(FAVORITES_KEY, []);

  const addFavorite = useCallback(
    async (project: string) => {
      if (favorites.includes(project)) {
        await showToast({ style: Toast.Style.Failure, title: `"${project}" is already a favorite` });
        return;
      }
      if (favorites.length >= MAX_FAVORITES) {
        await showToast({
          style: Toast.Style.Failure,
          title: `Max ${MAX_FAVORITES} favorites`,
          message: 'Unstar a project first',
        });
        return;
      }
      setFavorites([...favorites, project]);
      await showToast({ title: `⭐ "${project}" added to favorites` });
    },
    [favorites, setFavorites],
  );

  const removeFavorite = useCallback(
    async (project: string) => {
      setFavorites(favorites.filter((f) => f !== project));
      await showToast({ title: `Removed "${project}" from favorites` });
    },
    [favorites, setFavorites],
  );

  const isFavorite = useMemo(
    () => (project: string) => favorites.includes(project),
    [favorites],
  );

  const sortWithFavorites = useCallback(
    (projects: string[]) => {
      const starred = projects.filter((p) => favorites.includes(p));
      const rest = projects.filter((p) => !favorites.includes(p));
      return { starred, rest };
    },
    [favorites],
  );

  return { favorites, addFavorite, removeFavorite, isFavorite, sortWithFavorites };
}

import { LocalStorage, showToast, Toast } from '@raycast/api';
import { FAVORITES_KEY, MAX_FAVORITES } from '@utils/constants';
import { useCallback, useEffect, useState } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const stored = await LocalStorage.getItem<string>(FAVORITES_KEY);
      if (stored) {
        try {
          setFavorites(JSON.parse(stored));
        } catch {
          setFavorites([]);
        }
      }
    })();
  }, []);

  const saveFavorites = useCallback(async (next: string[]) => {
    setFavorites(next);
    await LocalStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  }, []);

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
      const next = [...favorites, project];
      await saveFavorites(next);
      await showToast({ title: `⭐ "${project}" added to favorites` });
    },
    [favorites, saveFavorites],
  );

  const removeFavorite = useCallback(
    async (project: string) => {
      const next = favorites.filter((f) => f !== project);
      await saveFavorites(next);
      await showToast({ title: `Removed "${project}" from favorites` });
    },
    [favorites, saveFavorites],
  );

  const isFavorite = useCallback((project: string) => favorites.includes(project), [favorites]);

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

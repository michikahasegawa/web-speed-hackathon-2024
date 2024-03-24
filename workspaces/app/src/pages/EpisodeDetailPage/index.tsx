import { Suspense } from 'react';
import { useParams } from 'react-router-dom';
import invariant from 'tiny-invariant';

import { useBook } from '../../features/book/hooks/useBook';
import { EpisodeListItem } from '../../features/episode/components/EpisodeListItem';
import { useEpisode } from '../../features/episode/hooks/useEpisode';
import { Box } from '../../foundation/components/Box';
import { Flex } from '../../foundation/components/Flex';
import { Separator } from '../../foundation/components/Separator';
import { Space } from '../../foundation/styles/variables';

import { ComicViewer } from './internal/ComicViewer';

const EpisodeDetailPage: React.FC = () => {
  const { bookId, episodeId } = useParams<RouteParams<'/books/:bookId/episodes/:episodeId'>>();
  invariant(bookId);
  invariant(episodeId);

  // 現在のエピソードのデータのみを読み込む
  const { data: episode } = useEpisode({ params: { episodeId } });

  if (!episode) {
    return <Suspense fallback={null} />;
  }

  // 漫画ビューアーの表示
  return (
    <Box>
      <section aria-label="漫画ビューアー">
        <ComicViewer episodeId={episode.id} />
      </section>
    </Box>
  );
};

const EpisodeDetailPageWithSuspense: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <EpisodeDetailPage />
    </Suspense>
  );
};

export { EpisodeDetailPageWithSuspense as EpisodeDetailPage };

import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { ComicViewerCore } from '../../../features/viewer/components/ComicViewerCore';
import { addUnitIfNeeded } from '../../../lib/css/addUnitIfNeeded';

const IMAGE_WIDTH = 1075;
const IMAGE_HEIGHT = 1518;

const MIN_VIEWER_HEIGHT = 500;
const MAX_VIEWER_HEIGHT = 650;

const MIN_PAGE_WIDTH = Math.floor((MIN_VIEWER_HEIGHT / IMAGE_HEIGHT) * IMAGE_WIDTH);

const _Container = styled.div`
  position: relative;
`;

const _Wrapper = styled.div<{
  $maxHeight: number;
}>`
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 100%;
  max-height: ${({ $maxHeight }) => addUnitIfNeeded($maxHeight)};
  overflow: hidden;
`;

type Props = {
  episodeId: string;
};

export const ComicViewer: React.FC<Props> = ({ episodeId }) => {
  const [viewerHeight, setViewerHeight] = useState<number>(MAX_VIEWER_HEIGHT);

  useEffect(() => {
    const handleResize = () => {
      const containerWidth = window.innerWidth / 100;
      const pageCountParView = containerWidth <= 2 * MIN_PAGE_WIDTH ? 1 : 2;
      const candidatePageWidth = containerWidth / pageCountParView;
      const candidatePageHeight = (candidatePageWidth / IMAGE_WIDTH) * IMAGE_HEIGHT;
      const calculatedHeight = Math.min(Math.max(candidatePageHeight, MIN_VIEWER_HEIGHT), MAX_VIEWER_HEIGHT);
      setViewerHeight(calculatedHeight);
    };

    handleResize();

    const handleThrottledResize = () => {
      let throttleTimer: ReturnType<typeof setTimeout>;

      return () => {
        if (!throttleTimer) {
          throttleTimer = setTimeout(() => {
            throttleTimer = undefined;
            handleResize();
          }, 200);
        }
      };
    };

    const throttledResizeHandler = handleThrottledResize();

    window.addEventListener('resize', throttledResizeHandler);

    return () => {
      window.removeEventListener('resize', throttledResizeHandler);
    };
  }, []);

  return (
    <_Container>
      <_Wrapper $maxHeight={viewerHeight}>
        <ComicViewerCore episodeId={episodeId} />
      </_Wrapper>
    </_Container>
  );
};

import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { addUnitIfNeeded } from '../../../lib/css/addUnitIfNeeded';
import { useEpisode } from '../../episode/hooks/useEpisode';

import { ComicViewerPage } from './ComicViewerPage';

const IMAGE_WIDTH = 1075;
const IMAGE_HEIGHT = 1518;

const Container = styled.div`
  position: relative;
`;

const Wrapper = styled.div<{
  $paddingInline: number;
  $pageWidth: number;
}>`
  background-color: black;
  cursor: grab;
  direction: rtl;
  display: grid;
  grid-auto-columns: ${({ $pageWidth }) => addUnitIfNeeded($pageWidth)};
  grid-auto-flow: column;
  grid-template-rows: minmax(auto, 100%);
  height: 100%;
  overflow-x: scroll;
  overflow-y: hidden;
  overscroll-behavior: none;
  padding-inline: ${({ $paddingInline }) => addUnitIfNeeded($paddingInline)};
  touch-action: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

type Props = {
  episodeId: string;
};

const ComicViewerCore: React.FC<Props> = ({ episodeId }) => {
  const { data: episode } = useEpisode({ params: { episodeId } });

  const [containerWidth, setContainerWidth] = useState(0);
  const [pageCountParView, setPageCountParView] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('comic-container');
      if (container) {
        const cWidth = container.getBoundingClientRect().width;
        setContainerWidth(cWidth);
        setPageCountParView((cWidth / 100) * (IMAGE_HEIGHT / IMAGE_WIDTH) < 2 ? 1 : 2);
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Container id="comic-container">
      <Wrapper $paddingInline={0} $pageWidth={IMAGE_WIDTH}>
        {episode?.pages.map((page) => (
          <ComicViewerPage key={page.id} pageImageId={page.image.id} />
        ))}
      </Wrapper>
    </Container>
  );
};

export default ComicViewerCore;

import { Suspense, useEffect, useRef, useState } from 'react';
import { useInterval, useUpdate } from 'react-use';
import styled from 'styled-components';

import { addUnitIfNeeded } from '../../../lib/css/addUnitIfNeeded';
import { useEpisode } from '../../episode/hooks/useEpisode';

import { ComicViewerPage } from './ComicViewerPage';

const IMAGE_WIDTH = 1075;
const IMAGE_HEIGHT = 1518;

const _Container = styled.div`
  position: relative;
`;

const _Wrapper = styled.div<{
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
  const rerender = useUpdate();
  useInterval(rerender, 0);

  const { data: episode } = useEpisode({ params: { episodeId } });

  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [scrollView, setScrollView] = useState<HTMLDivElement | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollViewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setContainer(containerRef.current);
    setScrollView(scrollViewRef.current);
  }, []);

  useEffect(() => {
    if (!scrollView || !container || !episode) return;

    const pageCountParView = (container.getBoundingClientRect().width / 100) / ((2 * IMAGE_WIDTH) / IMAGE_HEIGHT) < 2 ? 1 : 2;
    const pageWidth = ((container.getBoundingClientRect().height / 100) / IMAGE_HEIGHT) * IMAGE_WIDTH;
    const viewerPaddingInline = (container.getBoundingClientRect().width / 100 - pageWidth * pageCountParView) / 2 + (pageCountParView === 2 ? pageWidth : 0);

    let isPressed = false;
    let scrollToLeftWhenScrollEnd = 0;

    const handlePointerDown = (ev: PointerEvent) => {
      isPressed = true;
      scrollView.style.cursor = 'grabbing';
      scrollView.setPointerCapture(ev.pointerId);
      scrollToLeftWhenScrollEnd = scrollView.scrollLeft;
    };

    const handlePointerMove = (ev: PointerEvent) => {
      if (isPressed) {
        scrollView.scrollBy({
          behavior: 'instant',
          left: -1 * ev.movementX,
        });
        scrollToLeftWhenScrollEnd = scrollView.scrollLeft;
      }
    };

    const handlePointerUp = () => {
      isPressed = false;
      scrollView.style.cursor = 'grab';
    };

    const handleScrollEnd = () => {
      if (!isPressed) {
        scrollView.scrollTo({
          behavior: 'smooth',
          left: scrollToLeftWhenScrollEnd,
        });
      }
    };

    scrollView.addEventListener('pointerdown', handlePointerDown);
    scrollView.addEventListener('pointermove', handlePointerMove);
    scrollView.addEventListener('pointerup', handlePointerUp);
    scrollView.addEventListener('scroll', handleScrollEnd);

    return () => {
      scrollView.removeEventListener('pointerdown', handlePointerDown);
      scrollView.removeEventListener('pointermove', handlePointerMove);
      scrollView.removeEventListener('pointerup', handlePointerUp);
      scrollView.removeEventListener('scroll', handleScrollEnd);
    };
  }, [episode, scrollView, container]);

  if (!episode) return null;

  return (
    <_Container ref={containerRef}>
      <_Wrapper ref={scrollViewRef} $paddingInline={viewerPaddingInline} $pageWidth={(container?.getBoundingClientRect().height ?? 0) / 100 * IMAGE_WIDTH}>
        {episode.pages.map((page) => (
          <ComicViewerPage key={page.id} pageImageId={page.image.id} />
        ))}
      </_Wrapper>
    </_Container>
  );
};

const ComicViewerCoreWithSuspense: React.FC<Props> = ({ episodeId }) => {
  return (
    <Suspense fallback={null}>
      <ComicViewerCore episodeId={episodeId} />
    </Suspense>
  );
};

export { ComicViewerCoreWithSuspense as ComicViewerCore };

import { useRef, useState, useEffect } from 'react';
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
  const [scrollView, scrollViewRef] = useState<HTMLDivElement | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const pageCountParViewRef = useRef<number>(1);
  const pageWidthRef = useRef<number>(0);
  const viewerPaddingInlineRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleResize = () => {
      const cqw = container.getBoundingClientRect().width / 100;
      const cqh = container.getBoundingClientRect().height / 100;

      pageCountParViewRef.current = (100 * cqw) / (100 * cqh) < (2 * IMAGE_WIDTH) / IMAGE_HEIGHT ? 1 : 2;
      pageWidthRef.current = ((100 * cqh) / IMAGE_HEIGHT) * IMAGE_WIDTH;
      viewerPaddingInlineRef.current =
        (100 * cqw - pageWidthRef.current * pageCountParViewRef.current) / 2 + (pageCountParViewRef.current === 2 ? pageWidthRef.current : 0);
    };

    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const scrollView = scrollViewRef.current;
    if (!scrollView) return;

    const handleScroll = () => {
      const scrollViewCenterX = scrollView.getBoundingClientRect().width / 2;
      const children = Array.from(scrollView.children) as HTMLDivElement[];

      let scrollToLeft = Number.MAX_SAFE_INTEGER;

      for (const child of children) {
        const childCenterX = child.getBoundingClientRect().left + child.getBoundingClientRect().width / 2;
        const candidateScrollToLeft = childCenterX - scrollViewCenterX;

        if (Math.abs(candidateScrollToLeft) < Math.abs(scrollToLeft)) {
          scrollToLeft = candidateScrollToLeft;
        }
      }

      scrollView.scrollTo({
        left: scrollView.scrollLeft + scrollToLeft,
        behavior: 'smooth',
      });
    };

    scrollView.addEventListener('scroll', handleScroll);

    return () => {
      scrollView.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Container ref={containerRef}>
      <Wrapper ref={scrollViewRef} $paddingInline={viewerPaddingInlineRef.current} $pageWidth={pageWidthRef.current}>
        {episode?.pages.map((page) => (
          <ComicViewerPage key={page.id} pageImageId={page.image.id} />
        ))}
      </Wrapper>
    </Container>
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

import React, { Suspense, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { addUnitIfNeeded } from '../../../lib/css/addUnitIfNeeded';
import { useEpisode } from '../../episode/hooks/useEpisode';

import { ComicViewerPage } from './ComicViewerPage';

const IMAGE_WIDTH = 1075;
const IMAGE_HEIGHT = 1518;

function getScrollToLeft({
  pageCountParView,
  pageWidth,
  scrollView,
}: {
  pageCountParView: number;
  pageWidth: number;
  scrollView: HTMLDivElement;
}) {
  const scrollViewClientRect = scrollView.getBoundingClientRect();
  const scrollViewCenterX = (scrollViewClientRect.left + scrollViewClientRect.right) / 2;

  const children = Array.from(scrollView.children) as HTMLDivElement[];

  let scrollToLeft = Number.MAX_SAFE_INTEGER;

  for (let times = 0; times < 2; times++) {
    for (const [idx, child] of children.entries()) {
      const nthChild = idx + 1;
      const elementClientRect = child.getBoundingClientRect();

      const scrollMargin =
        pageCountParView === 2
          ? {
              left: nthChild % 2 === 0 ? pageWidth : 0,
              right: nthChild % 2 === 1 ? pageWidth : 0,
            }
          : { left: 0, right: 0 };

      const areaClientRect = {
        bottom: elementClientRect.bottom,
        left: elementClientRect.left - scrollMargin.left,
        right: elementClientRect.right + scrollMargin.right,
        top: elementClientRect.top,
      };

      const areaCenterX = (areaClientRect.left + areaClientRect.right) / 2;
      const candidateScrollToLeft = areaCenterX - scrollViewCenterX;

      if (Math.abs(candidateScrollToLeft) < Math.abs(scrollToLeft)) {
        scrollToLeft = candidateScrollToLeft;
      }
    }
  }

  return scrollToLeft;
}

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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollViewRef = useRef<HTMLDivElement | null>(null);
  const [pageCountParView, setPageCountParView] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    const scrollView = scrollViewRef.current;

    if (!container || !scrollView) return;

    const handleResize = () => {
      const cqw = (container.getBoundingClientRect().width ?? 0) / 100;
      const cqh = (container.getBoundingClientRect().height ?? 0) / 100;
      const newPageCountParView = (100 * cqw) / (100 * cqh) < (2 * IMAGE_WIDTH) / IMAGE_HEIGHT ? 1 : 2;
      setPageCountParView(newPageCountParView);
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
      const scrollToLeft = getScrollToLeft({
        pageCountParView,
        pageWidth: (100 * scrollView.getBoundingClientRect().height) / IMAGE_HEIGHT,
        scrollView,
      });
      scrollView.scrollBy({
        behavior: 'smooth',
        left: scrollToLeft,
      });
    };

    scrollView.addEventListener('scroll', handleScroll);

    return () => {
      scrollView.removeEventListener('scroll', handleScroll);
    };
  }, [pageCountParView]);

  return (
    <Container ref={containerRef}>
      <Wrapper ref={scrollViewRef} $paddingInline={0} $pageWidth={IMAGE_WIDTH}>
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

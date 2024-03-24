import { useRef, useEffect } from 'react';
import styled from 'styled-components';

import { decrypt } from '@wsh-2024/image-encrypt/src/decrypt';

import { getImageUrl } from '../../../lib/image/getImageUrl';

const Canvas = styled.canvas`
  width: 100%; /* 幅を100%に */
`;

type Props = {
  pageImageId: string;
};

export const ComicViewerPage = ({ pageImageId }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const loadPageImage = async () => {
      const image = new Image();
      image.src = getImageUrl({
        format: 'jxl',
        imageId: pageImageId,
      });
      await image.decode();

      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      decrypt({
        exportCanvasContext: ctx,
        sourceImage: image,
        sourceImageInfo: {
          height: image.naturalHeight,
          width: image.naturalWidth,
        },
      });

      canvas.setAttribute('role', 'img');
    };

    loadPageImage();
  }, [pageImageId]);

  return <Canvas ref={canvasRef} />;
};

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { styled } from 'styled-components';
import invariant from 'tiny-invariant';

import { useAuthor } from '../../features/author/hooks/useAuthor';
import { BookListItem } from '../../features/book/components/BookListItem';
import { Box } from '../../foundation/components/Box';
import { Flex } from '../../foundation/components/Flex';
import { Image } from '../../foundation/components/Image';
import { Separator } from '../../foundation/components/Separator';
import { Spacer } from '../../foundation/components/Spacer';
import { Text } from '../../foundation/components/Text';
import { useImage } from '../../foundation/hooks/useImage';
import { Color, Space, Typography } from '../../foundation/styles/variables';

const _HeadingWrapper = styled.section`
  display: grid;
  align-items: start;
  grid-template-columns: auto 1fr;
  padding-bottom: ${Space * 2}px;
  gap: ${Space * 2}px;
`;

const _AuthorImageWrapper = styled.div`
  width: 128px;
  height: 128px;
  > img {
    border-radius: 50%;
  }
`;

const AuthorDetailPage: React.FC = () => {
  const { authorId } = useParams();
  invariant(authorId);

  const [authorData, setAuthorData] = useState(null);
  const imageUrl = useImage({ height: 128, imageId: authorData?.image.id, width: 128 });

  useEffect(() => {
    const fetchAuthorData = async () => {
      const author = await useAuthor({ params: { authorId } });
      setAuthorData(author);
    };
    fetchAuthorData();
  }, [authorId]);

  if (!authorData) {
    return null; // データが取得されるまでローディングを表示する
  }

  return (
    <Box height="100%" px={Space * 2}>
      <_HeadingWrapper aria-label="作者情報">
        {imageUrl != null && (
          <_AuthorImageWrapper>
            <Image key={authorData.id} alt={authorData.name} height={128} objectFit="cover" src={imageUrl} width={128} />
          </_AuthorImageWrapper>
        )}

        <Flex align="flex-start" direction="column" gap={Space * 1} justify="flex-start">
          <Text color={Color.MONO_100} typography={Typography.NORMAL20} weight="bold">
            {authorData.name}
          </Text>
          <Text as="p" color={Color.MONO_100} typography={Typography.NORMAL14}>
            {authorData.description}
          </Text>
        </Flex>
      </_HeadingWrapper>

      <Separator />

      <Box as="section" maxWidth="100%" py={Space * 2} width="100%">
        <Text as="h2" color={Color.MONO_100} typography={Typography.NORMAL20} weight="bold">
          作品一覧
        </Text>

        <Spacer height={Space * 2} />

        <Flex align="center" as="ul" direction="column" justify="center">
          {authorData.books.map((book) => (
            <BookListItem key={book.id} bookId={book.id} />
          ))}
          {authorData.books.length === 0 && (
            <>
              <Spacer height={Space * 2} />
              <Text color={Color.MONO_100} typography={Typography.NORMAL14}>
                この作者の作品はありません
              </Text>
            </>
          )}
        </Flex>
      </Box>
    </Box>
  );
};

export { AuthorDetailPage }; // Suspenseを使わないため、別のコンポーネントに分ける必要はない

import { CircularProgress, Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { useBook } from '../../features/books/hooks/useBook';
import { EpisodeDetailEditor } from '../../features/episodes/components/EpisodeDetailEditor';
import { episodeCreateRoute } from '../../routes';

export const EpisodeCreatePage: React.FC = () => {
  const { bookId } = episodeCreateRoute.useParams();
  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedBook = await useBook({ bookId });
        setBook(fetchedBook);
      } catch (error) {
        console.error('Error fetching book:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Clean-up function
    return () => {
      // Any clean-up code here if needed
    };
  }, [bookId]);

  if (loading) {
    return (
      <Flex align="center" height="100%" justify="center" width="100%">
        <CircularProgress isIndeterminate size={120} />
      </Flex>
    );
  }

  if (!book) {
    return <div>書籍が見つかりませんでした。</div>;
  }

  return <EpisodeDetailEditor book={book} />;
};

import { Box, Heading, Text, Flex } from '@chakra-ui/react';
import { Description } from '@ethersproject/properties';
import { AiOutlineTrophy } from 'react-icons/ai';

export default function WinnerHeadline({title, description}) {
  return (
      <Flex direction={{base:"column", xl:"row"}} mb={4}>
        <AiOutlineTrophy size={120} color="gold" />
        <Box textAlign="center" py={10} px={6}>
          <Heading as="h2" size="xl" mt={6} mb={2}>
            {title}
          </Heading>
          <Text color={'gray.500'}>
            {description}
          </Text>
        </Box>
    </Flex>
  );
}
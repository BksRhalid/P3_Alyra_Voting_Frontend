import { Flex, Spacer, Heading } from '@chakra-ui/react'


const Hero = ({ title }) => (
  <Flex
  justifyContent="center"
    alignItems="center"
    bgGradient="linear(to-l, #7928CA, #FF0080)"
    bgClip="text"
  >
    <Heading py={4} mb={10} fontSize="6vw">{title}</Heading>
  </Flex>
)

export default Hero

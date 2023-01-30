import * as React from 'react';
import {
  Container,
  Box,
  Text,
  Flex,
  Img,
  Spacer,
  Heading,
  Menu,
  MenuItem,
  MenuDivider,
  MenuButton,
  IconButton,
  MenuList,
  HStack,
  Button,
  useDisclosure,
  useColorModeValue
} from '@chakra-ui/react';
import NextLink from 'next/link'
import { Link } from '@chakra-ui/react'
// Here we have used framer-motion package for animations
import { motion } from 'framer-motion';
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Navbar = () => {
  const { onOpen } = useDisclosure();

  return (
    <Container maxW="7xl" pt={{ base: 5, md: 10 }}>
      <Flex mb="30px" align="center">
        <HStack>
          <Link href="/">
            <Box p="2">
              <motion.div whileHover={{ scale: 1.1 }}>
                <Heading
                  as="h1"
                  fontSize={{ base: 'xl', sm: 'l' }}
                  bgGradient="linear(to-l,#00635D,#4FD1C5)"
                  bgClip="text"
                  _focus={{ boxShadow: 'none', outline: 'none' }}
                  _hover={{
                    textDecoration: 'none',
                    bgGradient:'linear(to-l, #4FD1C5,#00635D )'
                  }}
                >
                  DAO
                </Heading>
              </motion.div>
            </Box>
          </Link>
        </HStack>
        <Spacer />
        <Box>
          <HStack>
            <Flex p="1rem">
            <ConnectButton chainStatus="none" label="Connexion" showBalance={false}/>
            </Flex>
          </HStack>
        </Box>
      </Flex>
    </Container>
  );
};

export default Navbar;
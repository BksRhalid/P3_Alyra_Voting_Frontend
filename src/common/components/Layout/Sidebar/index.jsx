import { Flex, Text } from '@chakra-ui/react';
import React, { useState } from 'react';




const Sidebar = () => {
  const [isActive, setIsActive] = useState('');

  return (
    <Flex>
      <Text> Hello Sidebar</Text>
    </Flex>
  )
}

export default Sidebar
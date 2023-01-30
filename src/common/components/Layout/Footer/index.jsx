import { Text, Flex } from '@chakra-ui/react'
import { withTheme } from '@emotion/react'
import { useEffect } from 'react'

export default function Footer() {
    let date = 0

    useEffect(() => {
        const date = new Date().getFullYear()
    }, [])

    return (
        <Flex p="2rem" justifyContent="right"
        minH="5vh"
          bgGradient="linear(to-l, #00635D, #4FD1C5)">
            <div>
                <Text color="white">@Alyra Decentralized Organization {date} </Text>
            </div>
        </Flex>
    )
}
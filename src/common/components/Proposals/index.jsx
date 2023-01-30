import React from 'react'
import { Icon,Flex, Text, Button, useToast, Spinner, TableContainer, Table, Thead, Tr, Td, Th, Tbody, Container, SimpleGrid,  Alert, AlertIcon, Link, Input, Box, Progress, HStack, VStack, Stack, StackDivider,   FormLabel,
  FormControl, Textarea, FormHelperText, FormErrorMessage, color, BeatLoader} from "@chakra-ui/react";
import { abi, contractAddress} from "../../../constants"
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useProvider, useAccount, useSigner } from 'wagmi';
import {MainPanel, PanelContainer, PanelContent} from '../Layout/Panel';
import Sidebar from '../Layout/Sidebar';
import { MdAdd } from "react-icons/md";
import { FaPencilAlt, FaVoteYea } from "react-icons/fa";
import { AiOutlineUserAdd, AiOutlineCalculator} from "react-icons/ai";
import {BiMessageAltEdit, BiMessageAltX} from "react-icons/bi";
import {BsFillCalendarXFill} from "react-icons/bs";


const Proposals = () => {
  const { address, isConnected } = useAccount();
  const provider = useProvider();
  const { data: signer } = useSigner();

  const [step, setStep] = useState([])
  const [owner, setOwner] = useState([])
  const [progression, setProgression] = useState(0)
  const [workflow, setWorkflow] = useState("")
  const [proposalsLength, setProposalsLength] = useState(0);
  const [input, setInput] = useState("");
  const [Voter, setVoter] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [color, setColor] = useState("");
  const [events, setEvents] = useState("");
  const [winnerPropal, setWinnerPropal] = useState("");

  //CHAKRA-UI
  const toast = useToast({
    duration: 5000,
    isClosable: true,
    position: "top",
    title: "Container style is updated",
    containerStyle: {
      width: "500px",
      maxWidth: "80%",
    },
  });

  useEffect(() => {
      try {
      const contract = new ethers.Contract(contractAddress, abi, provider)
      contract.on('WorkflowStatusChange', (from, to, event) => {
        // toast({
        //   title: `${event.event}`,
        //   description: `Status change from ${from} to ${to}`,
        //   status: 'success',
        //   duration: 2000,
        //   isClosable: true,
        // })
        setStep(to)
        return () => {
          contract.removeAllListeners();
        };
      })

    }
    catch (e){
      toast({
        title: 'Error',
        description: e.message , //An error occured, please try again.
        status: 'error',
        duration: 2000,
        isClosable: true,
      })
    }  
  // try {
  //   const contract = new ethers.Contract(contractAddress, abi, provider)
  //   contract.on('ProposalRegistered', (proposalId, event) => {
  //   // console.log(proposalId, event)
  //   let length = proposalId + 1
  //   setProposalsLength(length)
  //   // getProposals()
  //   toast({
  //     title: `${event.event}`,
  //     description: `Proposal ${proposalId} registered`,
  //     status: 'success',
  //     duration: 5000,
  //     isClosable: true,
  //   })
  //   return () => {
  //     contract.removeAllListeners();
  //   };
  // })
  // }
  // catch (e){
  //   toast({
  //     title: 'Error',
  //     description: e.message , //An error occured, please try again.
  //     status: 'error',
  //     duration: 5000,
  //     isClosable: true,
  //   })
  //   } 
      
  }, [isConnected, address])

  useEffect(() => {
    registerProposal()
    // console.log("registerProposal : ", events)
  }, [])

  const updateStatus = (expr) => {
    switch (expr) {
      case 0:
          setProgression(0)
          setWorkflow("Voters registration ongoing")
          setColor("gray.400")
          setIsActive(false)
          break
      case 1:
          setProgression(20)
          setWorkflow("Registering proposals started")
          setColor("gray.400")
          setIsActive(true)
          break
      case 2:
        setProgression(40)
        setWorkflow("Registering proposals ended")
        setColor("gray.400")
        setIsActive(false)
        break
      case 3:
          setProgression(60)
          setWorkflow("Vote started")  
          setColor("green")   
          setIsActive(true)     
          break  
      case 4:
          setProgression(80)
          setWorkflow("Votings session ended")
          setColor("red.500")
          setIsActive(false)
          break
      case 5:
        setProgression(100)
        setWorkflow("Winning Proposals is ready")  
        setColor("gray.400") 
        setIsActive(false)
        break          
      default:
        return null
    }
  }

  // let proposals = []

  // const getProposals = async() => {
  //   const contract = new ethers.Contract(contractAddress, abi, provider)
  //   for (let i = 1; i <= proposalsLength; i++) {
  //     let proposal = await contract.getOneProposal(i)
  //     let proposalId = i
  //     // let proposalDescription = proposal.description
  //     proposals = [...proposals, proposalId]
  //     // proposals.push({proposalId, proposalDescription})
  //   }
  //   setProposalsTab(proposals)
  //   // console.log("Proposals Tab is :", proposalsTab)
  // }

  const registerProposal = async() => { 
    
    const contract = new ethers.Contract(contractAddress, abi, provider)
    const latest = await provider.getBlockNumber()  //Get All the Events
    
    let filter = {
      address: contractAddress,
      // fromBlock: 8373573
  };

    // let events = await contract.queryFilter(filter)

    const startBlock = 0; //Block number where the contract was deployed
    const endBlock = latest;
    let logs = []; let proposalsEvent = [];

    // for(let i = startBlock; i < endBlock; i += 5000) {
    //   // console.log("i",i)
    //   const _startBlock = i;
    //   const _endBlock = Math.min(endBlock, i + 4999);
      const data = await contract.queryFilter(filter, startBlock, endBlock);
      // console.log("data", data)
      logs = [...logs, ...data]
    // }

    //For each event, we put it in the right array
    logs.forEach(event => {
      if(event.event === "ProposalRegistered") {
        proposalsEvent.push(event.args.proposalId)
      }
    })
    let proposalsTab = []
    for (let i = 0; i < proposalsEvent.length; i++) {
      let id = parseInt(proposalsEvent[i])
      let description = await contract.getOneProposal(id)
      let thisEvent = {
        id: id,
        description: description.description,
      }
      proposalsTab.push(thisEvent)
    }
    setEvents(proposalsTab)
  }

  const getDatas = async() => {
    const contract = new ethers.Contract(contractAddress, abi, provider) 
    let owner = await contract.owner()
    setOwner(owner)
    let step = await contract.workflowStatus()
    setStep(step)
    updateStatus(step)
    registerProposal()
    // getProposals()
    try {
      const contract = new ethers.Contract(contractAddress, abi, provider) 
      let isVoter = await contract.getVoter(address)
      // console.log("Address isVoter :", isVoter)
      setVoter(isVoter)
    }
    catch (e){
      // console.log(e.reason)
      if (e.reason === "You're not a voter") {
        setVoter(false)
      }
      else {
        toast({
          title: 'Error',
          description: "An error occured, please try again.",
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    }
    // console.log("Voter is :", Voter)
}

  useEffect(() => {
    getDatas()
    registerProposal()
  }, [isConnected, address])

  const startProposalsRegistering = async() => {
    try {
        const contract = new ethers.Contract(contractAddress, abi, signer) 
        let transaction = await contract.startProposalsRegistering()
        await transaction.wait(1)
        getDatas()
        toast({
          title: 'Congratulations!',
          description: "Proposals Registering ended!",
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
      }
catch (e){
  const data = e.reason.split("'")
  if (data[1] === "Registering proposals cant be started now") {
      toast({
        title: 'Error',
        description: "Registering proposals cant be started now",
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    else {
      toast({
        title: 'Error',
        description: "An error occured, please try again.",
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }}
  }

  const endProposalsRegistering = async() => {
    try {
      const contract = new ethers.Contract(contractAddress, abi, signer) 
      let transaction = await contract.endProposalsRegistering()
      await transaction.wait(1)
      getDatas()
      toast({
        title: 'Congratulations!',
        description: "Proposals Registering ended!",
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch (e){
      const data = e.reason.split("'")
      if (data[1] === "Registering proposals havent started yet") {
          toast({
            title: 'Error',
            description: "Registering proposals havent started yet",
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
        else {
          toast({
            title: 'Error',
            description: "An error occured, please try again.",
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
    }
    }
    
  }

  const startVotingSession = async() => {
    try {
      const contract = new ethers.Contract(contractAddress, abi, signer) 
      let transaction = await contract.startVotingSession()
      await transaction.wait(1)
      getDatas()
      getDatas()
      toast({
        title: 'Congratulations!',
        description: "Voting session is now open !",
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch (e){
      const data = e.reason.split("'")
      if (data[1] === "Registering proposals phase is not finished") {
          toast({
            title: 'Error',
            description: "Registering proposals phase is not finished",
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
        else {
          toast({
            title: 'Error',
            description: "An error occured, please try again.",
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
    }
    }
    
  }

  const endVotingSession = async() => {
    try {
      const contract = new ethers.Contract(contractAddress, abi, signer) 
      let transaction = await contract.endVotingSession()
      await transaction.wait(1)
      getDatas()
      toast({
        title: 'Congratulations!',
        description: "Voting session is now closed !",
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch (e){
      const data = e.reason.split("'")
      if (data[1] === "Registering proposals phase is not finished") {
          toast({
            title: 'Error',
            description: "Registering proposals phase is not finished",
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
        else {
          toast({
            title: 'Error',
            description: "An error occured, please try again.",
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
    }
    }
  }

  const tallyVotes = async() => {    
    try {
      const contract = new ethers.Contract(contractAddress, abi, signer) 
    let transaction = await contract.tallyVotes()
    await transaction.wait(1)
    getDatas()
    getWinner()
    console.log("Winner :", winningProposalID)
      toast({
        title: 'Congratulations!',
        description: "Votes are now tallied !",
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch (e){
      const data = e.reason.split("'")
      if (data[1] === "Current status is not voting session ended") {
          toast({
            title: 'Error',
            description: "Current status is not voting session ended",
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
        else {
          toast({
            title: 'Error',
            description: "An error occured, please try again.",
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
    }
    }
  }

  const getProposalWinner = async() => {
    try {
      const contract = new ethers.Contract(contractAddress, abi, provider)
      let winner = await contract.winningProposalID()
      let winnerID = winner.toNumber()
      let winnerProposal = await contract.getOneProposal(winnerID)
      setWinnerPropal(winnerProposal.description)
    }
    catch (error) {
      console.log("Aie l'erreur :", error)
      toast({
        title: 'Error',
        description: "An error occured, please try again.",
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }



  const getVoter = async() => {
    try {
      const contract = new ethers.Contract(contractAddress, abi, signer)
      let voter = await contract.getVoter(address)
      console.log(voter)
      getDatas()
      toast({
        title: 'Congratulations!',
        description: "You add a new Voter!",
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch (error) {
      console.log(error.message)
      toast({
        title: 'Error',
        description: "An error occured, please try again.",
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const getOneProposal = async(id) => {
    try {
      const contract = new ethers.Contract(contractAddress, abi, signer)
      let proposal = await contract.getOneProposal(id)
      getDatas()
    }
    catch (error) {
      console.log("get one proposal function error",error.message)
    }
  }

  const addVoter = async() => {
    try {
        const contract = new ethers.Contract(contractAddress, abi, signer)
        let transaction = await contract.addVoter(input)
        await transaction.wait(1)
        getDatas()
        toast({
          title: 'Congratulations!',
          description: "You add a new Voter!",
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
      }
      catch (e){
        const data = e.reason.split("'")
        if (data[1] === "Voters registration is not open yet") {
            toast({
              title: 'Error',
              description: "Voters registration is not open yet",
              status: 'error',
              duration: 5000,
              isClosable: true,
            })
          }
        else if (data[1] === "Already registered") {
            toast({
              title: 'Error',
              description: "Voter is already registered",
              status: 'error',
              duration: 5000,
              isClosable: true,
            })
          }
          else {
            toast({
              title: 'Error',
              description: "An error occured, please try again.",
              status: 'error',
              duration: 5000,
              isClosable: true,
            })
      }
  }
}

  const addProposal = async() => {
    try {
      const contract = new ethers.Contract(contractAddress, abi, signer)
      let transaction = await contract.addProposal(input)
      await transaction.wait(1)
      getDatas()
      toast({
        title: 'Congratulations!',
        description: "You add a new Proposal!",
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch (e){
      const data = e.reason.split("'")
      // console.log(data)
      if (data[1] === "Proposals are not allowed yet") {
          toast({
            title: 'Error',
            description: "Proposals are not allowed yet",
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
      else if (data[1] === "Vous ne pouvez pas ne rien proposer") {
          toast({
            title: 'Error',
            description: "Vous ne pouvez pas ne rien proposer",
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
        else {
          toast({
            title: 'Error',
            description: "An error occured, please try again.",
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
    }
}}

  const setVote = async(id) => {
   
    try {
      const contract = new ethers.Contract(contractAddress, abi, signer)
      let transaction = await contract.setVote(id)
      await transaction.wait(1)
      getDatas()
      toast({
        title: 'Congratulations!',
        description: "You have voted!",
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch (e) {
      const data = e.reason.split("'")
      if (data[1] === "You have already voted") {
        toast({
          title: 'Error',
          description: "You have already voted",
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    else if (data[1] === "Voting session havent started yet") 
    {
        toast({
          title: 'Error',
          description: "Voting session havent started yet",
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
      else if (data[1] === "Proposal not found") 
      {
          toast({
            title: 'Error',
            description: "Proposal not found",
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
      else {
        toast({
          title: 'Error',
          description: "An error occured, please try again.",
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    }
  }

  return (
    <Flex direction="row"   minW="90vw" minH="90vh" bg="gray.500" justifyContent="space-between" alignItems="center">
      <VStack minW="30vw" minH="90vh" justifyContent="initial"  alignItems="center" bg="black" p={{base:"5px", xl:"20px"}}>
          <Text color="white" fontSize="2xl" fontWeight="bold">
            Workflow : {progression}%
            { winnerPropal !== "" && <Text color="white" fontSize="2xl" fontWeight="bold"> Winning Proposal : {winnerPropal} </Text>}
          </Text>
          <Flex
      flex="1"
      direction="column"
      mt="1rem"
      justifyContent={{base: "center", xl: "flex-start"}}
      alignItems="center"
    >  

    <VStack spacing="24px">
      <Button isActive={step===0}  leftIcon={<AiOutlineUserAdd  />} rounded="md" minW={{base: "50px",}} minH={{base: "50px",}}  p={{base:"5px", xl:"40px"}}  bgGradient={"linear(to-l, #00635D, #4FD1C5)"} _hover={{bgGradient: "linear(to-r, green.400, green.800)",}} >
        <Text fontSize="2xs" fontWeight="medium"> Registration session set-up </Text>  
      </Button> 
      <Button isActive={step===1}  leftIcon={<BiMessageAltEdit />}  isLoading={isLoading} loadingText='Submitting' rounded="md" minW={{base: "50px",}} minH={{base: "50px",}} p={{base:"5px", xl:"40px"}}  onClick={() => startProposalsRegistering()} bgGradient={"linear(to-l, #00635D, #4FD1C5)"} _hover={{bgGradient: "linear(to-r, green.400, green.800)",}} >
        <Text fontSize="2xs" fontWeight="medium"> Start proposal session</Text>  
      </Button> 
      <Button isActive={step===2} leftIcon={<BiMessageAltX  />}  rounded="md" minw={{base: "50px",}} minh={{base: "50px",}} p={{base:"5px", xl:"40px"}}  onClick={() => endProposalsRegistering()} bgGradient={"linear(to-l, #00635D, #4FD1C5)"} _hover={{bgGradient: "linear(to-r, green.400, green.800)",}} >
        <Text fontSize="2xs" fontWeight="medium"> End proposal session </Text>  
      </Button> 
      <Button isActive={step===3} leftIcon={<FaVoteYea />}  rounded="md" minw={{base: "50px",}} minh={{base: "50px",}} p={{base:"5px", xl:"40px"}}  onClick={() => startVotingSession()} bgGradient={"linear(to-l, #00635D, #4FD1C5)"} _hover={{bgGradient: "linear(to-r, green.400, green.800)",}} >
        <Text fontSize="2xs" fontWeight="medium"> Start Voting session  </Text>  
      </Button> 
      <Button isActive={step===4} leftIcon={<BsFillCalendarXFill  />}  rounded="md" minw={{base: "50px",}} minh={{base: "50px",}} p={{base:"5px", xl:"40px"}}  onClick={() => endVotingSession()} bgGradient={"linear(to-l, #00635D, #4FD1C5)"} _hover={{bgGradient: "linear(to-r, green.400, green.800)",}} >
        <Text fontSize="2xs" fontWeight="medium"> End Voting session </Text>  
      </Button> 
      <Button isActive={step===5} leftIcon={<AiOutlineCalculator  />}  rounded="md" minw={{base: "50px",}} minh={{base: "50px",}} p={{base:"5px", xl:"40px"}}  onClick={() => tallyVotes()} bgGradient={"linear(to-l, #00635D, #4FD1C5)"} _hover={{bgGradient: "linear(to-r, green.400, green.800)",}} >
        <Text fontSize="2xs" fontWeight="medium"> Display Winning Proposal</Text>  
      </Button> 
      <Button isActive={step===5} leftIcon={<AiOutlineCalculator  />}  rounded="md" minw={{base: "50px",}} minh={{base: "50px",}} p={{base:"5px", xl:"40px"}}  onClick={() => getProposalWinner()} bgGradient={"linear(to-l, #00635D, #4FD1C5)"} _hover={{bgGradient: "linear(to-r, green.400, green.800)",}} >
        <Text fontSize="2xs" fontWeight="medium"> THE winner is : {winnerPropal} </Text>  
      </Button> 
      </VStack>    
      </Flex>
      </VStack>
      <Flex direction="column" bg="gray.300" justifyContent="space-between" alignItems="center">
        {address === owner ? (
            <Stack as="form" p={6} minW="60vw" minH="30vh" justifyContent="flex-start" bg="gray.200">
            <FormControl id="proposal" justifyContent="center" alignItems="center" >
              <FormLabel justifyContent="center" alignItems="center" >Add a new voters</FormLabel>
              <Textarea
                type="textarea"
                rounded="md"
                bg="white"
                placeholder="Address of the new voter"
                onChange={(e) => setInput(e.target.value)}
              />
            </FormControl>
            <Button leftIcon={<MdAdd />} spinner={<BeatLoader size={8} color='white' />} bgGradient="linear(to-l, #00635D, #4FD1C5)" _hover={{bgGradient: "linear(to-r, green.400, green.800)",}}
              color="white"
              variant="solid"
              size="md"
              rounded="md"
              w={{base:"50%",xl:"20%"}}
              onClick={() => addVoter(input)}
            >
              Add this voter
            </Button>
        </Stack>
        ) : (
          <Text> Only Owner can add voter</Text>
        )}
        {Voter ? (
            <Stack as="form" p={6} minW="60vw" minH="30vh" justifyContent="flex-start" bg="gray.200">
            <FormControl id="proposal" justifyContent="center" alignItems="center" >
              <FormLabel justifyContent="center" alignItems="center" >Add a new proposal</FormLabel>
              <Textarea
                type="textarea"
                rounded="md"
                bg="white"
                placeholder="Describe here the proposal you want to add"
                onChange={(e) => setInput(e.target.value)}
              />
            </FormControl>
            <Button leftIcon={<MdAdd />} bgGradient="linear(to-l, #00635D, #4FD1C5)" _hover={{bgGradient: "linear(to-r, green.400, green.800)",}}
              color="white"
              variant="solid"
              size="md"
              rounded="md"
              w={{base:"50%",xl:"20%"}}
              onClick={() => addProposal(input)}
            >
              Send this proposal
            </Button>
            </Stack>
          ) : (
            <Text color="red"> You are not a voter</Text>
            )}



        {events.length !== 0 ? (
        <Stack direction={['column', 'row']} minW="60vw" minH="60vh" justifyContent="center" alignItems="center" bg="white" rounded="md">
          <Box fontSize="xs" bg="white" justifyContent="center" alignItems="center" >
            <Table colorScheme='teal' minW="50vw" minH="50vh">
              <Thead>
                <Tr>
                  <Th>Proposal ID</Th>
                  <Th>Description</Th>
                  <Th >Action</Th>
                </Tr>
              </Thead>
              <Tbody>
              {events.map(({id,description}) => {
                return (
                <Tr key={id}>
                  <Td>{id}</Td>
                  <Td>{description}</Td>
                  <Td>
                      <Button p="10px" bg={color} onClick={() => setVote(id)} >
                        <Flex cursor="pointer" align="center">
                          <Text color="white" fontSize="xs">
                            VOTE
                          </Text>
                        </Flex>
                      </Button>
                  </Td>
                </Tr>
                )})}
              </Tbody>
            </Table>
          </Box>
        </Stack>) : (
          <Text> No proposals yet</Text>
        )}
      </Flex>
    </Flex>  
  )
}

export default Proposals;


           {/* {(() => {
            switch (step) {
              case 0:
                return (
                  <Flex direction="column">            
                  <Text>Proposals registering is not started yet.</Text>
                    <Button
                    ml="1rem"
                    px={8}
                    size="md"
                    onClick={() => startProposalsRegistering()}>
                      startProposalsRegistering
                  </Button>
                </Flex> 
                )
              case 1:
                return ( 
                      <Flex direction="column">            
                        <Text>Proposals registering is started.</Text>
                        <Button   
                          ml="1rem"
                          px={8}
                          size="md"
                          onClick={() => endProposalsRegistering()}>endProposalsRegistering
                        </Button>
                      </Flex>
                  )
              case 2:
                return (
                    <Flex direction="column">            
                      <Text>Proposals registering is ended.</Text>
                      <Button   
                        ml="1rem"
                        px={8}
                        size="md"
                        onClick={() => startVotingSession()}>startVotingSession
                      </Button>
                  </Flex>

                )
              case 3:
                return (                  
                  <Flex direction="column">            
                    <Text>Voting session is started.</Text>
                    <Button   
                      ml="1rem"
                      px={8}
                      size="md"
                      onClick={() => endVotingSession()}>endVotingSession
                    </Button>
                  </Flex>
                  )
                case 4:
                  return (
                    <Flex direction="column">            
                      <Text>Voting session is ended.</Text>
                      <Button   
                          ml="1rem"
                          px={8}
                          size="md"
                          onClick={() => tallyVotes()}>tallyVotes
                    </Button>
                  </Flex>)
                case 5:
                  return (                  
                    <Flex direction="column">            
                    <Text>Something went wrong.</Text></Flex>
                    );
              default:
                return null
            }
             })()} */}

      //        <MainPanel bg="teal.300" rounded="md" w={{base: "90%",}} p={{base:"5px", xl:"40px"}} justifyContent="center" alignItems="center">
      //        <Box h='40px' bg="teal.300">
      //        <Text
      //        fontSize="xs" colorScheme={progression === 100 ? "teal" : "cyan"} pt=".2rem">
      //        {workflow}                
      //        </Text>
      //        </Box>
      //        <Box bg="teal.300">
      //       <Progress
      //          hasStripe 
      //          colorScheme={progression === 100 ? "teal" : "cyan"}
      //          size="md"
      //          value={progression}
      //          borderRadius="15px"
      //        />
      //        </Box>
      //  </MainPanel>




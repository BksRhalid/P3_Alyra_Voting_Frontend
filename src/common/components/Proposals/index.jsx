import React from 'react'
import { Icon,Flex, Text, Button, useToast, Spinner, TableContainer, Table, Thead, Tr, Td, Th, Tbody, Container, SimpleGrid,  Alert, AlertIcon, Link, Input, Box, Progress, HStack, VStack, Stack, StackDivider, FormLabel,
  FormControl, Textarea, FormHelperText, FormErrorMessage, color, BeatLoader, Show, Spacer} from "@chakra-ui/react";
import { abi, contractAddress} from "../../../constants"
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useProvider, useAccount, useSigner } from 'wagmi';
import { MdAdd } from "react-icons/md";
import { FaPencilAlt, FaVoteYea } from "react-icons/fa";
import { AiOutlineUserAdd, AiOutlineCalculator, AiFillTrophy} from "react-icons/ai";
import {BiMessageAltEdit, BiMessageAltX} from "react-icons/bi";
import {BsFillCalendarXFill} from "react-icons/bs";
import ErrorHeadline from './components/ErrorHeadline';
import InfoHeadline from './components/InfoHeadline';
import SuccessHeadline from './components/SuccessHeadline';
import WarningHeadline from './components/WarningHeadline';
import WinnerHeadline from './components/WinnerHeadline';



const Proposals = () => {
  const { address, isConnected } = useAccount();
  const provider = useProvider();
  const { data: signer } = useSigner();

  const [step, setStep] = useState([])
  const [owner, setOwner] = useState("")
  const [progression, setProgression] = useState(0)
  const [workflow, setWorkflow] = useState("")
  const [proposalsLength, setProposalsLength] = useState(0);
  const [input, setInput] = useState("");
  const [isVoter, setIsVoter] = useState(false);
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

  // useEffect(() => {
  //     try {
  //     const contract = new ethers.Contract(contractAddress, abi, provider)
  //     contract.on('WorkflowStatusChange', (from, to, event) => {
  //       toast({
  //         title: `${event.event}`,
  //         description: `Status change from ${from} to ${to}`,
  //         status: 'success',
  //         duration: 2000,
  //         isClosable: true,
  //       })
  //       // setStep(to)
  //     })
  //     return () => {
  //       contract.removeAllListeners();
  //     };
  //   }
  //   catch (e){
  //     toast({
  //       title: 'Error',
  //       description: e.message , //An error occured, please try again.
  //       status: 'error',
  //       duration: 2000,
  //       isClosable: true,
  //     })
  //   }  
  // }, [step])


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

  const registerProposal = async() => { 
    
    const contract = new ethers.Contract(contractAddress, abi, provider)
    const latest = await provider.getBlockNumber()  //Get All the Events
    
    let filter = {
      address: contractAddress,
    };  

    // let events = await contract.queryFilter(filter)

    const startBlock = 8409348; //Block number where the contract was deployed
    const endBlock = latest;
    let logs = []; let proposalsEvent = [];
    console.log("startBlock", startBlock)
    console.log("endBlock", endBlock)

    for(let i = startBlock; i < endBlock; i += 5000) {
      const _startBlock = i;
      const _endBlock = Math.min(endBlock, i + 4999);
      const data = await contract.queryFilter(filter, _startBlock, _endBlock);
      // console.log("data", data)
      logs = [...logs, ...data]
    }

    logs.forEach(event => {
      if(event.event === "ProposalRegistered") {
        proposalsEvent.push(event.args.proposalId)
      }
    })
    let proposalsTab = []
    for (let i = 0; i < proposalsEvent.length; i++) {
      let id = parseInt(proposalsEvent[i])
      let description = await contract.connect(address).getOneProposal(id)
      let thisEvent = {
        id: id,
        description: description.description,
      }
      proposalsTab.push(thisEvent)
      // console.log("this Event", thisEvent)

    }
    setEvents(proposalsTab)
    // console.log("events", events)
  }

  const getDatas = async() => {
    const contract = new ethers.Contract(contractAddress, abi, provider) 
    console.log("contract address", contractAddress)
    // console.log("contract.owner ?",await contract.owner())
    const thisOwner = await contract.owner()
    setOwner(thisOwner)
    // console.log("this owner ?", thisOwner, owner)
    let step = await contract.workflowStatus()
    setStep(step)
    updateStatus(step)
}

  useEffect(() => {
    getDatas()
    getVoter()
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
  const data = e.reason.split(":")
  console.log("startProposalsRegistering error message", e.message)
  console.log("startProposalsRegistering error reason", e.reason)
  console.log("data",data)
  if (data[1] === "Registering proposals cant be started now") {
      toast({
        title: 'Error',
        description: "Registering proposals cant be started now",
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    else if (data[1] === " Ownable")
    {
      toast({
        title: 'Error',
        description: "Only the owner can start the proposals registering",
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
      console.log("endProposalsRegistering error message", e.message)
      console.log("endProposalsRegistering error reason", e.reason)

      const data = e.reason.split(":") 
      console.log("data",data)
      if (data[1] === "Registering proposals havent started yet") {
          toast({
            title: 'Error',
            description: "Registering proposals havent started yet",
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
        else if (data[1] === " Ownable")
        {
          toast({
            title: 'Error',
            description: "Only the owner can end the proposals registering",
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
      console.log("startVotingSession error message", e.message)
      console.log("startVotingSession error reason", e.reason)
      const data = e.reason.split(":")
      console.log("data", data)
      if (data[1] === "Registering proposals phase is not finished") {
          toast({
            title: 'Error',
            description: "Registering proposals phase is not finished",
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
        else if (data[1] === " Ownable")
        {
          toast({
            title: 'Error',
            description: "Only the owner can start the voting session",
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
      console.log("endVotingSession error message", e.message)
      console.log("endVotingSession error reason", e.reason)
        const data = e.reason.split(":")
        console.log("data", data)
      if (data[1] === "Registering proposals phase is not finished") {
          toast({
            title: 'Error',
            description: "Registering proposals phase is not finished",
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
        else if (data[1] === " Ownable")
        {
          toast({
            title: 'Error',
            description: "Only the owner can end the voting session",
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
      getProposalWinner()
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
      console.log("tallyVotes error message", e.message)
      console.log("tallyVotes error reason", e.reason)
      try {
        const data = e.reason.split(":") // split the error message with the ":" separator in production but "'" in test
        if (data[1] === "Current status is not voting session ended") {
            toast({
              title: 'Error',
              description: "Current status is not voting session ended",
              status: 'error',
              duration: 5000,
              isClosable: true,
            })
          }
          else if (data[1] === " Ownable")
          {
            toast({
              title: 'Error',
              description: "Only the owner can tally the votes",
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
      catch (e) {
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
        description: "Too early to get the winner proposal",
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const getVoter = async() => {
    try {
      const contract = new ethers.Contract(contractAddress, abi, provider) 
      let Voter = await contract.connect(address).getVoter(address)
      // console.log("Address isVoter :", isVoter)
      setIsVoter(Voter)
    }
    catch (e){
      console.log(e.reason)
      if (e.reason == "You're not a voter") {
        setIsVoter(false)
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
    setIsLoading(true)
    try {
        const contract = new ethers.Contract(contractAddress, abi, signer)
        let transaction = await contract.addVoter(input)
        await transaction.wait(1)
        getDatas()
        getVoter()
        toast({
          title: 'Congratulations!',
          description: "You add a new Voter!",
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      }
      catch (e){
        console.log("addVoter error message", e.message)
        console.log("addVoter error reason", e.reason)
        try {
          const data = e.reason.split("'")
          if (data[1] === "Voters registration is not open yet") {
              toast({
                title: 'Error',
                description: "Voters registration is not open yet",
                status: 'error',
                duration: 2000,
                isClosable: true,
              })
            }
          else if (data[1] === "Already registered") {
              toast({
                title: 'Error',
                description: "Voter is already registered",
                status: 'error',
                duration: 2000,
                isClosable: true,
              })
            }
            else {
              toast({
                title: 'Error',
                description: "An error occured, please try again.",
                status: 'error',
                duration: 2000,
                isClosable: true,
              })
        }
        }
        catch (e) {
          console.log("Issue Add Voter", e)
          console.log(e.reason)
          toast({
            title: 'Error',
            description: "An error occured, please try again.",
            status: 'error',
            duration: 2000,
            isClosable: true,
          })
  }
}
setIsLoading(false)
}

  const addProposal = async() => {
    try {
      const contract = new ethers.Contract(contractAddress, abi, signer)
      let transaction = await contract.addProposal(input)
      await transaction.wait(1)
      getDatas()
      registerProposal()
      toast({
        title: 'Congratulations!',
        description: "You add a new Proposal!",
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch (e){
      try {
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
          else if (data[1] === "La session a atteint son nombre maximum de 12 propositions") {
            toast({
              title: 'Error',
              description: "La session a atteint son nombre maximum de 12 propositions",
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
      catch (e) {
        console.log(e.reason)
        {
          toast({
            title: 'Error',
            description: "An error occured, please try again.",
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
      }}
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
      console.log("setVote error message", e.message)
      console.log("setVote error reason", e.reason)
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
    <Flex direction="row"   minW="90vw" minH="90vh" bg="gray.200" justifyContent="space-between" alignItems="center">
      <VStack minW="25vw" minH="90vh" justifyContent="initial"  alignItems="center" bg="gray.200" p={{base:"5px", xl:"20px"}} rounded="md">
        <Show above='md'>
          <Text color="gray.800" fontSize="2xl" fontWeight="semibold" pb="20px">
            Workflow progression : {progression}%
          </Text>
          </Show>
          <Flex
      flex="1"
      direction="column"
      mt="1rem"
      justifyContent={{base: "center", xl: "flex-start"}}
      alignItems="center"
    >  

      <VStack spacing="24px">
          <Button isDisabled={step>=0} leftIcon={<AiOutlineUserAdd size={24} />} rounded="md" w={{base: "5vw", xl:"15vw"}} p={{base:"5px", xl:"40px"}}  bgGradient={"linear(to-l, #00635D, #4FD1C5)"} _hover={{bgGradient: "linear(to-r, green.400, green.800)",}} justifyContent="center" alignItems="center">
          <Show above='lg'>
            <Text fontSize="xs" fontWeight="medium" ml={2}> Registration session</Text>  
            </Show>
          </Button> 
          <Button isDisabled={step>0}  leftIcon={<BiMessageAltEdit size={24} />}  isLoading={isLoading} loadingText='Submitting' rounded="md" w={{base: "5vw", xl:"15vw"}} p={{base:"5px", xl:"40px"}}  onClick={() => startProposalsRegistering()} bgGradient={"linear(to-l, #00635D, #4FD1C5)"} _hover={{bgGradient: "linear(to-r, green.400, green.800)",}} justifyContent="center" alignItems="center">
          <Show above='lg'>
            <Text fontSize="xs" fontWeight="medium" ml={2}> Start proposal session</Text>  
          </Show>
          </Button> 
          <Button isDisabled={step>1} leftIcon={<BiMessageAltX size={24} />}  isLoading={isLoading} loadingText='Submitting'  rounded="md" w={{base: "5vw", xl:"15vw"}}  p={{base:"5px", xl:"40px"}}  onClick={() => endProposalsRegistering()} bgGradient={"linear(to-l, #00635D, #4FD1C5)"} _hover={{bgGradient: "linear(to-r, green.400, green.800)",}} justifyContent="center" alignItems="center">
          <Show above='lg'>
            <Text fontSize="xs" fontWeight="medium" ml={2}> End proposal session</Text>  
          </Show>
          </Button> 
          <Button isDisabled={step>2} leftIcon={<FaVoteYea size={24} />}  isLoading={isLoading} loadingText='Submitting'  rounded="md" w={{base: "5vw", xl:"15vw"}}  p={{base:"5px", xl:"40px"}}  onClick={() => startVotingSession()} bgGradient={"linear(to-l, #00635D, #4FD1C5)"} _hover={{bgGradient: "linear(to-r, green.400, green.800)",}} justifyContent="center" alignItems="center">
          <Show above='lg'>
          <Text fontSize="xs" fontWeight="medium" ml={2}> Start Voting session </Text>  
          </Show>
          </Button> 
          <Button isDisabled={step>3} leftIcon={<BsFillCalendarXFill  size={24} />}  isLoading={isLoading} loadingText='Submitting'  rounded="md" w={{base: "5vw", xl:"15vw"}}  p={{base:"5px", xl:"40px"}}  onClick={() => endVotingSession()} bgGradient={"linear(to-l, #00635D, #4FD1C5)"} _hover={{bgGradient: "linear(to-r, green.400, green.800)",}} justifyContent="center" alignItems="center">
          <Show above='lg'>
            <Text fontSize="xs" fontWeight="medium" ml={2}> End Voting session </Text>  
          </Show>
          </Button> 
          <Button isDisabled={step>4} leftIcon={<AiOutlineCalculator size={24} />} isLoading={isLoading} loadingText='Submitting'  rounded="md" w={{base: "5vw", xl:"15vw"}} p={{base:"5px", xl:"40px"}}  onClick={() => tallyVotes()} bgGradient={"linear(to-l, #00635D, #4FD1C5)"} _hover={{bgGradient: "linear(to-r, green.400, green.800)",}} justifyContent="center" alignItems="center">
          <Show above='lg'>
            <Text fontSize="xs" fontWeight="medium" ml={2}> Tally the vote </Text>  
          </Show>
          </Button> 
          <Button isDisabled={winnerPropal !== ""} leftIcon={<AiFillTrophy size={24} />}  isLoading={isLoading} loadingText='Submitting'  rounded="md" w={{base: "5vw", xl:"15vw"}}  p={{base:"5px", xl:"40px"}}  onClick={() => getProposalWinner()} bgGradient={"linear(to-l, #00635D, #4FD1C5)"} _hover={{bgGradient: "linear(to-r, green.400, green.800)",}} justifyContent="center" alignItems="center">
            <Show above='lg'>
                <Text fontSize="xs" fontWeight="medium" ml={2}> Reveal wining proposal </Text>  
            </Show>
          </Button> 
      </VStack>    
      </Flex>
      </VStack>
      <Spacer bg="white" />
      { winnerPropal !== "" ? (
          <Stack as="form" p={6} minW="60vw" minH="90vh" justifyContent="center" alignItems="center" bg="gray.200">
                <WinnerHeadline title={`The winning proposal is : ${winnerPropal}`} description={""}/>
          </Stack>
      ) : (
      <Flex direction="column" bg="gray.200" justifyContent="space-between" alignItems="center" rounded="md">
        {address === owner ? (
            step === 0 ? (
              <Stack as="form" p={6} minW="60vw" minH="30vh" justifyContent="flex-start" bg="gray.200">
                <Flex direction="column"  alignItems="flex-end" >
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
              <Button  leftIcon={<MdAdd />} spinner={<BeatLoader size={8} color='white' />} bgGradient="linear(to-l, #00635D, #4FD1C5)" _hover={{bgGradient: "linear(to-r, green.400, green.800)",}}
                color="white"
                variant="solid"
                size="md"
                rounded="md"
                w={{base:"50%",xl:"30%"}}
                mt={4}
                px="20px"
                onClick={() => addVoter(input)}
              >
                <Show above='md'>
                <Text fontSize="md" fontWeight="medium"> Add this voter</Text>
                </Show>
              </Button>
              </Flex>
              </Stack>
            ) : (
              <SuccessHeadline title={"All Voters have been added"} description={"Voter registration is finished"}/>
            )
        ) : (
          <Stack as="form" p={6} minW="60vw" minH="30vh" justifyContent="flex-start" bg="gray.200">
              <WarningHeadline title={"You're not the owner"} description={"Only owner can see this section and add a new voter"}/>
          </Stack>
        )}
        <StackDivider borderColor="gray.800" />
        {isVoter ? 
              (
                    <Stack as="form" p={6} minW="60vw" minH="30vh" justifyContent="flex-start" bg="gray.200">
                      {step === 1 ? (
                        <Flex direction="column"  alignItems="flex-end" >
                          <FormControl id="proposal" justifyContent="center" alignItems="center" alignContent="space-between" >
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
                          w={{base:"50%",xl:"30%"}}
                          mt={4}
                          px="20px"
                          onClick={() => addProposal(input)}
                        >
                        <Show above='md'>
                        <Text fontSize="md" fontWeight="medium">  Send this proposal</Text>
                        </Show>
                        </Button>
                        </Flex>       
                      ) : (
                        step > 1 ? (
                          <SuccessHeadline title={"Proposal session is completed!"} description={"Proposition session is now close. Owner will open voting session soon"}/>
                        ) : (
                          <SuccessHeadline title={"You're now a voter!"} description={"Please wait, the owner will open the proposal session soon"}/>
                        )
                      )}
                    </Stack>
                ) : (
                  <Stack as="form" p={6} minW="60vw" minH="30vh" justifyContent="flex-start" bg="gray.200">
                    {address === owner ? (
                      <ErrorHeadline title={"You're not a current voter"} description={"As a owner, you can add yourself as voter"}/>
                    ) : (
                      <ErrorHeadline title={"You're not a current voter"} description={"Please wait the owner, only owner can add as a new voter"}/>
                    )}
                  </Stack>
        )}
        {
          step < 4 ?  (
            events.length !== 0 ? (
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
            </Stack>
            ) : (
            <InfoHeadline title={"No proposals yet"} description={"Please wait to reach the proposal session workflow status to add you're first proposal"}/>
            )
          ) : (
            <SuccessHeadline title={"Voting session is completed!"} description={"Voting session is now close. Owner will tally the vote soon"}/>
          )
      } 
      </Flex>
       )} 
    </Flex>  
  )
}

export default Proposals;



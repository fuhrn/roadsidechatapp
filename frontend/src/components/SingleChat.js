import { ArrowBackIcon } from "@chakra-ui/icons";
import {
  Box,
  Center,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { ChatState } from "../context/ChatProvider";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import "../components/miscellaneous/styles.css";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
import Lottie from "react-lottie";
import animationData from '../animations/typing.json'

const ENDPOINT = "https://mern-chat-nes.herokuapp.com/";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);

  const toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();

  useEffect(() => {
    // asi nos conectamos con el servidor socket: se genera un objeto socket que
    // es enviado al server desde donde el cual es capturado por:
    // io.on("connection", (socket) => {
    //     ....
    // })
    socket = io(ENDPOINT);

    // vamos a crear un room para "user"
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true)); 
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  });

  // este useEffect corre cada vez que se actualiza el estado de la aplicacion, o sea, siempre
  useEffect(() => {
    socket.on("message received", (newMessageReceived) => {
      if (
        // cuando cargo chat page no tento seleccionada ninguna room por default..
        !selectedChatCompare || // -> if chat is not selected yet or doesn't match current chat
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        // give notification instead of message
        if (!notification.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification]);
          // update list or our chats so latest message in each of them is updated accordingly
          setFetchAgain(!fetchAgain);
        }
      } else {
        // significa que estoy conectado a un room y ese room es el mismo que el indicado en newMessageReceived.chat._id
        setMessages([...messages, newMessageReceived]);
      }
    });
  });

  useEffect(() => {
    fetchMessages();

    // estoy guardando el estado de selectedChat en selectedChatCompare
    // y asi podre decidir si envio los mensajes al usuario o envio una notificacion a ese usuario
    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    // no me funcionaba porque en server no esta emitiendo connected (por error)
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    // debounce type function
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);

      // el usuario se une al room con el nombre selectedChat._id
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat,
          },
          config
        );
        console.log(
          "SingleChat -> message procesed by messageController/sendMessage: ",
          data
        );
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  return selectedChat ? (
    <>
      <Text
        fontSize={{ base: "28px", md: "30px" }}
        pb={3}
        px={2}
        w="100%"
        fontFamily="Work sans"
        display="flex"
        justifyContent={{ base: "space-between" }}
        alignItems="center"
      >
        <IconButton
          display={{ base: "flex", md: "none" }}
          icon={<ArrowBackIcon />}
          onClick={() => setSelectedChat("")}
        />
        {!selectedChat.isGroupChat ? (
          <>
            {getSender(user, selectedChat.users)}
            <ProfileModal user={getSenderFull(user, selectedChat.users)} />
          </>
        ) : (
          <>{selectedChat.chatName.toUpperCase()}</>
        )}
        <UpdateGroupChatModal
          fetchAgain={fetchAgain}
          setFetchAgain={setFetchAgain}
          fetchMessages={fetchMessages}
        />
      </Text>
      <Box
        display="flex"
        flexDir="column"
        justifyContent="flex-end"
        p={3}
        bg="#E8E8E8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {loading ? (
          <Center h="100%">
            <Spinner size="xl" w={20} h={20} />
          </Center>
        ) : (
          <div className="messages">
            <ScrollableChat messages={messages} />
          </div>
        )}

        <FormControl onKeyDown={sendMessage} id="first-name" isRequired mt={3}>
          {istyping ? (
            <div>
              <Lottie
                options={defaultOptions}
                // height={50}
                width={70}
                style={{ marginBottom: 15, marginLeft: 0 }}
              />
            </div>
          ) : (
            <></>
          )}
          <Input
            variant="filled"
            bg="#E0E0E0"
            placeholder="Enter a message.."
            value={newMessage}
            onChange={typingHandler}
          />
        </FormControl>
      </Box>
    </>
  ) : (
    <Box display="flex" alignItems="center" justifyContent="center" h="100%">
      <Text fontSize="3xl" pb={3} fontFamily="Work sans">
        Click on a user to start chatting
      </Text>
    </Box>
  );
};

export default SingleChat;

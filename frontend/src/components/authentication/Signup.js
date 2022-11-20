import React, { useState } from 'react'
import { VStack } from "@chakra-ui/layout"
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Button } from "@chakra-ui/button";
import { useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pic, setPic] = useState("");
  const [picLoading, setPicLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleClick = () => setShow(!show);
  
   const postDetails = (pics) => {
     setPicLoading(true);
     if (pics === undefined) {
       toast({
         title: "Please Select an Image!",
         status: "warning",
         duration: 3000,
         isClosable: true,
         position: "bottom",
       });
       return;
     }
    //  console.log(pics);
     if (pics.type === "image/jpeg" || pics.type === "image/png") {
       const data = new FormData();
       data.append("file", pics);
       data.append("upload_preset", "chat-app");
       data.append("cloud_name", "ddt3wrica");
       fetch("https://api.cloudinary.com/v1_1/ddt3wrica/image/upload", {
         method: "post",
         body: data,
       })
         .then((res) => res.json())
         .then((data) => {
           setPic(data.url.toString());
          //  console.log(data.url.toString());
           setPicLoading(false);
         })
         .catch((err) => {
          //  console.log(err);
           setPicLoading(false);
         });
     } else {
       toast({
         title: "Please Select an Image .jpg or .png!",
         status: "warning",
         duration: 3000,
         isClosable: true,
         position: "bottom",
       });
       setPicLoading(false);
       return;
     }
   };

const submitHandler = async () => {
  setPicLoading(true);
  if (!name || !email || !password || !confirmPassword) {
    toast({
      title: "Please Fill-in all the Fields",
      status: "warning",
      duration: 5000,
      isClosable: true,
      position: "bottom",
    });
    setPicLoading(false);
    return;
  }
  if (password !== confirmPassword) {
    toast({
      title: "Passwords Do Not Match",
      status: "warning",
      duration: 3000,
      isClosable: true,
      position: "bottom",
    });
    return;
  }
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.post(
      "/api/user",
      {
        name,
        email,
        password,
        pic,
      },
      config
    );
    // console.log("Data: ", data);
    toast({
      title: "Registration Successful",
      status: "success",
      duration: 5000,
      isClosable: true,
      position: "bottom",
    });
    localStorage.setItem("userInfo", JSON.stringify(data));
    setPicLoading(false);
    navigate("/chats");
  } catch (error) {
    // console.log('error', error);
    toast({
      title: "Error Occured!",
      description: error.response.data.message,
      status: "error",
      duration: 5000,
      isClosable: true,
      position: "bottom",
    });
    setPicLoading(false);
  }
};

  return (
    <VStack spacing="5px">
      <FormControl id="first-name" isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          placeholder="Enter your Name..."
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
      </FormControl>

      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          placeholder="Enter your eMail..."
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />
      </FormControl>

      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            placeholder="Enter password..."
            type={show ? "text" : "password"}
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl id="confirmPassword" isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup>
          <Input
            placeholder="Confirm password..."
            type={show ? "text" : "password"}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl id="pic" isRequired>
        <FormLabel>Upload your picture</FormLabel>
        <InputGroup>
          <Input
            p={1.5}
            type="file"
            accept="image/*"
            onChange={(e) => postDetails(e.target.files[0])}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <Button
        colorScheme="blue"
        width="100%"
        style={{marginTop: 15}}
        onClick={submitHandler}
        isLoading={picLoading}
      >
        Sign Up
      </Button>
    </VStack>
  );
}

export default Signup
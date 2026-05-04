import { router } from "expo-router";
import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { checkUserExists, dbGetUserByUsername, dbPutUser } from "@/utils/api";

const MAX_STRING_LENGTH = 50;
const DEFAULT_USERNAME = "Enter your username";
const DEFAULT_NAME = "Enter your name";
const DEFAULT_EMAIL = "Enter your email";
const DEFAULT_PHONE_TEXT = "Enter your phone number (no spaces or hyphens)";

interface Props {
  setMode: (mode: string) => void;
}

function Register({setMode}: Props) {
  const [usernameText, setUsernameText] = useState(DEFAULT_USERNAME);
  const [nameText, setNameText] = useState(DEFAULT_NAME);
  const [emailText, setEmailText] = useState(DEFAULT_EMAIL);
  const [phoneText, setPhoneText] = useState(DEFAULT_PHONE_TEXT);
  const [errorText, setErrorText] = useState("");

  return (
    <View>
      <Text>Register</Text>
      <TextInput onChangeText={setUsernameText} maxLength={MAX_STRING_LENGTH} value={usernameText}></TextInput>
      <TextInput onChangeText={setNameText} maxLength={MAX_STRING_LENGTH}  value={nameText}></TextInput>
      <TextInput onChangeText={setEmailText} maxLength={MAX_STRING_LENGTH}  value={emailText}></TextInput>
      <TextInput onChangeText={setPhoneText} maxLength={MAX_STRING_LENGTH}  value={phoneText}></TextInput>
      <Pressable onPress={() => {
        // Ensure we have actually edited the fields
        if (usernameText == DEFAULT_USERNAME || nameText == DEFAULT_NAME || phoneText == DEFAULT_PHONE_TEXT || emailText == DEFAULT_EMAIL) {
          setErrorText("Please provide a new value for each field");
          return;
        }

        // Validate phone number is a number
        const phoneNum = Number(phoneText);
        if (isNaN(phoneNum)) {
          setErrorText("Please enter a valid phone number");
          return;
        }

        // Validate the user does not exist
        checkUserExists(usernameText).then((res) => {
          if (res) {
            // The user exists
            setErrorText("That username is taken, try another.");
          } else {
            // The user does not exist
              dbPutUser(
              {
                "username":usernameText, 
                "name":nameText, 
                "email":emailText, 
                "phone":phoneNum
              }).then((res) => {
                sessionStorage.setItem("user", JSON.stringify(res));
                router.replace("/dashboard");
              }).catch((e) => {
                setErrorText("Unable to create user. Sorry!");
                console.error("register error", e);
              });
          }
        });
      }}><Text>Submit</Text></Pressable>
      <Text>{errorText}</Text>
      <Pressable onPress={() => setMode("login")}><Text>Login Instead</Text></Pressable>
    </View>
  );
}

function Login({setMode}: Props) {
  // Going for speed of development here, not security
  const [usernameText, setUsernameText] = useState("Enter your username");
  const [errorText, setErrorText] = useState("");

  return (
    <View>
      <Text>Login</Text>
      <TextInput onChangeText={setUsernameText} value={usernameText}></TextInput>
      <Pressable onPress={() => {

        // Get a user ID
        dbGetUserByUsername(usernameText)
        .then((res) => {
          sessionStorage.setItem("user", JSON.stringify(res));
          router.replace("/dashboard"); 
        }).catch((e) => {
          setErrorText("Unable to find user. Maybe you meant to register?");
          console.error("login error", e);
        });
        // router.replace("/dashboard");
      }}><Text>Submit</Text></Pressable>
      <Text>{errorText}</Text>
      <Pressable onPress={() => setMode("register")}><Text>Register Instead</Text></Pressable>
    </View>
  );
}

export default function Index() {
  // mode can be "login" | "register" | "none"
  const [mode, setMode] = useState("none");
  const setModeCallback = (mode: string) => {
    setMode(mode);
  }

  return (
    <View>
      {mode == "login" ? (
        <Login setMode={setModeCallback}/>
      ) : mode == "register" ? (
        <Register setMode={setModeCallback}/>
      ) : (
        <>
          <Pressable onPress={() => setMode("login")}><Text>Login</Text></Pressable>
          <Pressable onPress={() => setMode("register")}><Text>Register</Text></Pressable>
        </>
      )}
    </View>
  );
}
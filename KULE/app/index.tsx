import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { checkUserExists, dbGetUserByUsername, dbPutUser } from "@/utils/api";
import { styles, PRIMARY_COLOR } from "./dashboard";
import tinycolor from "tinycolor2";
import { Button, TextField } from "@mui/material"

const MAX_STRING_LENGTH = 50;
const DEFAULT_USERNAME = "Enter your username";
const DEFAULT_NAME = "Enter your name";
const DEFAULT_EMAIL = "Enter your email";
const DEFAULT_PHONE_TEXT = "Enter your phone number";

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
    <View
      style={{gap: 2}}
    >
      <TextField onChange={(t) => setUsernameText(t.target.value)} variant="outlined" margin="normal" style={{minWidth: 220}} slotProps={{htmlInput: {maxLength: MAX_STRING_LENGTH}}} required value={usernameText}/>
      <TextField onChange={(t) => setNameText(t.target.value)} variant="outlined" margin="normal" style={{minWidth: 220}} slotProps={{htmlInput: {maxLength: MAX_STRING_LENGTH}}} required value={nameText}/>
      <TextField onChange={(t) => setEmailText(t.target.value)} variant="outlined" margin="normal" style={{minWidth: 220}} slotProps={{htmlInput: {maxLength: MAX_STRING_LENGTH}}} required value={emailText}/>
      <TextField onChange={(t) => setPhoneText(t.target.value)} variant="outlined" margin="normal" style={{minWidth: 220}} slotProps={{htmlInput: {maxLength: MAX_STRING_LENGTH}}} helperText="Enter just numbers" required value={phoneText}/>
      <Button variant="contained" onClick={() => {
        // Ensure we have actually edited the fields
        if (usernameText == DEFAULT_USERNAME || nameText == DEFAULT_NAME || phoneText == DEFAULT_PHONE_TEXT || emailText == DEFAULT_EMAIL) {
          setErrorText("Please provide a new value for each field");
          return;
        }

        // Validate phone number is a number
        const phoneNum = Number(phoneText);
        if (isNaN(phoneNum) && phoneNum > 0) {
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
              });
          }
        });
      }}>Register</Button>
      <Text style={styles.errorText}>{errorText.length > 0 ? "Error: " + errorText : ""}</Text>
      <Button variant="outlined" onClick={() => setMode("login")}>Login Instead</Button>
    </View>
  );
}

function Login({setMode}: Props) {
  // Going for speed of development here, not security
  const [usernameText, setUsernameText] = useState("Enter your username");
  const [errorText, setErrorText] = useState("");

  return (
    <View
      style={{gap: 2}}
    >
      <TextField onChange={(t) => setUsernameText(t.target.value)} variant="outlined" margin="normal" style={{minWidth: 220}} slotProps={{htmlInput: {maxLength: MAX_STRING_LENGTH}}} required value={usernameText}/>
      <Button variant="contained" onClick={() => {

        // Get a user ID
        dbGetUserByUsername(usernameText)
        .then((res) => {
          sessionStorage.setItem("user", JSON.stringify(res));
          router.replace("/dashboard"); 
        }).catch((e) => {
          setErrorText("Unable to find user. Maybe you meant to register?");
        });
        // router.replace("/dashboard");
      }}>Login</Button>
      <Text style={styles.errorText}>{errorText.length > 0 ? "Error: " + errorText : ""}</Text>
      <Button variant="outlined" onClick={() => setMode("register")}>Register Instead</Button>
    </View>
  );
}

export default function Index() {
  // mode can be "login" | "register" | "none"
  const [mode, setMode] = useState("none");
  const setModeCallback = (mode: string) => {
    setMode(mode);
  }

  useEffect(() => {
    // Clear session storage on page load
    sessionStorage.clear();
  }, [])

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 1
      }}
    >
      <Text style={styles.cardTitle}>Welcome to The KU Language Exchange</Text>
      <Text style={{fontStyle: "italic"}}>Also known as KULE</Text>
      {mode == "login" ? (
        <Login setMode={setModeCallback}/>
      ) : mode == "register" ? (
        <Register setMode={setModeCallback}/>
      ) : (
        <>
        <View>
          <Button style={{margin: 10}} variant="contained" onClick={() => setMode("login")}>Login</Button>
        </View>
        <View>
          <Button style={{margin: 10}} variant="contained" onClick={() => setMode("register")}>Register</Button>
        </View>
        </>
      )}
    </View>
  );
}
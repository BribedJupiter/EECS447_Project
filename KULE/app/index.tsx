import { router } from "expo-router";
import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { dbPutUser } from "@/utils/api";

export default function Index() {
  // Going for speed of development here, not security
  const [usernameText, setUsernameText] = useState("Enter your name");

  return (
    <View>
      <Text>Login or Register</Text>
      <TextInput onChangeText={setUsernameText} value={usernameText}></TextInput>
      <Pressable onPress={() => {
        // Get a user ID
        console.log(dbPutUser({"name":"test1", "email":"testemail@email.com", "phone":1234567890}));
        // router.replace("/dashboard");
      }}><Text>Submit</Text></Pressable>
    </View>
  );
}
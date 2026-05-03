import { router } from "expo-router";
import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";

export default function Index() {
  // Going for speed of development here, not security
  const [usernameText, setUsernameText] = useState("Enter your Username");

  return (
    <View>
      <Text>Login or Register</Text>
      <TextInput onChangeText={setUsernameText} value={usernameText}></TextInput>
      <Pressable onPress={() => {
        router.replace("/dashboard");
      }}><Text>Submit</Text></Pressable>
    </View>
  );
}
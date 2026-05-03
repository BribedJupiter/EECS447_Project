import { useState } from "react";
import { Pressable, TextInput, View, Text } from "react-native";

export function MeetingScheduler() {

}

export function UserInfo() {

}

export function UpcomingMeetings() {
  return (
    <View>
      
    </View>
  );
}

export function SignUp() {

}

export function Login() {
  // Going for speed of development here, not security
  const [usernameText, setUsernameText] = useState("Username");
  const [passwordText, setPasswordText] = useState("Password");

  return (
    <View>
      <Text>Login:</Text>
      <TextInput onChangeText={setUsernameText} value={usernameText}></TextInput>
      <TextInput onChangeText={setPasswordText} value={passwordText}></TextInput>
      <Pressable onPress={() => {
        console.log("")
      }}></Pressable>
    </View>
  );
}

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >

    <UpcomingMeetings />
    </View>
  );
}

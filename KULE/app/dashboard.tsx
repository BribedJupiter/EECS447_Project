import { useState } from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import tinycolor from "tinycolor2";
import { router } from "expo-router";

const PRIMARY_COLOR = "#5050d9";

export function UserInfo() {
  const [currentUser, setCurrentUser] = useState({"Name": "Default"});
  const [languageSkillData, setLanguageSkillData] = useState([{}, {}, {}]);
  const [availabilityWindowData, setAvailabilityWindowData] = useState([{}, {}, {}]);

  return (
    <View style={styles.userWindow}>
      <Logout />
      <Text style={styles.cardTitle}>Profile</Text>

      {/* User Info Box */}
      <View
        style={styles.listItemContainer}
      >
        {/* User Data Box */}
        <View>
          <Text>Name</Text>
          <Text>Phone Number</Text>
          <Text>Email</Text>
        </View>

        {/* User Language Skills Box */}
        <View>
          {languageSkillData.map((lang, index, array) => {
            return (
              <View
                style={styles.listItemContainer}
              >
                <Text>Language</Text>
                <Text>Target or Fluent</Text>
                <Text>Skill Level</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* User Availability box */}
      <View>
        <Text style={styles.cardTitle}>Availability</Text>
        {availabilityWindowData.map((w, i, arr) => {
          return (
            <View
                style={styles.listItemContainer}
              >
                <Text>Date</Text>
                <Text>Start Time</Text>
                <Text>End Time</Text>
              </View>
          );
        })}
        <Pressable onPress={() => router.push("/availability")}><Text style={styles.actionButtonText}>Add New Availability Window</Text></Pressable>
      </View>
    </View>
  );
}

export function UpcomingMeetings(currentUser: User) {
  const [upcomingMeetingData, setUpcomingMeetingData] = useState([{}, {}, {}]);

  return (
    <View style={styles.upcomingMeetingWindow}>
      <Text style={styles.cardTitle}>User: {currentUser.name}</Text>
      <Text style={styles.cardTitle}>Upcoming Meetings</Text>
      <Text>Date | Time | Location | Language</Text>
      {upcomingMeetingData.map((mtg, index, array) => {
        return (
          <View style={styles.listItemContainer}>
            <Text>Meeting</Text>
          </View>
        );
      })}
      <Pressable onPress={() => router.push("/schedule")}><Text style={styles.actionButtonText}>Schedule New Meeting</Text></Pressable>
    </View>
  );
}

export function Logout() {
  return (
    <View>
      <Pressable onPress={() => router.replace("/")}><Text style={styles.actionButtonText}>Logout</Text></Pressable>
    </View>
  );
}

export default function Dashboard() {
  const testUser: User = {
    name: "TestUser",
    email: "testUser@toothfairy.com",
    phone: 1234567890
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
      }}
    >

    <UpcomingMeetings name={testUser.name} email={testUser.email} phone={testUser.phone} />
    <UserInfo />
    </View>
  );
}

interface User {
  name: string;
  email: string;
  phone: number;
}

const styles = StyleSheet.create({
  listItemContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    padding: 5
  },
  actionButtonText: {
    color: tinycolor(PRIMARY_COLOR).darken().toHexString()
  },
  cardTitle: {
    fontSize: 32,
    fontWeight: "bold"
  },
  upcomingMeetingWindow: {
    padding: 15
  },
  userWindow: {
    padding: 15
  }
});
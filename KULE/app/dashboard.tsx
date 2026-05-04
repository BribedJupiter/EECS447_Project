import { useEffect, useState } from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import tinycolor from "tinycolor2";
import { router } from "expo-router";

const PRIMARY_COLOR = "#5050d9";

interface Props {
    user: UserData
}

interface UserData {
    id: number,
    username: string,
    name: string,
    email: string,
    phone: number,
};

export function UserInfo(props: Props) {
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
          <Text>Name: {props.user.name}</Text>
          <Text>Phone: {props.user.phone}</Text>
          <Text>Email: {props.user.email}</Text>
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

export function UpcomingMeetings(props: Props) {
  const [upcomingMeetingData, setUpcomingMeetingData] = useState([{}, {}, {}]);

  return (
    <View style={styles.upcomingMeetingWindow}>
      <Text style={styles.cardTitle}>User: {props.user.username}</Text>
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
      <Pressable onPress={() => {router.replace("/"); sessionStorage.clear()}}><Text style={styles.actionButtonText}>Logout</Text></Pressable>
    </View>
  );
}

export default function Dashboard() {
  const userData = sessionStorage.getItem("user");
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    if (userData !== null) {
        const data: UserData = JSON.parse(userData);
        setUser(data);
    }
  }, [userData])

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
      }}
    >
        {!user ? (
            <Pressable onPress={() => router.replace("/")}><Text>Please login or register here</Text></Pressable>
        ) : (
            <>
                <UpcomingMeetings user={user} />
                <UserInfo user={user}/>
            </>
        )}
    </View>
  );
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
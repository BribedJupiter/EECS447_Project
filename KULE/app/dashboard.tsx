import { useEffect, useState } from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import tinycolor from "tinycolor2";
import { router } from "expo-router";
import { dbGetWindows, UserData, AvailabilityWindow, Speaks, dbGetSpeaks } from "../utils/api"
import dayjs from "dayjs";

const PRIMARY_COLOR = "#5050d9";

interface Props {
    user: UserData
}

export function UserInfo(props: Props) {
  const [availabilityWindowData, setAvailabilityWindowData] = useState<AvailabilityWindow[]>([]);
  const [speaksData, setSpeaksData] = useState<Speaks[]>([]);

  // fetch needed data
  useEffect(() => {
    // Load availability data
    dbGetWindows(props.user.id).then((data: any[]) => {
      const windows: AvailabilityWindow[] = []
      for (const d of data) {
        // data is a 2D array of 3 entries: date, start time, end time
        windows.push({
          "date": dayjs(d[0]),
          "start_time": dayjs(d[1]),
          "end_time": dayjs(d[2])
        })
      }
      setAvailabilityWindowData(windows);
    }).catch((e) => {
      console.error("Unable to fetch availability window data", e);
      setAvailabilityWindowData([]);
    });

    dbGetSpeaks(props.user.id).then((data: any[]) => {
      const speaks: Speaks[] = []
      for (const d of data) {
        speaks.push({
          "language": d[0],
          "type": d[1],
          "skill": d[2]
        })
      }
      setSpeaksData(speaks);
    }).catch((e) => {
      console.error("Unable to fetch availability window data", e);
      setSpeaksData([]);
    });
  }, [])

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
          <Text>Language | Native or Studying | Skill Level</Text>
          {speaksData.map((s: Speaks, index, array) => {
            return (
              <View
                style={styles.listItemContainer}
                key={s.language + s.type + s.skill}
              >
                <Text>{s.language} | </Text>
                <Text>{s.type} | </Text>
                <Text>{s.skill}</Text>
              </View>
            );
          })}
        </View>
      </View>
      <Pressable onPress={() => {router.replace("/speaks")}}><Text style={styles.actionButtonText}>Add Language</Text></Pressable>

      {/* User Availability box */}
      <View>
        <Text style={styles.cardTitle}>Availability</Text>
        <Text>Date | Start Time | End Time</Text>
        {availabilityWindowData.map((w: AvailabilityWindow, i, arr) => {
          return (
            <View
                style={styles.listItemContainer}
                key={w.date.toString() + w.start_time.toString() + w.end_time.toString()}
              >
                <Text>{w.date.format('YYYY-MM-DD').toString()} | </Text>
                <Text>{w.start_time.format('h:mm A').toString()} | </Text>
                <Text>{w.end_time.format('h:mm A').toString()}</Text>
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

export const styles = StyleSheet.create({
  listItemContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    padding: 5
  },
  actionButtonRow: {
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
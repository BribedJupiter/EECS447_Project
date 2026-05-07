import { useEffect, useState } from "react";
import { Pressable, View, Text, StyleSheet, ActivityIndicator } from "react-native";
import tinycolor from "tinycolor2";
import { router } from "expo-router";
import { dbGetWindows, UserData, AvailabilityWindow, Speaks, dbGetSpeaks, dbGetMeetings, Meeting, DialogProps, dbGetMeetingDetails, MeetingDetails, MeetingDetailsUser } from "../utils/api"
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
import { Table, TableContainer, TableHead, TableRow, TableBody, TableCell, Button, AppBar, Toolbar, Dialog, DialogTitle, Divider } from "@mui/material";

// Dayjs setup
dayjs.extend(utc); // Enable UTC extension
dayjs.extend(tz); // Enable timezone extension

export const PRIMARY_COLOR = "#5050d9";

interface Props {
    user: UserData
}

function Profile(props: Props) {
  return (
    <View style={styles.profileWindow}>
      <Text style={styles.cardTitle}>Profile</Text>
      <Text>Name: {props.user.name}</Text>
      <Text>Phone: {props.user.phone}</Text>
      <Text>Email: {props.user.email}</Text>
    </View>
  );
}

function LanguageInfo(props: Props) {
  const [speaksData, setSpeaksData] = useState<Speaks[]>([]);
  const [fetchLangSuccess, setFetchLangSuccess] = useState<boolean | null>(null);

  useEffect(() => {
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
      setFetchLangSuccess(true);
    }).catch((e) => {
      console.error("Unable to fetch availability window data", e);
      setSpeaksData([]);
      setFetchLangSuccess(false);
    });
  }, [])

  return (
      <View>  
        {/* User Language Skills Box */}
        <View style={styles.languageWindow}>
            <Text style={styles.cardTitle}>Languages Spoken</Text>
        {fetchLangSuccess ? (
          <View style={{alignItems: "center", justifyContent: "center", flex: 1}}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Language</TableCell>
                    <TableCell align="center">Native or Studying</TableCell>
                    <TableCell align="center">Skill Level</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {speaksData.map((s: Speaks) => {
                    return (
                      <TableRow
                        key={s.language + s.type + s.skill}
                      >
                        <TableCell align="center">{s.language}</TableCell>
                        <TableCell align="center">{s.type}</TableCell>
                        <TableCell align="center">{s.skill}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            {speaksData.length <= 0 ? (
              <Text style={styles.errorText}>No languages found.</Text>
            ) : null}
          </View>
        ) : fetchLangSuccess == false ? (
          <View>
            <Text style={styles.errorText}>Unable to fetch language data</Text>
          </View>
        ) : (
          <ActivityIndicator />
        )}
          <Pressable onPress={() => {router.replace("/speaks")}}><Text style={styles.actionButtonText}>Add Language</Text></Pressable>
        </View>
      </View>
  );
}

function AvailabilityInfo(props: Props) {
  const [availabilityWindowData, setAvailabilityWindowData] = useState<AvailabilityWindow[]>([]);
  const [fetchWindowSuccess, setFetchWindowSuccess] = useState<boolean | null>(null);

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
      setFetchWindowSuccess(true);
    }).catch((e) => {
      console.error("Unable to fetch availability window data", e);
      setAvailabilityWindowData([]);
      setFetchWindowSuccess(false);
    });
  }, [])

  return (
    <View>
      {/* User Availability box */}
      <View style={styles.availabilityWindow}>
        <Text style={styles.cardTitle}>Availability</Text>
        {fetchWindowSuccess ? (
          <View style={{alignItems: "center", justifyContent: "center", flex: 1}}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Date</TableCell>
                    <TableCell align="center">Start Time</TableCell>
                    <TableCell align="center">End Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {availabilityWindowData.map((w: AvailabilityWindow) => {
                    return (
                      <TableRow
                        key={w.date.toString() + w.start_time.toString() + w.end_time.toString()}
                      >
                        <TableCell align="center">{w.date.format('YYYY-MM-DD').toString()}</TableCell>
                        <TableCell align="center">{w.start_time.format('h:mm A').toString()}</TableCell>
                        <TableCell align="center">{w.end_time.format('h:mm A').toString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            {availabilityWindowData.length <= 0 ? (
              <Text style={styles.errorText}>No availability found.</Text>
            ) : null}
            </View>
          ) : fetchWindowSuccess == false ? (
            <View>
              <Text style={styles.errorText}>Unable to fetch availability data</Text>
            </View>
          ) : (
            <ActivityIndicator />
          )}
          <Pressable onPress={() => router.push("/availability")}><Text style={styles.actionButtonText}>Add New Availability Window</Text></Pressable>
      </View>
    </View>
  );
}

function MeetingDetailsDialog(props: DialogProps) {
  return (
    <Dialog open={props.open} onClose={props.onClose}>
      {props.meeting_data === null ? (
        <Text style={styles.errorText}>Invalid Meeting ID. Try again</Text>
      ) : (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 10,
            gap: 3,
            marginBottom: 10
          }}
        >
          <DialogTitle style={styles.cardTitle}>Meeting Details</DialogTitle>
          <Text>Date: {props.meeting_data.date}</Text>
          <Text>Start Time: {props.meeting_data.time}</Text>
          <Text>Location: {props.meeting_data.location}</Text>
          <Text>Language: {props.meeting_data.language}</Text>
          <Divider sx={{width: '100%', margin: 2}}></Divider>
          <Text style={{fontWeight: "bold"}}>Attendees</Text>
          {props.meeting_data.users.map((u: MeetingDetailsUser) => {
            return (
              <View
                key={u.name + u.email + u.phone}
              >
                <Text>{u.name} | {u.email} | {u.phone}</Text>
              </View>
            );
          })}
        </View>
      )}
    </Dialog>
  );
}

function UpcomingMeetings(props: Props) {
  const [upcomingMeetingData, setUpcomingMeetingData] = useState<Meeting[]>([]);
  const [fetchMeetingSuccess, setFetchMeetingSuccess] = useState<Boolean | null>(null);
  const [openMtgDetails, setOpenMeetingDetails] = useState(false);
  const [mtgDetails, setMtgDetails] = useState<MeetingDetails | null>(null);
  const [isFetchingMtgDetails, setIsFetchingMtgDetails] = useState<number | null>(null);

  useEffect(() => {
    dbGetMeetings(props.user.id)
    .then((res) => {
      const mtgs: Meeting[] = [];
      for (const row of res) {
        mtgs.push({
          // We convert to UTC because we don't want dayjs applying
          // any weird timezone changes. Currently only America/Chicago is supported.
          id: row[0],
          date: dayjs(row[1]).utc().format("YYYY-MM-DD"),
          time: dayjs(row[2]).utc().format("HH:mm A"),
          location: row[3],
          language: row[4]
        })
      }
      setUpcomingMeetingData(mtgs); 
      setFetchMeetingSuccess(true);
    })
    .catch((e) => {
      console.error("Unable to fetch upcoming meetings", e);
      setUpcomingMeetingData([]);
      setFetchMeetingSuccess(false);
    });
  }, [])

  return (
    <View style={styles.upcomingMeetingWindow}>
      <MeetingDetailsDialog meeting_data={mtgDetails} user={props.user} open={openMtgDetails} onClose={() => {setIsFetchingMtgDetails(null); setOpenMeetingDetails(false)}}/>
      <Text style={styles.cardTitle}>Upcoming Meetings</Text>
      {fetchMeetingSuccess ? (
        <View style={{alignItems: "center", justifyContent: "center", flex: 1}}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">Date</TableCell>
                  <TableCell align="center">Time</TableCell>
                  <TableCell align="center">Location</TableCell>
                  <TableCell align="center">Language</TableCell>
                  <TableCell align="center">Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {upcomingMeetingData.map((mtg: Meeting) => {
                  return (
                    <TableRow
                      key={mtg.date + mtg.location + mtg.language + mtg.time}
                    >
                      <TableCell align="center">{mtg.date}</TableCell>
                      <TableCell align="center">{mtg.time}</TableCell>
                      <TableCell align="center">{mtg.location}</TableCell>
                      <TableCell align="center">{mtg.language}</TableCell>
                      <TableCell align="center">
                        {isFetchingMtgDetails == mtg.id ? (
                          <ActivityIndicator />
                        ) : (
                          <Button onClick={() => {
                            setIsFetchingMtgDetails(mtg.id);
                            dbGetMeetingDetails(mtg.id)
                            .then((data) => {
                              // We know there will only be one row of data
                              const mds: MeetingDetails = {
                                id: data[0],
                                // Same UTC trick to keep times in central time
                                date: dayjs(data[1]).utc().format('YYYY-MM-DD'),
                                time: dayjs(data[2]).utc().format('HH:mm a'),
                                location: data[3],
                                language: data[4],
                                users: data[5]
                              };
                              setMtgDetails(mds); 
                              setOpenMeetingDetails(true)
                            })
                            .catch((e) => {
                              console.error("Could not fetch meeting details.", e);
                              setIsFetchingMtgDetails(null)
                            });
                            }}
                            >See Details
                          </Button>
                        )}                                     
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          {upcomingMeetingData.length <= 0 ? (
            <Text style={styles.errorText}>No meetings found.</Text>
          ) : null}
        </View>
      ) : fetchMeetingSuccess == false ? (
        <Text style={styles.errorText}>Unable to fetch meeting data</Text>
      ) : (
        <ActivityIndicator />
      )}
      <Pressable onPress={() => router.push("/schedule")}><Text style={styles.actionButtonText}>Schedule New Meeting</Text></Pressable>
    </View>
  );
}

function Logout() {
  return (
    <View>
      <Pressable onPress={() => {}}><Text style={styles.actionButtonText}>Logout</Text></Pressable>
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

  return (!user ? (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        flex: 1
      }}
    >
      <Button style={{margin: 10}} variant="contained" onClick={() => router.replace("/")}>Please login or register here</Button>
    </View>
  ) : (
      <View>
        <AppBar position="static">
          <Toolbar sx={{justifyContent: "space-between"}}>
            <Text style={styles.cardTitle}>{user.username}</Text>
            <Button style={{color: "black"}} onClick={() => {
              sessionStorage.clear();
              router.replace("/");
            }}>Logout</Button>
          </Toolbar>
        </AppBar>
        <View
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <UpcomingMeetings user={user} />
          <AvailabilityInfo user={user} />
          <View style={{flexDirection: "column", flex: 1}}>
            <Profile user ={user}/>
            <LanguageInfo user={user}/>
          </View>
        </View>
      </View>
  )
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 15
  },
  languageWindow: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 15
  },
  profileWindow: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 15
  },
  availabilityWindow: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 15
  },
  errorText: {
    color: tinycolor("red").toHexString(),
    fontWeight: "bold"
  },
  loadingView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
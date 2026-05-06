import { FormControl, InputLabel, MenuItem, Select, Button, Checkbox, FormControlLabel, Divider } from "@mui/material";
import { View, Text, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { dbFindUsers, dbGetLanguages, dbScheduleMeeting, getStoredUserID } from "@/utils/api";
import { ScheduleOption, dbResizeWindow } from "../utils/api";
import dayjs from "dayjs";
import { styles } from "./dashboard";
import { router } from "expo-router";

import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";

// Dayjs setup
dayjs.extend(utc); // Enable UTC extension
dayjs.extend(tz); // Enable timezone extension

export default function MeetingScheduler() {
    const [matchAvailability, setMatchAvailability] = useState(false);
    const [skillLow, setSkillLow] = useState(0);
    const [skillHigh, setSkillHigh] = useState(0);
    const [language, setLanguage] = useState("English");
    const [langList, setLangList] = useState([]);
    const [errorText, setErrorText] = useState("");
    const [foundMeetingOptions, setFoundMeetingOptions] = useState<ScheduleOption[]>([]);
    const [meetingLocation, setMeetingLocation] = useState("Wescoe");

    // Load language data
    useEffect(() => {
        dbGetLanguages()
            .then((res) => {
                setLangList(res);
            })
            .catch((e) => {
                setLangList([]);
            })
    }, []);

    return (langList.length <= 0 ? <ActivityIndicator></ActivityIndicator> :
        <View>
            <Text>Meeting Scheduler</Text>
            <FormControl>
                <InputLabel id="select-lang-label">Language</InputLabel>
                <Select
                    id="select-lang"
                    labelId="select-lang-label"
                    value={language}
                    onChange={(v) => {  
                        setLanguage(v.target.value);
                    }}
                >
                    <MenuItem value="English">English</MenuItem>
                    {langList.filter((l) => {return l !== "English"}).map((l) => {
                        return (
                            <MenuItem value={l}>{l}</MenuItem>
                        );
                    })}
                </Select>
            </FormControl>
            <FormControl>
                <InputLabel id="select-skill-low-label">Skill Level Low</InputLabel>
                <Select
                    id="select-skill-high"
                    labelId="select-skill-label"
                    value={skillLow}
                    onChange={(v) => {
                        if (!isNaN(Number(v.target.value))) {
                            setSkillLow(Number(v.target.value));
                        }
                    }}
                >
                    <MenuItem value={0}>0</MenuItem>
                    <MenuItem value={1}>1</MenuItem>
                    <MenuItem value={2}>2</MenuItem>
                    <MenuItem value={3}>3</MenuItem>
                    <MenuItem value={4}>4</MenuItem>
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={6}>6</MenuItem>
                    <MenuItem value={7}>7</MenuItem>
                    <MenuItem value={8}>8</MenuItem>
                    <MenuItem value={9}>9</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                </Select>
            </FormControl>
            <FormControl>
                <InputLabel id="select-skill-high-label">Skill Level High</InputLabel>
                <Select
                    id="select-skill-low"
                    labelId="select-skill-label"
                    value={skillHigh}
                    onChange={(v) => {
                        if (!isNaN(Number(v.target.value))) {
                            setSkillHigh(Number(v.target.value));
                        }
                    }}
                >
                    <MenuItem value={0}>0</MenuItem>
                    <MenuItem value={1}>1</MenuItem>
                    <MenuItem value={2}>2</MenuItem>
                    <MenuItem value={3}>3</MenuItem>
                    <MenuItem value={4}>4</MenuItem>
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={6}>6</MenuItem>
                    <MenuItem value={7}>7</MenuItem>
                    <MenuItem value={8}>8</MenuItem>
                    <MenuItem value={9}>9</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                </Select>
            </FormControl>
            <FormControl>
                <FormControlLabel control={<Checkbox checked={matchAvailability} onChange={(t) => {
                        matchAvailability == false ? setMatchAvailability(true) : setMatchAvailability(false);
                    }}/>} label="Match availability" />
            </FormControl>
            <View style={styles.actionButtonRow}>
                <Button onClick={() => router.replace("/dashboard")}>Back</Button>
                <Button onClick={() => {
                    // Ensure that high is higher than low
                    if (skillHigh < skillLow) {
                        setErrorText("Ensure that the top of the skill level is higher than the bottom");
                        return;
                    }
                    
                    // Make API call
                    getStoredUserID()
                    .then((user_id) => {
                        if (!user_id) {
                            setErrorText("Try logging in again");
                        } else {
                            // Search for users that match the criteria (availability or not depending on toggle)
                            dbFindUsers(user_id, language, skillLow, skillHigh, matchAvailability)
                            .then((data) => {
                                const optList: ScheduleOption[] = []
                                for (const d of data) {
                                    if (d.length === 9) {
                                    const opt: ScheduleOption = {
                                            name: d[0],
                                            lang: d[1],
                                            skill: d[2],
                                            date: dayjs(d[3]),
                                            start_time: dayjs(d[4]),
                                            end_time: dayjs(d[5]),
                                            requester_st: dayjs(d[6]),
                                            requester_et: dayjs(d[7]),
                                            id: Number(d[8]) // We know this is safe based on what the API returns
                                        }
                                        optList.push(opt)
                                    }
                                    if (d.length === 3) {
                                        const opt: ScheduleOption = {
                                            name: d[0],
                                            lang: d[1],
                                            skill: d[2],
                                        }
                                        optList.push(opt)
                                    }
                                    // Don't do anything if it doesn't match the format
                                }
                                setFoundMeetingOptions(optList);
                                setErrorText("");
                            })
                            .catch((e) => { 
                                setErrorText("Unable to find any users");
                            });
                        }
                    }
                    ).catch((e) => {
                        setErrorText("Could not find a primary user for this search");
                        return;
                    })
                }}>Search</Button>
            </View>
            <Text>{errorText.length > 0 ? "Error: " + errorText : ""}</Text>
            <Divider></Divider>
            <FormControl>
                <InputLabel id="select-loc-label">Select meeting location</InputLabel>
                <Select
                    id="select-loc"
                    labelId="select-loc-label"
                    value={meetingLocation}
                    onChange={(v) => {
                        setMeetingLocation(v.target.value);
                    }}
                >
                    <MenuItem value={"Wescoe"}>Wescoe</MenuItem>
                    <MenuItem value={"LEEP2 Atrium"}>LEEP2 Atrium"</MenuItem>
                    <MenuItem value={"DeBruce"}>DeBruce</MenuItem>
                    <MenuItem value={"Memorial Union"}>Memorial Union</MenuItem>
                    <MenuItem value={"CapFed"}>CapFed</MenuItem>
                </Select>
            </FormControl>
            <Text>Name | Language | Skill | Date | Start Time | End Time</Text>
            {foundMeetingOptions.map((s: ScheduleOption, index, array) => {
                        return (
                          <View
                            style={styles.listItemContainer}
                            key={s.name + s.lang + s.skill + s.date + s.start_time + s.end_time}
                          >
                            <Text>{s.name} | </Text>
                            <Text>{s.lang} | </Text>
                            <Text>{s.skill}</Text>
                            <Text>{!s.date ? "" : " | " + s.date.format('YYYY-MM-DD').toString() + " | "}</Text>
                            <Text>{!s.start_time ? "" : s.start_time.format('h:mm A').toString() + " | "}</Text>
                            <Text>{!s.end_time ? "" : s.end_time.format('h:mm A').toString()}</Text>
                            <Button variant="contained" onClick={() => {
                                // There are two types of meetings we can schedule - with a time and without
                                if (!s.requester_st || !s.requester_et || !s.id) {
                                    // We only want to setup conversation partners
                                    console.error("Missing requester data", s);
                                    return;
                                }
                                // Otherwise, we want to actually schedule a meeting
                                // First, we get the other user's corresponding availability
                                // Luckily, we already have this in s
                                // So, schedule the meeting by finding the overlap
                                // We want from max(a_start, b_start) to min(a_end, b_end)
                                const mtg_start = s.requester_st.isAfter(s.start_time) ? s.requester_st : s.start_time;
                                const mtg_end = s.requester_et.isBefore(s.end_time) ? s.requester_et : s.end_time;
                                if (!mtg_start || !mtg_end || !s.date) {
                                    setErrorText("Unable to schedule meeting. Invalid dates");
                                    return;
                                }
                                
                                // Convert to meeting strings
                                // Get our final start and end time objects. Date is fine as is.
                                const start = s.date.hour(mtg_start.hour()).minute(mtg_start.minute()).format('YYYY-MM-DDTHH:mm');
                                const end = s.date.hour(mtg_end.hour()).minute(mtg_end.minute()).format('YYYY-MM-DDTHH:mm');
                                const dateStr = s.date.format('YYYY-MM-DD');

                                // Next, we resize both users availability windows on the database
                                // Here, s refers to the time window of the OTHER user that overlaps. 
                                // As before, requester is the logged-in user
                                getStoredUserID()
                                    .then((user_id) => {
                                        if (!user_id) {
                                            setErrorText("Try logging in again.");
                                        } else {
                                            dbResizeWindow(user_id, dateStr, start, end).catch((e) => { 
                                                setErrorText("Unable to resize window.");
                                                return;
                                            }).then(() => {
                                                // We know id will be here since we would've returned earlier
                                                dbResizeWindow(s.id!, dateStr, start, end).catch((e) => { 
                                                    setErrorText("Unable to resize window.");
                                                    return;
                                                }).then(() => {
                                                    // Now, we add to the Meeting table
                                                    dbScheduleMeeting(user_id, s.id!, dateStr, start, meetingLocation, language)
                                                    .then((res) => {
                                                        // Finally, we redirect the user back to the dashboard
                                                        router.replace("/dashboard");
                                                    }).catch((e) => {
                                                        setErrorText("Failed to schedule meeting. Retry?")
                                                    })
                                                });
                                            });
                                        }
                                    }
                                    ).catch((e) => {
                                        setErrorText("Could not schedule meeting.");
                                        return;
                                    });
                            }}>Schedule</Button>
                          </View>
                        );
                      })}
        </View>
    );
}
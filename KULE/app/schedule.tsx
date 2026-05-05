import { FormControl, InputLabel, MenuItem, Select, Button, Checkbox, FormControlLabel, Divider } from "@mui/material";
import { View, Text, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { dbFindUsers, dbGetLanguages, getStoredUserID } from "@/utils/api";
import { ScheduleOption } from "../utils/api";
import dayjs from "dayjs";
import { styles } from "./dashboard";
import { router } from "expo-router";

export default function MeetingScheduler() {
    const [matchAvailability, setMatchAvailability] = useState(false);
    const [skillLow, setSkillLow] = useState(0);
    const [skillHigh, setSkillHigh] = useState(0);
    const [language, setLanguage] = useState("English");
    const [langList, setLangList] = useState([]);
    const [errorText, setErrorText] = useState("");
    const [foundMeetingOptions, setFoundMeetingOptions] = useState<ScheduleOption[]>([]);

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
                                    if (d.length === 6) {
                                    const opt: ScheduleOption = {
                                            name: d[0],
                                            lang: d[1],
                                            skill: d[2],
                                            date: dayjs(d[3]),
                                            start_time: dayjs(d[4]),
                                            end_time: dayjs(d[5])
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
                          </View>
                        );
                      })}
        </View>
    );
}
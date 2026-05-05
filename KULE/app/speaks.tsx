import { FormControl, InputLabel, MenuItem, Select, Button } from "@mui/material";
import { View, Text, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { dbCreateSpeaks, dbGetLanguages, getStoredUserID } from "@/utils/api";
import { router } from "expo-router";

export default function SpeaksForm() {
    const [goal, setGoal] = useState("Studying");
    const [skill, setSkill] = useState(0);
    const [language, setLanguage] = useState("English");
    const [langList, setLangList] = useState([]);
    const [errorText, setErrorText] = useState("");

    // Load language data
    useEffect(() => {
        dbGetLanguages()
            .then((res) => {
                console.log(res);
                setLangList(res);
            })
            .catch((e) => {
                console.error("Unable to fetch languages", e);
                setLangList([]);
            })
    }, []);

    return (langList.length <= 0 ? <ActivityIndicator></ActivityIndicator> : 
        <View>
            <Text>Add a language!</Text>
            <FormControl fullWidth>
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
            <FormControl fullWidth>
                <InputLabel id="select-native-studying-label">Goal</InputLabel>
                <Select
                    id="select-native-studying"
                    labelId="select-native-studying-label"
                    value={goal}
                    onChange={(v) => {setGoal(v.target.value)}}
                >
                    <MenuItem value={"Studying"}>Studying</MenuItem>
                    <MenuItem value={"Native"}>Native</MenuItem>
                </Select>
            </FormControl>
            <FormControl fullWidth>
                <InputLabel id="select-skill-label">Goal</InputLabel>
                <Select
                    id="select-skill"
                    labelId="select-skill-label"
                    value={skill}
                    onChange={(v) => {
                        if (!isNaN(Number(v.target.value))) {
                            setSkill(Number(v.target.value));
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
            <Button onClick={() => {
                // Make API call
                getStoredUserID()
                .then((user_id) => {
                    if (!user_id) {
                        setErrorText("Try logging in again.");
                    } else {
                        dbCreateSpeaks(user_id, language, goal, skill).catch((e) => { 
                            setErrorText("Unable to create window. Maybe you have a duplicate?");
                        });
                        router.replace("/dashboard");
                    }
                }
                ).catch((e) => {
                    setErrorText("Could not find a user for this langauge");
                    return;
                });
            }}>Submit</Button>
            <Text>{errorText}</Text>
        </View>
    );
}
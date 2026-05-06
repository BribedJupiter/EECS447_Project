import { FormControl, InputLabel, MenuItem, Select, Button } from "@mui/material";
import { View, Text, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { dbCreateSpeaks, dbGetLanguages, getStoredUserID } from "@/utils/api";
import { router } from "expo-router";
import { styles } from "./dashboard";

export default function SpeaksForm() {
    const [goal, setGoal] = useState("Studying");
    const [skill, setSkill] = useState(0);
    const [language, setLanguage] = useState("English");
    const [langList, setLangList] = useState([]);
    const [errorText, setErrorText] = useState("");
    const [fetchSuccess, setFetchSuccess] = useState<Boolean | null>(null);

    // Load language data
    useEffect(() => {
        dbGetLanguages()
            .then((res) => {
                setLangList(res);
                setFetchSuccess(true);
            })
            .catch((e) => {
                setLangList([]);
                setFetchSuccess(false);
            })
    }, []);

    return (fetchSuccess ? (
        <View style={{alignItems: "center", justifyContent: "center", flex: 1}}>
            <Text style={styles.cardTitle}>Add a language</Text>    
            <FormControl margin="normal" style={{minWidth: 220}}>
                <InputLabel id="select-lang-label">Language</InputLabel>
                <Select
                    id="select-lang"
                    labelId="select-lang-label"
                    label="Language"
                    value={language}
                    onChange={(v) => {  
                        setLanguage(v.target.value);
                    }}
                >
                    <MenuItem value="English">English</MenuItem>
                    {langList.filter((l) => {return l !== "English"}).map((l) => {
                        return (
                            <MenuItem key={l} value={l}>{l}</MenuItem>
                        );
                    })}
                </Select>
            </FormControl>
            <FormControl margin="normal" style={{minWidth: 220}}>
                <InputLabel id="select-native-studying-label">Goal</InputLabel>
                <Select
                    id="select-native-studying"
                    labelId="select-native-studying-label"
                    value={goal}
                    label="Goal"
                    onChange={(v) => {setGoal(v.target.value)}}
                >
                    <MenuItem value={"Studying"}>Studying</MenuItem>
                    <MenuItem value={"Native"}>Native</MenuItem>
                </Select>
            </FormControl>
            <FormControl margin="normal" style={{minWidth: 220}}>
                <InputLabel id="select-skill-label">Skill Level</InputLabel>
                <Select
                    id="select-skill"
                    labelId="select-skill-label"
                    value={skill}
                    label="Skill Level"
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
            <Text style={styles.errorText}>{errorText.length > 0 ? "Error: " + errorText : ""}</Text>
            <View style={{flexDirection: "row"}}>
                <Button onClick={() => router.replace("/dashboard")}>Back</Button>
                <Button onClick={() => {
                    // Make API call
                    getStoredUserID()
                    .then((user_id) => {
                        if (!user_id) {
                            setErrorText("Try logging in again.");
                        } else {
                            dbCreateSpeaks(user_id, language, goal, skill)
                            .then((res) => {
                                router.replace("/dashboard");
                            })
                            .catch((e) => { 
                                setErrorText("Unable to add language. Maybe you have a duplicate?");
                            });
                        }
                    }
                    ).catch((e) => {
                        setErrorText("Could not find a user for this langauge");
                        return;
                    });
                }}>Submit</Button>
            </View>
        </View>
    ) : fetchSuccess == false ? (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                gap: 5
            }}
        >
            <Text style={styles.errorText}>Unable to fetch from server</Text>
            <Button variant="contained" onClick={() => router.replace("/dashboard")}>Return to Dashboard</Button>
        </View>
    ) : (
        <View
            style={styles.loadingView}
        >
            <ActivityIndicator />
        </View>
    ));
}
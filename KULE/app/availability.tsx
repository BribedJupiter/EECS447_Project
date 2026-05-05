import { useState } from "react";
import { View, Text } from "react-native";
import { DesktopDatePicker, DesktopTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Button } from "@mui/material";
import dayjs from "dayjs";
import { dbCreateWindow, getStoredUserID } from "@/utils/api";
import {router} from "expo-router";
import { styles } from "./dashboard";

export default function AddAvailability() {
    const [date, setDate] = useState(dayjs('2026-01-01'));
    const [startTime, setStartTime] = useState(dayjs('2026-01-01T15:30'));
    const [endTime, setEndTime] = useState(dayjs('2026-01-01T18:30'));
    const [errorText, setErrorText] = useState("");

    return (
        <View>
            <Text>Add Availability</Text>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DesktopDatePicker label="Pick a date" value={date} onChange={(t) => {setDate(dayjs(t))}}/>
                <DesktopTimePicker label="Pick a start time" value={startTime} onChange={(t) => {setStartTime(dayjs(t))}}/>
                <DesktopTimePicker label="Pick an end time" value={endTime} onChange={(t) => {setEndTime(dayjs(t))}}/>
            </LocalizationProvider>
            <View style={styles.actionButtonRow}>
                <Button onClick={() => router.replace("/dashboard")}>Back</Button>
                <Button onClick={() => {
                    // Get our final start and end time objects. Date is fine as is.
                    const start = date.hour(startTime.hour()).minute(startTime.minute()).format('YYYY-MM-DDTHH:mm');
                    const end = date.hour(endTime.hour()).minute(endTime.minute()).format('YYYY-MM-DDTHH:mm');
                    const dateStr = date.format('YYYY-MM-DD');

                    // Ensure start is before end
                    if (startTime.isAfter(endTime) || startTime.isSame(endTime)) {
                        setErrorText("Cannot create a window where the start time is after or the same as the end time")
                        return;
                    }

                    // Make API call
                    getStoredUserID()
                    .then((user_id) => {
                        if (!user_id) {
                            setErrorText("Try logging in again.");
                        } else {
                            dbCreateWindow(user_id, dateStr, start, end).catch((e) => { 
                                setErrorText("Unable to create window. Maybe you have a duplicate?");
                            });
                            router.replace("/dashboard");
                        }
                    }
                    ).catch((e) => {
                        setErrorText("Could not find a user for this availability window");
                        return;
                    });
                }}>Submit</Button>
            </View>
            <Text>{errorText.length > 0 ? "Error: " + errorText : ""}</Text>
        </View>
    );
}
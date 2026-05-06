import { useState } from "react";
import { View, Text } from "react-native";
import { DesktopDatePicker, DesktopTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Button, Box } from "@mui/material";
import dayjs from "dayjs";
import { dbCreateWindow, getStoredUserID } from "@/utils/api";
import {router} from "expo-router";
import { styles } from "./dashboard";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";

// Dayjs setup
dayjs.extend(utc); // Enable UTC extension
dayjs.extend(tz); // Enable timezone extension

export default function AddAvailability() {
    const [date, setDate] = useState<dayjs.Dayjs | undefined>();
    const [startTime, setStartTime] = useState<dayjs.Dayjs | undefined>();
    const [endTime, setEndTime] = useState<dayjs.Dayjs | undefined>();
    const [errorText, setErrorText] = useState("");

    return (
        <View
            style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            <Text style={styles.cardTitle}>Add Availability</Text>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{marginTop: 2}}>
                    <DesktopDatePicker slotProps={{
                        actionBar: {actions: ['clear']},
                    }} label="Pick a date" value={date} onChange={(t) => {
                        if (!t) {
                            setDate(undefined);
                        } else {
                            setDate(dayjs(t))
                        }
                    }}/>
                </Box>
                <Box sx={{marginTop: 2}}>
                    <DesktopTimePicker slotProps={{
                        actionBar: {actions: ['cancel', 'accept']}
                    }} label="Pick a start time" value={startTime} onChange={(t) => {
                        if (!t) {
                            setStartTime(undefined);
                        } else {
                            setStartTime(dayjs(t))
                        }
                    }}/>
                </Box>
                <Box sx={{marginTop: 2}}>
                    <DesktopTimePicker slotProps={{
                        actionBar: {actions: ['cancel', 'accept']}
                    }}label="Pick an end time" value={endTime} onChange={(t) => {
                        if (!t) {
                            setEndTime(undefined);
                        } else {
                            setEndTime(dayjs(t))
                        }
                    }}/>
                </Box>
            </LocalizationProvider>
            <Text style={styles.errorText}>{errorText.length > 0 ? "Error: " + errorText : ""}</Text>
            <View style={{flexDirection: "row"}}>
                <Button onClick={() => router.replace("/dashboard")}>Back</Button>
                <Button onClick={() => {
                    if (!date || !startTime || !endTime) {
                        setErrorText("Please enter valid dates and times for all fields.");
                        return;
                    }

                    // Get our final start and end time objects. Date is fine as is.
                    // Convert to UTC to put in the database
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
                            dbCreateWindow(user_id, dateStr, start, end)
                            .then((res) => {
                                router.replace("/dashboard");
                            })
                            .catch((e) => { 
                                setErrorText("Unable to create window. Maybe you have a duplicate?");
                            });
                        }
                    }
                    ).catch((e) => {
                        setErrorText("Could not find a user for this availability window");
                        return;
                    });
                }}>Submit</Button>
            </View>
        </View>
    );
}
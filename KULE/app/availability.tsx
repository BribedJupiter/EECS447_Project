import { useState } from "react";
import { View, Text } from "react-native";
import { DesktopDatePicker, DesktopTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Button } from "@mui/material";
import dayjs from "dayjs";
import { dbCreateWindow, getStoredUserID } from "@/utils/api";

export default function AddAvailability() {
    const [date, setDate] = useState(dayjs('2026-01-01'));
    const [startTime, setStartTime] = useState(dayjs('2026-01-01T15:30'));
    const [endTime, setEndTime] = useState(dayjs('2026-01-01T18:30'));

    return (
        <View>
            <Text>Add Availability</Text>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DesktopDatePicker label="Pick a date" value={date} onChange={(t) => {setDate(dayjs(t))}}/>
                <DesktopTimePicker label="Pick a start time" value={startTime} onChange={(t) => {setStartTime(dayjs(t))}}/>
                <DesktopTimePicker label="Pick an end time" value={endTime} onChange={(t) => {setEndTime(dayjs(t))}}/>
            </LocalizationProvider>
            <Button onClick={() => {
                // Sync start and end times with date
                const dayStr = date.year() + "-" + date.format("MM") + "-" + date.format("DD") + "T";
                const strStart = dayStr + startTime.hour() + ":" + startTime.minute();
                const strEnd = dayStr + endTime.hour() + ":" + endTime.minute();

                // Get our final start and end time objects. Date is fine as is.
                const start = dayjs(strStart)
                const end = dayjs(strEnd);

                // Make API call
                getStoredUserID().then((user_id) => {
                    if (!user_id) throw new Error("No user id");
                    dbCreateWindow(user_id, date.toString(), start.toString(), end.toString());
                }
                ).catch((e) => {
                    console.error("Error creating availability window", e);
                    return;
                });
            }}>Submit</Button>
        </View>
    );
}
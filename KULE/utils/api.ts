import dayjs from "dayjs";

// const API_URL = "https://project-ks2el.vercel.app"
const API_URL = "http://127.0.0.1:8000"

export interface UserData {
    id: number,
    username: string,
    name: string,
    email: string,
    phone: number,
};

export interface AvailabilityWindow {
    date: dayjs.Dayjs,
    start_time: dayjs.Dayjs,
    end_time: dayjs.Dayjs,
}

export interface Speaks {
    language: string,
    type: string,
    skill: number
}

export interface ScheduleOption {
    name: string,
    lang: string,
    skill: number,
    date?: dayjs.Dayjs,
    start_time?: dayjs.Dayjs,
    end_time?: dayjs.Dayjs,
    requester_st?: dayjs.Dayjs,
    requester_et?: dayjs.Dayjs
    id?: number,
}

export async function getStoredUserID() {
    const userData = sessionStorage.getItem("user");
    if (!userData) {
        return null;
    }
    const data: UserData = JSON.parse(userData);
    return data.id;
}

export async function dbGetLanguages() {
    const res = await fetch(`${API_URL}/language`, {
        method: "GET"
    })
    if (!res.ok) {
        throw new Error(`Failed to fetch language data - ${res.status}`);
    }
    return res.json();
}

export async function dbGetSpeaks(user_id: number) {
    const res = await fetch(`${API_URL}/language/${user_id}`, {
        method: "GET"
    })
    if (!res.ok) {
        throw new Error(`Failed to fetch language data - ${res.status}`);
    }
    return res.json();
}

export async function dbCreateSpeaks(user_id: number, lang: string, type: string, skill: number) {
    // We know all input will be valid since we're just selecting from drop downs
    const res = await fetch(`${API_URL}/language/${user_id}`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            lang: lang,
            type: type,
            skill: skill,
        })
    })
    if (!res.ok) {
        throw new Error(`Failed to create availability window - ${res.status}`);
    }
    return res.json();
}

export async function dbFindUsers(user_id: number, lang: string, low_skill: number, high_skill: number, useAvailability: boolean) {
    // Note that user_id here refers to the REQUESTING user who's availability needs to be sought
    // We also know that the input will be good because they're selected from a list
    // Setup search parameters
    const params = {
        "lang": lang,
        "low_skill": low_skill.toString(),
        "high_skill": high_skill.toString(),
        "useAvailability": useAvailability.toString()
    }
    const query = new URLSearchParams(params).toString()

    // Get matching user data
    const res = await fetch(`${API_URL}/schedule/${user_id}?${query}`, {
        method: "GET",
    })
    if (!res.ok) {
        throw new Error(`Failed to create availability window - ${res.status}`);
    }
    return res.json();
}

export async function dbScheduleMeeting(user_id1: number, user_id2: number, date: string, start_time: string, location: string, language: string) {
    const res = await fetch(`${API_URL}/schedule/${user_id1}/${user_id2}`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            date: date,
            start_time: start_time,
            location: location,
            language: language
        })
    })
    if (!res.ok) {
        throw new Error(`Failed to schedule meeting window - ${res.status}`);
    }
    return res.json();
}

export async function dbCreateWindow(user_id: number, date: string, start_time: string, end_time:string) {
    const res = await fetch(`${API_URL}/availability/${user_id}`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            date: date,
            start_time: start_time,
            end_time: end_time,
        })
    })
    if (!res.ok) {
        throw new Error(`Failed to create availability window - ${res.status}`);
    }
    return res.json();
}

export async function dbResizeWindow(user_id: number, date: string, mtg_start: string, mtg_end: string) {
    // Setup query parameters
    const params = {
        "date": date,
        "start_time": mtg_start,
        "end_time": mtg_end
    }
    const query = new URLSearchParams(params).toString()

    // Resize the user's window based on the provided meeting time
    const res = await fetch(`${API_URL}/availability/${user_id}?${query}`, {
        method: "POST",
    })
    if (!res.ok) {
        throw new Error(`Failed to resize availability window - ${res.status}`);
    }
    return res.json();
}

export async function dbGetWindows(user_id: number) {
    const res = await fetch(`${API_URL}/availability/${user_id}`, {
        method: "GET"
    })
    if (!res.ok) {
        throw new Error(`Failed to fetch window data - ${res.status}`);
    }
    return res.json();
}

export async function dbGetUser(user_id: number) {
    const res = await fetch(`${API_URL}/user/${user_id}`, {
        method: "GET"
    })
    if (!res.ok) {
        throw new Error(`Failed to fetch user data - ${res.status}`);
    }
    return res.json();
}

export async function dbGetUserByUsername(username: string) {
    const res = await fetch(`${API_URL}/user/${username}`, {
        method: "GET"
    })
    if (!res.ok) {
        throw new Error(`Failed to fetch user data - ${res.status}`);
    }
    return res.json();
}

export async function checkUserExists(username: string) {
    try {
        await dbGetUserByUsername(username);
        return true;
    } catch (e) {
        return false;
    }
}

export async function dbPutUser(data: {username: string, name: string, email: string, phone: number}) {
    const res = await fetch(`${API_URL}/user`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: data.username,
            name: data.name,
            email: data.email,
            phone: data.phone
        })
    })
    if (!res.ok) {
        throw new Error(`Failed to put user data - ${res.status}`);
    }
    return res.json();
}
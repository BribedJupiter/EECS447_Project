import dayjs from "dayjs";

const API_URL = "https://project-ks2el.vercel.app"
// const API_URL = "http://127.0.0.1:8000"

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
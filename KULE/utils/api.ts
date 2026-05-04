const API_URL = "https://project-ks2el.vercel.app"
// const API_URL = "http://127.0.0.1:8000"

export function getStoredUserID() {

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
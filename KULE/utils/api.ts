const API_URL = "https://project-ks2el.vercel.app"

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

export async function dbPutUser(data: {name: string, email: string, phone: number}): Promise<number> {
    const res = await fetch(`${API_URL}/user`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
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
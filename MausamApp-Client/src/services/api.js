import { Platform } from 'react-native';

const getBaseUrl = () => {
    return 'http://localhost:8005';
};

const BASE_URL = getBaseUrl();

export const fetchActionCards = async (context) => {
    try {
        const response = await fetch(`${BASE_URL}/api/action-cards`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(context),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        
        if (json.error) {
            console.error("Backend Error:", json.error);
            return null;
        }

        if (!json.data || !json.data.action_cards) {
            console.error("Invalid format received:", json);
            return null;
        }

        // Return both the AI cards and the raw weather stats
        return json.data;
    } catch (error) {
        console.error("Error fetching action cards:", error);
        return null;
    }
};

export const submitCitizenRadar = async (vote, persona, location) => {
    try {
        const response = await fetch(`${BASE_URL}/api/citizen-radar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ vote, persona, location }),
        });
        const json = await response.json();
        return json;
    } catch (error) {
        console.error("Citizen Radar Error:", error);
        return null;
    }
};

export const getIpfsCIDs = async (data: any) => {
    const url = 'http://localhost:3001/upload'
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add any other headers you need
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
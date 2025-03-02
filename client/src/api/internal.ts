export const getIpfsCIDs = async (data: any) => {
    const url = `${window.location.protocol}//${window.location.host}/upload`
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

export const uploadNewImage = async (nftIdentifier: string, image: string) => {
    const url = `${window.location.protocol}//${window.location.host}/upload/reasess`
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add any other headers you need
            },
            body: JSON.stringify({
                tokenIdentifier: nftIdentifier,
                imageBase64: image
            })
        });

        console.log("Response:", response);
    }
    catch(error) {
        console.error('Error:', error);
        throw error;
    }
}

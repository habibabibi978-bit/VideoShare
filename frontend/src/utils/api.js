import axiosInstance from "./axiosInstance"

export const incrementViewCount = async (videoId) => {
    try {
        const response = await axiosInstance.patch(`/videos/incrementViewCount/${videoId}`);
        return response.data.data;
    }catch(error){
        console.error('Error incrementing view count:', error);

    }
}

export const getUserChannelSubscribers = async (channelId) => {
    try {
        if (!channelId || channelId === 'undefined') {
            console.error('Invalid channelId:', channelId);
            return { subscribers: [], numberOfSubscribers: 0 };
        }
        
        const response = await axiosInstance.get(`/subscription/subscribers/${channelId}`);
        // Backend returns { data: [array of subscribers] }
        const subscribers = response.data?.data || [];
        return {
            subscribers: Array.isArray(subscribers) ? subscribers : [],
            numberOfSubscribers: Array.isArray(subscribers) ? subscribers.length : 0
        };
    } catch (error) {
        console.error('Error fetching channel subscribers:', error);
        return { subscribers: [], numberOfSubscribers: 0 };
    }
}



export const updateWatchHistory = async (videoId) => {
    try {
        const response = await axiosInstance.post(`users/update-watch-history/`, { videoId });
       
    }catch(error){
        console.error('Error updating watch history:', error);

    }
}

export const getSubscribedChannels = async () => {
    try {
        const response = await axiosInstance.get(`/subscription/subscribed`);
        return response.data.data;
    }catch(error){
        console.error('Error fetching subscribed channels:', error);

    }
}



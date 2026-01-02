import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import VideoCard from '../components/videos/VideoCard';
import { useDispatch, useSelector } from 'react-redux';
import { FaRegUser } from 'react-icons/fa';
import Spinner from '../components/Spinner';
import { fetchUserVideos } from '../features/UserSlice';
import Avatar from '../components/Avatar';

const UserProfile = () => {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [playlists, setPlaylists] = useState([]);
    const [activeSection, setActiveSection] = useState('videos');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSubscribed, setSubscribed] = useState(false);
    const [subscribersCount, setSubscribersCount] = useState(0);

    const dispatch = useDispatch();
    const user = useSelector(state => state.user.user);
    const userVideos = useSelector(state => state.user.videos);
    

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get(`/users/c/${username}`);
                setProfile(response.data.data);
                setSubscribed(response.data.data.isSubscribed);
                setSubscribersCount(response.data.data.subscribersCount);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'An error occurred');
                setLoading(false);
            }
        };

        dispatch(fetchUserVideos(username));

        const fetchUserPlaylists = async () => {
            try {
                const response = await axiosInstance.get(`/playlist/${username}`);
                // Ensure playlists is always an array
                const playlistsData = response.data?.data;
                setPlaylists(Array.isArray(playlistsData) ? playlistsData : []);
            } catch (err) {
                setError(err.response?.data?.message || 'An error occurred');
                // Set empty array on error to prevent map errors
                setPlaylists([]);
            }
        };

        fetchUserProfile();
        fetchUserPlaylists();
    }, [username, dispatch]);

    const handleSubscription = async () => {
        if (!user?._id) return;

        try {
            
            await axiosInstance.post(`subscription/toggle/${profile._id}`);
            setSubscribed(!isSubscribed);
            if (isSubscribed) {
                setSubscribersCount(subscribersCount - 1);
            } else {
                setSubscribersCount(subscribersCount + 1);
            }
            
        } catch (error) {
           
            console.error('Error:', error.message || 'Something went wrong');
        }
    };

    return (
        <div className="w-full mx-auto px-10 bg-white shadow-md rounded-md items-center">
            <div className="relative w-full">
                {/* Cover Image */}
                {profile?.coverImage ? (
                    <div className="relative pb-[33.33%]"> {/* 400 / 1200 = 0.3333, which is 33.33% */}
                        <img
                            src={profile.coverImage}
                            alt="Cover"
                            className="absolute top-0 left-0 w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="relative pb-[20%] bg-gray-400 rounded-md">
                   
                        <div className="absolute top-1/2 left-1/2 text-3xl text-gray-500"></div>
                    </div>
                )}

                {/* Avatar */}
                <div className="absolute bottom-[-75px] flex justify-center items-center w-full">
                   
                    <Avatar user={profile} type='large' />
                </div>
            </div>

            {/* User Info */}
            <div className="mt-24 text-center">
                <h1 className="text-3xl font-bold">{profile?.fullname}</h1>
                <p className="text-gray-600">@{profile?.username}</p>
                <div className="mt-4 flex justify-center items-center space-x-6">
                    <div>
                        <p className="text-lg"><strong>Subscribers:</strong> {subscribersCount}</p>
                    </div>
                    <div>
                        <p className="text-lg"><strong>Subscribed to:</strong> {profile?.channelSubscribedToCount}</p>
                    </div>
                    <div>
                        <p className="text-lg"><strong>Videos:</strong> {userVideos.length}</p>
                    </div>
                </div>
                {user?.username === username ? null : (
                    <div className="mt-4">
                        <button onClick={handleSubscription} className={`px-4 py-2 rounded-full ${isSubscribed ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
                            {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                        </button>
                    </div>
                )}
            </div>

            {/* Navigation Tabs */}
            <div className="mt-8">
                <div className="flex justify-around border-b">
                    <button
                        className={`py-2 px-4 border-b-2 ${activeSection === 'videos' ? 'border-blue-500' : 'border-transparent'} hover:border-blue-500`}
                        onClick={() => setActiveSection('videos')}
                    >
                        Videos
                    </button>
                    <button
                        className={`py-2 px-4 border-b-2 ${activeSection === 'playlists' ? 'border-blue-500' : 'border-transparent'} hover:border-blue-500`}
                        onClick={() => setActiveSection('playlists')}
                    >
                        Playlists
                    </button>
                    <button
                        className={`py-2 px-4 border-b-2 ${activeSection === 'about' ? 'border-blue-500' : 'border-transparent'} hover:border-blue-500`}
                        onClick={() => setActiveSection('about')}
                    >
                        About
                    </button>
                </div>
            </div>

            {/* Conditional Rendering */}
            <div className="mt-8">
                {activeSection === 'videos' && (
                    <>
                        {userVideos.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-xl text-gray-600 dark:text-gray-400">No videos found.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                                {userVideos.map(video => (
                                    <VideoCard key={video.id || video._id} video={video} />
                                ))}
                            </div>
                        )}
                    </>
                )}
                {activeSection === 'playlists' && (
                    <div>
                        {!playlists || playlists.length === 0 ? (
                            <p className="text-center">No playlists found.</p>
                        ) : (
                            playlists.map((playlist, index) => (
                                <div key={playlist?.id || playlist?._id || `playlist-${index}`} className="mb-4 p-4 border rounded">
                                    <h3 className="text-xl font-bold">{playlist?.name || 'Untitled Playlist'}</h3>
                                    <p className="text-gray-600">{playlist?.description || 'No description'}</p>
                                    {playlist?.videos && (
                                        <p className="text-sm text-gray-500 mt-2">{playlist.videos.length} video(s)</p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
                {activeSection === 'about' && (
                    <div className='flex justify-center items-center'>
                        <p>{profile?.about || 'No information available.'}</p>
                    </div>
                )}
            </div>
            {loading && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <Spinner loading={loading} />
                </div>
            )}
            {error && (
                <div className="text-center text-red-500">{error}</div>
            )}
        </div>
    );
};

export default UserProfile;

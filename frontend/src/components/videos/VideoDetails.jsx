import React, { useEffect, useState } from 'react';
import { BiLike, BiSolidLike, BiDislike, BiSolidDislike } from "react-icons/bi";
import { MdNotifications, MdNotificationsOff } from "react-icons/md";
import { useSelector, useDispatch } from 'react-redux';
import { fetchLikedVideos, fetchDislikedVideos } from '../../features/UserSlice';
import axiosInstance from '../../utils/axiosInstance';
import { getUserChannelSubscribers } from '../../utils/api';
import moment from 'moment';
import { LuDot } from "react-icons/lu";
import {useNavigate} from 'react-router-dom';
import Spinner from '../Spinner';
import Avatar from '../Avatar';

const VideoDetails = ({ video }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const likedVideos = useSelector((state) => state.user.likedVideos);
  const dislikedVideos = useSelector((state) => state.user.dislikedVideos);
const navigate = useNavigate();

  const [subscribersCount, setSubscribersCount] = useState(0);
  const [likeCount, setLikeCount] = useState(video?.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [dislikeCount, setDislikeCount] = useState(video?.dislikes || 0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const descriptionLimit = 1000; // Set a limit for the number of characters to show initially

  const [subscribed, setSubscribed] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);


  const handleLike = async () => {
    if (!user) {
      console.error('User not logged in');
      return;
    }

    const userId = user.id || user._id;
    const videoId = video.id || video._id;

    if (!userId || !videoId) {
      console.error('Missing user ID or video ID');
      return;
    }

    try {
      // Toggle like status
      const response = await axiosInstance.post(`/likes/toggle-video-like/${videoId}`);
      
      // Update local state based on response
      const liked = response.data?.data?.liked ?? response.data?.liked;
      
      if (liked !== undefined) {
        setIsLiked(liked);
        if (liked) {
          setLikeCount(likeCount + 1);
          // Remove dislike if liked
          if (isDisliked) {
            setIsDisliked(false);
            setDislikeCount(Math.max(0, dislikeCount - 1));
          }
        } else {
          setLikeCount(Math.max(0, likeCount - 1));
        }
      } else {
        // Fallback: toggle based on current state
        setIsLiked(!isLiked);
        if (isLiked) {
          setLikeCount(Math.max(0, likeCount - 1));
        } else {
          setLikeCount(likeCount + 1);
          if (isDisliked) {
            setIsDisliked(false);
            setDislikeCount(Math.max(0, dislikeCount - 1));
          }
        }
      }

      // Refresh liked videos list and video data
      dispatch(fetchLikedVideos());
      dispatch(fetchDislikedVideos());
      
      // Optionally refresh video data to get updated counts
      // This ensures counts are accurate
    } catch (error) {
      console.error('Like error:', error.response?.data || error.message || 'Something went wrong');
      // Revert state on error
      setIsLiked(!isLiked);
      if (isLiked) {
        setLikeCount(likeCount + 1);
      } else {
        setLikeCount(Math.max(0, likeCount - 1));
      }
      // Show user-friendly error
      alert(error.response?.data?.message || 'Failed to like video. Please try again.');
    }
  };

  const handleDislike = async () => {
    if (!user) {
      console.error('User not logged in');
      return;
    }

    const userId = user.id || user._id;
    const videoId = video.id || video._id;

    if (!userId || !videoId) {
      console.error('Missing user ID or video ID');
      return;
    }

    try {
      // Toggle dislike status
      const response = await axiosInstance.post(`/likes/toggle-video-dislike/${videoId}`);
      
      // Update local state based on response
      const disliked = response.data?.data?.disliked ?? response.data?.disliked;
      
      if (disliked !== undefined) {
        setIsDisliked(disliked);
        if (disliked) {
          setDislikeCount(dislikeCount + 1);
          // Remove like if disliked
          if (isLiked) {
            setIsLiked(false);
            setLikeCount(Math.max(0, likeCount - 1));
          }
        } else {
          setDislikeCount(Math.max(0, dislikeCount - 1));
        }
      } else {
        // Fallback: toggle based on current state
        setIsDisliked(!isDisliked);
        if (isDisliked) {
          setDislikeCount(Math.max(0, dislikeCount - 1));
        } else {
          setDislikeCount(dislikeCount + 1);
          if (isLiked) {
            setIsLiked(false);
            setLikeCount(Math.max(0, likeCount - 1));
          }
        }
      }

      // Refresh disliked videos list and video data
      dispatch(fetchLikedVideos());
      dispatch(fetchDislikedVideos());
      
      // Optionally refresh video data to get updated counts
      // This ensures counts are accurate
    } catch (error) {
      console.error('Dislike error:', error.response?.data || error.message || 'Something went wrong');
      // Revert state on error
      setIsDisliked(!isDisliked);
      if (isDisliked) {
        setDislikeCount(dislikeCount + 1);
      } else {
        setDislikeCount(Math.max(0, dislikeCount - 1));
      }
      // Show user-friendly error
      alert(error.response?.data?.message || 'Failed to dislike video. Please try again.');
    }
  };

  useEffect(() => {
    if (video) {
      const videoId = video.id || video._id;
      setIsLiked(likedVideos.some((v) => {
        const vId = v.video?.id || v.video?._id || v.id || v._id;
        return vId === videoId;
      }));
      setIsDisliked(dislikedVideos.some((v) => {
        const vId = v.video?.id || v.video?._id || v.id || v._id;
        return vId === videoId;
      }));
    }
  }, [video, likedVideos, dislikedVideos]);

  useEffect(() => {
    const fetchUserSubscribers = async () => {
      if (!video || !video.owner) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const channelId = video.owner.id || video.owner._id;
        if (!channelId) {
          console.error("Channel ID not found in video.owner");
          setLoading(false);
          return;
        }
        
        const response = await getUserChannelSubscribers(channelId);
        // Backend returns { data: [subscribers array] }
        const subscribers = response?.subscribers || response || [];
        const subscribersArray = Array.isArray(subscribers) ? subscribers : [];
        
        if (subscribersArray.length > 0) {
          const userId = user?.id || user?._id;
          const isSubscribed = subscribersArray.some(subscriber => {
            const subscriberId = subscriber?.id || subscriber?._id;
            return subscriberId === userId;
          });
          setSubscribed(isSubscribed);
        }
        
        // Use subscribers count from video owner or calculate from array
        setSubscribersCount(video.owner?.subscribersCount || subscribersArray.length || 0);

        // Fetch subscription status including notification preferences
        if (user) {
          try {
            const statusResponse = await axiosInstance.get(`/subscription/status/${channelId}`);
            const status = statusResponse.data?.data || statusResponse.data;
            if (status) {
              setSubscribed(status.subscribed || false);
              setNotificationsEnabled(status.notificationsEnabled || false);
            }
          } catch (error) {
            console.error("Error fetching subscription status:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching subscribers:", error);
        // Fallback to owner's subscribersCount if available
        setSubscribersCount(video.owner?.subscribersCount || 0);
      } finally {
        setLoading(false);
      }
    };

    if (video && video.owner) {
      fetchUserSubscribers();
    }
    dispatch(fetchLikedVideos());
    dispatch(fetchDislikedVideos());
  }, [dispatch, video, user]);

 {loading && <Spinner loading={loading} />}
  if (error) {
    return <div className='text-red-500'>{error}</div>;
  }


  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const handleSubscription = async () => {
    if (!user) return;
    if (!video || !video.owner) return;

    const userId = user.id || user._id;
    const channelId = video.owner.id || video.owner._id;
    
    if (!userId || !channelId) return;

    try {
      const response = await axiosInstance.post(`subscription/toggle/${channelId}`);
      const data = response.data?.data || response.data;
      setSubscribed(data.subscribed || !subscribed);
      if (data.subscribed) {
        setSubscribersCount(subscribersCount + 1);
        // When subscribing, notifications are enabled by default
        setNotificationsEnabled(true);
      } else {
        setSubscribersCount(subscribersCount - 1);
        setNotificationsEnabled(false);
      }
    } catch (error) {
      console.error('Error:', error.message || 'Something went wrong');
    }
  }

  const handleToggleNotifications = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || !subscribed) return;
    if (!video || !video.owner) return;

    const channelId = video.owner.id || video.owner._id;
    if (!channelId) return;

    try {
      const response = await axiosInstance.post(`subscription/toggle-notifications/${channelId}`);
      const data = response.data?.data || response.data;
      setNotificationsEnabled(data.notificationsEnabled || false);
    } catch (error) {
      console.error('Error toggling notifications:', error.response?.data || error.message || 'Something went wrong');
      alert(error.response?.data?.message || 'Failed to toggle notifications. Please try again.');
    }
  }
  const profileUrl = `/c/${video.owner.username}`;
  return (
    <div className='flex flex-col'>
      <div className='lg:text-3xl md:text-2xl sm:text-2xl font-semibold mb-3'>
        {video.title}
      </div>

      <div className="flex items-center gap-4 mb-4">
      
      <div className='w-10 h-10'>
      <Avatar user={video.owner} type='medium'/>

      </div>

        <div className="flex flex-col ">
          <h1 onClick={() => navigate(profileUrl)} className="lg:text-xl md:text-lg sm:text-sm cursor-pointer">{video.owner.fullname}</h1>
          <h1 className="text-gray-700">{subscribersCount} subscribers</h1>
        </div>
        {
          (() => {
            const userId = user?.id || user?._id;
            const ownerId = video?.owner?.id || video?.owner?._id;
            if (!userId || !ownerId || userId === ownerId) return null;
            
            return (
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleSubscription} 
                  className={`px-3 py-2 md:px-4 md:py-3 rounded-full ${subscribed ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
                >
                  {subscribed ? 'Unsubscribe' : 'Subscribe'}
                </button>
                {subscribed && (
                  <button
                    onClick={handleToggleNotifications}
                    className={`p-2 md:p-3 rounded-full transition-colors ${
                      notificationsEnabled 
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                    title={notificationsEnabled ? 'Notifications enabled - Click to disable' : 'Notifications disabled - Click to enable'}
                  >
                    {notificationsEnabled ? (
                      <MdNotifications className="text-xl md:text-2xl" />
                    ) : (
                      <MdNotificationsOff className="text-xl md:text-2xl" />
                    )}
                  </button>
                )}
              </div>
            );
          })()
        }
       
        <div className="flex items-center gap-4 ml-auto">
          <div className="flex items-center text-lg  bg-gray-100 rounded-full px-3 py-2 gap-4">
            <button onClick={handleLike} className="transition-all duration-100 ease-linear hover:scale-125 flex items-center">
              {isLiked ? <BiSolidLike className=" text-3xl" /> : <BiLike className="" />}
              <span className="ml-2">{likeCount}</span>
            </button>
            <span className='text-gray-400'>|</span>
            <button onClick={handleDislike} className="transition-all duration-100 ease-linear hover:scale-125 flex items-center">
              {isDisliked ? <BiSolidDislike /> : <BiDislike />}
              <span className="ml-2">{dislikeCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* views and description */}
      <div className=' bg-gray-200 rounded-lg p-4 text-sm'>
        <div>
          {video.views} views<LuDot className='inline px-0 mx-0' />{moment(video.createdAt).fromNow()}
        </div>
        {/* description */}
        <div className='overflow-hidden'>
          {video.description.length > descriptionLimit ? (
            <>
              {isDescriptionExpanded ? video.description : `${video.description.slice(0, descriptionLimit)}...`}
              <button onClick={toggleDescription} className="font-bold ml-2">
                {isDescriptionExpanded ? 'Show less' : 'Show more'}
              </button>
            </>
          ) : (
            video.description
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoDetails;

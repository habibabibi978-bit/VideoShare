import React, { useEffect, useState, useRef } from 'react';
import { BiLike, BiSolidLike, BiDislike, BiSolidDislike } from "react-icons/bi";
import { MdNotifications, MdNotificationsOff } from "react-icons/md";
import { HiShare, HiDownload, HiOutlineCheck } from 'react-icons/hi';
import { FiCopy, FiFlag } from 'react-icons/fi';
import { 
  FacebookShareButton, 
  TwitterShareButton, 
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon
} from 'react-share';
import { useSelector, useDispatch } from 'react-redux';
import { fetchLikedVideos, fetchDislikedVideos } from '../../features/UserSlice';
import axiosInstance from '../../utils/axiosInstance';
import { getUserChannelSubscribers } from '../../utils/api';
import moment from 'moment';
import { LuDot } from "react-icons/lu";
import {useNavigate} from 'react-router-dom';
import Spinner from '../Spinner';
import Avatar from '../Avatar';
import SuccessDialog from '../SuccessDialog';

const VideoDetails = ({ video, showComments = false, onToggleComments, commentsCount: externalCommentsCount, parentCommentsCount: externalParentCommentsCount }) => {
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
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  const [parentCommentsCount, setParentCommentsCount] = useState(0);
  
  // Use external counts if provided (from parent component)
  const displayCommentsCount = externalCommentsCount !== undefined ? externalCommentsCount : commentsCount;
  const displayParentCount = externalParentCommentsCount !== undefined ? externalParentCommentsCount : parentCommentsCount;
  const shareMenuRef = useRef(null);
  const moreMenuRef = useRef(null);


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

  // Fetch comments count
  useEffect(() => {
    const fetchCommentsCount = async () => {
      if (!video) return;
      const videoId = video.id || video._id;
      if (!videoId) return;

      try {
        const response = await axiosInstance.get(`/comments/${videoId}`);
        const commentsData = response.data?.data?.data?.comments || response.data?.data?.comments || response.data?.data || [];
        const comments = Array.isArray(commentsData) ? commentsData : [];
        // Calculate total including replies
        const total = comments.reduce((sum, comment) => sum + 1 + (comment.replies?.length || 0), 0);
        setCommentsCount(total);
        setParentCommentsCount(comments.length);
      } catch (error) {
        console.error('Error fetching comments count:', error);
        setCommentsCount(0);
        setParentCommentsCount(0);
      }
    };

    if (video) {
      fetchCommentsCount();
    }
  }, [video]);

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
  
  // Format numbers (e.g., 32000 -> 32k)
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const videoId = video.id || video._id;
  const videoUrl = `${window.location.origin}/videos/${videoId}`;
  const shareTitle = video.title || 'Check out this video!';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(videoUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      setShowShareMenu(false);
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = videoUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      setShowShareMenu(false);
    }
  };

  const handleSaveVideo = () => {
    // TODO: Implement save to playlist functionality
    alert('Save to playlist feature coming soon!');
    setShowMoreMenu(false);
  };

  const handleReportVideo = () => {
    // TODO: Implement report video functionality
    alert('Report video feature coming soon!');
    setShowMoreMenu(false);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setShowShareMenu(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='flex flex-col'>
      {/* Video Title */}
      <h1 className='text-xl font-semibold mb-4 text-gray-900'>
        {video.title}
      </h1>

      {/* Channel Info and Action Buttons Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 pb-4 border-b border-gray-200">
        {/* Channel Info Section */}
        <div className="flex items-center gap-3 flex-1">
          <div 
            onClick={() => navigate(profileUrl)} 
            className="cursor-pointer flex-shrink-0"
          >
            <Avatar user={video.owner} type='medium'/>
          </div>
          
          <div className="flex flex-col min-w-0">
            <h2 
              onClick={() => navigate(profileUrl)} 
              className="font-semibold text-sm cursor-pointer hover:text-gray-600 truncate"
            >
              {video.owner.fullname}
            </h2>
            <p className="text-xs text-gray-600">
              {formatNumber(subscribersCount)} subscribers
            </p>
          </div>

          {/* Subscribe Button */}
          {(() => {
            const userId = user?.id || user?._id;
            const ownerId = video?.owner?.id || video?.owner?._id;
            if (!userId || !ownerId || userId === ownerId) return null;
            
            return (
              <div className="flex items-center gap-2 ml-2">
                <button 
                  onClick={handleSubscription} 
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                    subscribed 
                      ? 'bg-gray-200 text-gray-900 hover:bg-gray-300' 
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {subscribed ? 'Subscribed' : 'Subscribe'}
                </button>
                {subscribed && (
                  <button
                    onClick={handleToggleNotifications}
                    className={`p-2 rounded-full transition-colors ${
                      notificationsEnabled 
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                    title={notificationsEnabled ? 'Notifications enabled' : 'Notifications disabled'}
                  >
                    {notificationsEnabled ? (
                      <MdNotifications className="text-xl" />
                    ) : (
                      <MdNotificationsOff className="text-xl" />
                    )}
                  </button>
                )}
              </div>
            );
          })()}
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Like/Dislike */}
          <div className="flex items-center bg-gray-100 rounded-full overflow-hidden">
            <button 
              onClick={handleLike} 
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 transition-colors border-r border-gray-300"
            >
              {isLiked ? (
                <BiSolidLike className="text-xl text-blue-600" />
              ) : (
                <BiLike className="text-xl" />
              )}
              <span className="text-sm font-medium">{formatNumber(likeCount)}</span>
            </button>
            <button 
              onClick={handleDislike} 
              className="px-4 py-2 hover:bg-gray-200 transition-colors"
            >
              {isDisliked ? (
                <BiSolidDislike className="text-xl text-blue-600" />
              ) : (
                <BiDislike className="text-xl" />
              )}
            </button>
          </div>

          {/* Share Button with Menu */}
          <div className="relative" ref={shareMenuRef}>
            <button 
              onClick={() => {
                setShowShareMenu(!showShareMenu);
                setShowMoreMenu(false);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <HiShare className="text-xl" />
              <span className="text-sm font-medium">Share</span>
            </button>

            {showShareMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg p-4 z-50 min-w-[200px]">
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded transition-colors text-left"
                  >
                    <FiCopy />
                    <span>Copy Link</span>
                  </button>
                  
                  <div className="border-t my-2"></div>
                  
                  <div className="flex gap-3 justify-center">
                    <FacebookShareButton
                      url={videoUrl}
                      quote={shareTitle}
                      className="hover:opacity-80 transition-opacity"
                    >
                      <FacebookIcon size={32} round />
                    </FacebookShareButton>
                    
                    <TwitterShareButton
                      url={videoUrl}
                      title={shareTitle}
                      className="hover:opacity-80 transition-opacity"
                    >
                      <TwitterIcon size={32} round />
                    </TwitterShareButton>
                    
                    <WhatsappShareButton
                      url={videoUrl}
                      title={shareTitle}
                      className="hover:opacity-80 transition-opacity"
                    >
                      <WhatsappIcon size={32} round />
                    </WhatsappShareButton>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Download Button */}
          <button 
            onClick={async () => {
              if (!video.videoFile && !video.url) {
                alert('Video URL not available for download');
                return;
              }
              try {
                const videoUrl = video.videoFile || video.url;
                const response = await fetch(videoUrl);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${(video.title || 'video').replace(/[^a-z0-9]/gi, '_')}.mp4`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
              } catch (error) {
                console.error('Download error:', error);
                const videoUrl = video.videoFile || video.url;
                window.open(videoUrl, '_blank');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <HiDownload className="text-xl" />
            <span className="text-sm font-medium">Download</span>
          </button>

          {/* More Menu */}
          <div className="relative" ref={moreMenuRef}>
            <button 
              onClick={() => {
                setShowMoreMenu(!showMoreMenu);
                setShowShareMenu(false);
              }}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {showMoreMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg p-2 z-50 min-w-[180px]">
                <button
                  onClick={handleSaveVideo}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded transition-colors text-left text-sm"
                >
                  <HiOutlineCheck className="text-lg" />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleReportVideo}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded transition-colors text-left text-sm text-red-600"
                >
                  <FiFlag className="text-lg" />
                  <span>Report</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Stats and Description */}
      <div className='bg-gray-50 rounded-lg p-4'>
        {/* Views and Date */}
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
          <span className="font-medium">{formatNumber(video.views)} views</span>
          <LuDot className="text-gray-400" />
          <span>{moment(video.createdAt).fromNow()}</span>
        </div>

        {/* Description */}
        <div className='text-sm text-gray-800 whitespace-pre-wrap'>
          {video.description && video.description.length > descriptionLimit ? (
            <>
              {isDescriptionExpanded ? (
                <div>{video.description}</div>
              ) : (
                <div>{video.description.slice(0, descriptionLimit)}</div>
              )}
              <button 
                onClick={toggleDescription} 
                className="font-semibold text-gray-600 hover:text-gray-900 mt-1"
              >
                {isDescriptionExpanded ? 'Show less' : 'Show more'}
              </button>
            </>
          ) : (
            <div>{video.description || 'No description available.'}</div>
          )}
        </div>
      </div>

      {/* Comments Button - YouTube style (Toggle) */}
      <div className="mt-6 border-t border-gray-200 pt-4">
        <button
          onClick={() => {
            if (onToggleComments) {
              onToggleComments();
            }
          }}
          className="text-left w-full py-3 hover:bg-gray-50 rounded-lg px-2 transition-colors cursor-pointer"
          type="button"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-900">
              {formatNumber(displayParentCount)} Comments
            </span>
            {displayCommentsCount !== displayParentCount && displayCommentsCount > 0 && (
              <span className="text-sm text-gray-600">
                ({displayCommentsCount} including replies)
              </span>
            )}
            {/* Toggle indicator */}
            <span className="ml-auto text-sm text-gray-500">
              {showComments ? '▼' : '▶'}
            </span>
          </div>
        </button>
      </div>
      
      {copySuccess && <SuccessDialog message="Link copied to clipboard!" />}
    </div>
  );
};

export default VideoDetails;

import React, { useState} from 'react';
import { NavLink } from 'react-router-dom';
import VideoThumbnail from './VideoThumbnail';
import moment from 'moment';
import { LuDot } from "react-icons/lu";
import { HiDotsVertical } from "react-icons/hi";
import { incrementViewCount, updateWatchHistory } from '../../utils/api';
import { useDispatch, useSelector } from 'react-redux';
import ConfirmationDialog from '../ConfirmationDialog';
import { deleteUserVideo } from '../../features/UserSlice';
import SuccessDialog from '../SuccessDialog';
import Avatar from '../Avatar';
const VideoCard = ({ video }) => {

    const user = useSelector(state => state.user.user);
    const timeAgo = moment(video.createdAt).fromNow();
    const dispatch = useDispatch();
    const [menuOpen, setMenuOpen] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);   

    const handleVideoClick = async () => {
        const videoId = video.id || video._id;
        await incrementViewCount(videoId);
        const ownerId = video.owner?.id || video.owner?._id;
        const userId = user?.id || user?._id;
        if (ownerId !== userId) {
            await updateWatchHistory(videoId);
        }
    };

    const handleDelete = async () => {
        setDeleteConfirmationOpen(false);
        try {
            dispatch(deleteUserVideo(video.id || video._id));
            setSuccess('Video deleted successfully');
            setError(null);
            
        }
        catch (error) {
            setSuccess(null);
            setError(error.message || 'An error occurred while deleting the video');    
        }
    };

  
    const videoId = video.id || video._id;
    const ownerId = video.owner?.id || video.owner?._id;
    const userId = user?.id || user?._id;
    const isOwner = ownerId === userId;

    return (
        <div className="relative group">
            <NavLink to={`/videos/${videoId}`} onClick={handleVideoClick} className="block">
                <div className="w-full">
                    {/* Thumbnail Container */}
                    <div className="relative w-full mb-3">
                        <VideoThumbnail video={video} />
                    </div>
                    
                    {/* Video Info */}
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <Avatar user={video.owner} type="medium" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                                {video.title}
                            </h3>
                            {video.owner?.username && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    {video.owner.username}
                                </p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center">
                                <span>{video.views || 0} views</span>
                                <LuDot className="inline mx-1" />
                                <span>{timeAgo}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </NavLink>
            
            {/* Menu Button for Owner */}
            {isOwner && (
                <div className="absolute top-2 right-2 z-10">
                    <button 
                        onClick={(e) => { 
                            e.preventDefault();
                            e.stopPropagation(); 
                            setMenuOpen(!menuOpen); 
                        }} 
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-60 hover:bg-opacity-80 rounded-full p-2 focus:outline-none"
                    >
                        <HiDotsVertical className="text-white text-lg" />
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20">
                            <button
                                onClick={(e) => { 
                                    e.preventDefault();
                                    e.stopPropagation(); 
                                    setMenuOpen(false); 
                                    setDeleteConfirmationOpen(true);
                                }}
                                className="block w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-t-md transition-colors"
                            >
                                Delete Video
                            </button>
                        </div>
                    )}
                </div>
            )}


            {deleteConfirmationOpen && (
                <ConfirmationDialog
                    message="Are you sure you want to delete this video?"
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteConfirmationOpen(false)}
                />
            )}

            {success &&
                <SuccessDialog message={success} />
             }
             {error &&
                <SuccessDialog message={error} />
             }
             

        </div>
    );
};

export default VideoCard;

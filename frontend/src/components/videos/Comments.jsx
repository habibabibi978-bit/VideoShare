import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { useSelector } from 'react-redux';
import CommentLayout from './CommentLayout';
import Spinner from '../Spinner';
import { FaRegUser } from 'react-icons/fa';
// TODO: Pagination for comments (optional)
// TODO: Add a loading spinner while fetching comments

// for now only max 10 comments are fetched (see backend)
// either apply pagination or load more comments on button click
// or infinite scroll to load more comments

function Comments() {
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const videoId = useParams().id;
  const user = useSelector(state => state.user.user);

  useEffect(() => {
    const fetchComments = async () => {
      if (!videoId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get(`/comments/${videoId}`);
        
        // Debug: Log the full response structure
        console.log('Comments API Full Response:', JSON.stringify(response.data, null, 2));
        console.log('Comments API Response Type:', typeof response.data);
        console.log('Comments API Response.data:', response.data?.data);
        console.log('Comments API Response.data.data:', response.data?.data?.data);
        console.log('Comments API Response.data.data.comments:', response.data?.data?.data?.comments);
        
        // Ensure comments is always an array
        // Backend controller returns: { data: { comments: [...] } }
        // TransformInterceptor wraps it: { data: { data: { comments: [...] } }, success: true }
        let commentsData = [];
        if (response.data?.data?.data?.comments) {
          // Double-wrapped by interceptor
          commentsData = response.data.data.data.comments;
        } else if (response.data?.data?.comments) {
          // Single wrap
          commentsData = response.data.data.comments;
        } else if (Array.isArray(response.data?.data)) {
          commentsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          commentsData = response.data;
        }
        
        // Log each comment to see its structure
        if (commentsData.length > 0) {
          console.log('First comment structure:', commentsData[0]);
          console.log('First comment keys:', Object.keys(commentsData[0]));
          console.log('First comment id:', commentsData[0].id);
          console.log('First comment _id:', commentsData[0]._id);
        }
        
        // Filter out comments without IDs and log them for debugging
        const validComments = commentsData.filter(comment => {
          const hasId = comment.id || comment._id;
          if (!hasId) {
            console.warn('Comment without ID found:', comment);
            console.warn('Comment keys:', Object.keys(comment));
            console.warn('Comment stringified:', JSON.stringify(comment, null, 2));
          }
          return hasId;
        });
        
        console.log('Total comments found:', commentsData.length);
        console.log('Valid comments count:', validComments.length);
        console.log('Parsed comments:', validComments);
        setComments(Array.isArray(validComments) ? validComments : []);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error('Fetch Comments Error:', error);
        console.error('Error Response:', error.response?.data);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load comments';
        setError(errorMessage);
        // Set empty array on error to prevent crashes
        setComments([]);
      }
    };
    fetchComments();
  }, [videoId]);

  
  const handleAddComment = async (e) => {
    e.preventDefault();
    const content = e.target.content.value.trim();
    if (!content) {
      setError('Comment cannot be empty');
      return;
    }
    if (!videoId) {
      setError('Video ID is missing');
      return;
    }
    try {
      const response = await axiosInstance.post(`/comments/video/${videoId}`, { content });
      const commentData = response.data?.data || response.data;
      
      // Ensure content is always included - use the original content if response doesn't have it
      const newComment = {
        ...commentData,
        content: commentData.content || content, // Ensure content is included
        owner: user || commentData.owner,
        replies: commentData.replies || [],
        likesCount: commentData.likesCount || 0,
        dislikesCount: commentData.dislikesCount || 0,
        userLikeStatus: commentData.userLikeStatus || null,
      };
      
      // Refresh comments from server to ensure we have the latest data
      // This ensures comments persist after page refresh
      setComments([newComment, ...comments]);
      e.target.reset();
      setError(null);
      
      // Optionally refetch comments to ensure sync with server
      // This helps if there are any issues with the new comment structure
      setTimeout(async () => {
        try {
          const refreshResponse = await axiosInstance.get(`/comments/${videoId}`);
          const refreshData = refreshResponse.data?.data?.comments || refreshResponse.data?.data || [];
          if (Array.isArray(refreshData)) {
            setComments(refreshData);
          }
        } catch (refreshError) {
          console.error('Error refreshing comments:', refreshError);
          // Don't update state on refresh error, keep the comment we just added
        }
      }, 500);
    } catch (error) {
      console.error('Add Comment Error:', error.response?.data || error.message || 'Something went wrong');
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to add comment. Please try again.';
      setError(errorMessage);
    }
  };

  

  if(loading) {
    return (
      <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex items-center justify-center">

        <Spinner loading={loading} />
      </div>
    );
  }

  if(error) {
    return <div className='text-red-500'>{error}</div>; 
  }
  
  

  // Ensure comments is always an array
  const safeComments = Array.isArray(comments) ? comments : [];

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">{safeComments.length} Comments</h2>
      <form className='flex items-center space-x-4 mb-6' onSubmit={handleAddComment}>
        {user?.avatar ? (
          <img src={user.avatar} alt={user.username} className='w-10 h-10 rounded-full' />
        ) : (
          <div className='w-10 h-10 bg-gray-300 rounded-full flex justify-center items-center'>
            <FaRegUser size={30} />
          </div>
        )}
        <input 
          className='flex-grow p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition duration-200' 
          type='text' 
          name='content' 
          autoComplete='off'
          placeholder='Add a comment' 
        />
        <button 
          className='bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition duration-200' 
          type='submit'
        >
          Comment
        </button>
      </form>
      {safeComments.length === 0 && !loading ? (
        <div className="text-center py-8 text-gray-500">
          <p>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {safeComments.map((comment, index) => {
            const commentId = comment.id || comment._id;
            if (!commentId) {
              console.warn('Comment without ID found:', comment);
              return null;
            }
            return (
              <CommentLayout
                key={`comment-${commentId}-${index}`}
                comment={comment}
                setComments={setComments}
                videoId={videoId}
              />
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Comments;

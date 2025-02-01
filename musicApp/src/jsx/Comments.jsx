
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/Comments.css';
import { URL } from '../config';

const Comments = ({ songId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState({ title: '', content: '' });
    const [editingCommentId, setEditingCommentId] = useState(null); // State to store the ID of the comment being edited
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    const userId = user ? user.userId : null;

    useEffect(() => {
        if (songId) {
            axios.get(`${URL}/comments/${songId}`)
                .then(response => {
                    setComments(response.data);
                })
                .catch(error => {
                    console.error('Error fetching comments:', error);
                });
        }
    }, [songId]);

    const handleAddComment = () => {
        if (newComment.title && newComment.content) {
            axios.post(`${URL}/comments`, { songId, userId, ...newComment })
                .then(() => {
                    setComments(prevComments => [...prevComments, { ...newComment, userName: user.userName, userId, commentId: Math.random().toString() }]);
                    setNewComment({ title: '', content: '' });
                })
                .catch(error => {
                    console.error('Error adding comment:', error);
                });
        }
    };

    const handleEditComment = (commentId) => {
        const updatedComment = comments.find(comment => comment.commentId === commentId);
        axios.put(`${URL}/comments/${commentId}`, { ...updatedComment, userId })
            .then(() => {
                setComments(prevComments =>
                    prevComments.map(comment =>
                        comment.commentId === commentId ? { ...comment, ...updatedComment, userName: comment.userName } : comment
                    )
                );
                setEditingCommentId(null);
            })
            .catch(error => {
                console.error('Error editing comment:', error);
            });
    };

    const handleDeleteComment = (commentId) => {
        axios.delete(`${URL}/comments/${commentId}`)
            .then(() => {
                setComments(prevComments => prevComments.filter(comment => comment.commentId !== commentId));
            })
            .catch(error => {
                console.error('Error deleting comment:', error);
            });
    };

    return (
        <div className="comments-container">
            <h3>תגובות</h3>
            {userId && (
                <div className="add-comment">
                    <input
                        type="text"
                        placeholder="כותרת"
                        value={newComment.title || ''}
                        onChange={e => setNewComment({ ...newComment, title: e.target.value })}
                    />
                    <textarea
                        placeholder="הוסף תגובה..."
                        value={newComment.content || ''}
                        onChange={e => setNewComment({ ...newComment, content: e.target.value })}
                    />
                    <button onClick={handleAddComment}>הוסף תגובה</button>
                </div>
            )}
            <div className="comments-list">
                {comments.map(comment => (
                    <div key={comment.commentId} className="comment">
                        {editingCommentId === comment.commentId ? (
                            <>
                                <input
                                    type="text"
                                    value={comment.title || ''}
                                    onChange={e => {
                                        const updatedComment = { ...comment, title: e.target.value };
                                        setComments(prevComments =>
                                            prevComments.map(c =>
                                                c.commentId === comment.commentId ? { ...c, ...updatedComment } : c
                                            )
                                        );
                                    }}
                                />
                                <textarea
                                    value={comment.content || ''}
                                    onChange={e => {
                                        const updatedComment = { ...comment, content: e.target.value };
                                        setComments(prevComments =>
                                            prevComments.map(c =>
                                                c.commentId === comment.commentId ? { ...c, ...updatedComment } : c
                                            )
                                        );
                                    }}
                                />
                                <button onClick={() => handleEditComment(comment.commentId)}>שמור</button>
                                <button onClick={() => setEditingCommentId(null)}>בטל</button>
                            </>
                        ) : (
                            <>
                                <h4>{comment.title}</h4>
                                <p>{comment.content}</p>
                                <small>מאת: {comment.userName}</small>
                                {comment.userId === userId && (
                                    <div className="comment-actions">
                                        <button onClick={() => setEditingCommentId(comment.commentId)}>ערוך</button>
                                        <button onClick={() => handleDeleteComment(comment.commentId)}>מחק</button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Comments;

import express from "express";
import { getCommentsBySongId, addComment, updateComment, deleteComment } from '../database/commentsDB.js';
const router = express.Router();

// Get all comments for a specific song
router.get('/:songId', async (req, res) => {
    const { songId } = req.params;
    try {
        const comments = await getCommentsBySongId(songId);
        res.send(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add a new comment
router.post('/', async (req, res) => {
    const { songId, userId, title, content } = req.body;
    try {
        await addComment({ songId, userId, title, content });
        res.status(201).json({ message: 'Comment added successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// Update an existing comment
router.put('/:commentId', async (req, res) => {
    const { commentId } = req.params;
    const { title, content, userId } = req.body;
    try {
        await updateComment(commentId, { title, content, userId });
        res.status(200).json({ message: 'Comment updated successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a comment
router.delete('/:commentId', async (req, res) => {
    const { commentId } = req.params;
    const { userId } = req.body;
    try {
        await deleteComment(commentId, userId);
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;

import pool from './database.js';

// Get all comments for a specific song
export async function getCommentsBySongId(songId) {
    const [comments] = await pool.query(`
        SELECT sc.*, u.userName 
        FROM songcomments sc
        JOIN users u ON sc.userId = u.userId
        WHERE sc.songId = ?
        ORDER BY sc.commentId DESC
    `, [songId]);
    return comments;
}

// Add a new comment
export async function addComment(newComment) {
    await pool.query(`
        INSERT INTO songcomments (songId, userId, title, content)
        VALUES (?, ?, ?, ?)
    `, [newComment.songId, newComment.userId, newComment.title, newComment.content]);
}

// Update an existing comment
export async function updateComment(commentId, updatedComment) {
    await pool.query(`
        UPDATE songcomments
        SET title = ?, content = ?
        WHERE commentId = ? AND userId = ?
    `, [updatedComment.title, updatedComment.content, commentId, updatedComment.userId]);
}

// Delete a comment
export async function deleteComment(commentId, userId) {
    await pool.query(`
        DELETE FROM songcomments
        WHERE commentId = ? AND userId = ?
    `, [commentId, userId]);
}


// Delete a comment
export async function deleteCommentsBySongId(songId) {
    await pool.query(`
        DELETE FROM songcomments
        WHERE songId = ? 
    `, [songId]);
}

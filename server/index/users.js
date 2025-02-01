import express from "express";
import Joi from "joi";
import { getAllUsers, getUser, postUser, deleteUser, updateUser, countUsers } from '../database/usersDB.js';
import { postPlaylist } from '../database/playlistDB.js';

const route = express.Router();

// Joi schema for user validation
const userSchema = Joi.object({
    userName: Joi.string().min(1).required().messages({
        'string.empty': 'User name is required',
        'any.required': 'User name is required'
    }),
    email: Joi.string().email().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Email must be a valid email address',
        'any.required': 'Email is required'
    })
});

// Get all singers
route.get('/', async (req, res) => {
    try {
        const singers = await getAllUsers();
        if (!singers) {
            return res.sendStatus(404);
        }
        res.send(singers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// getUser by id
route.post('/userLogin', async (req, res) => {
    const { userName, email } = req.body;

    // Validate user data
    const { error } = userSchema.validate({ userName, email });
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        const user = await getUser(userName, email);
        console.log("user",user);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        res.send(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

route.post('/', async (req, res) => {
    const { userName, email } = req.body;

    // Validate user data
    const { error } = userSchema.validate({ userName, email });
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        await postUser({ userName, email });
        const user = await getUser(userName, email);

        // Create a new private playlist for the new user
        const newPlaylist = {
            playlistName: 'השירים שאהבתי',
            userId: user.userId, // Assuming the new user has a 'userId' field
            isPublic: false
        };
        const playlist = await postPlaylist(newPlaylist, 'postUser');
        res.status(201).send(user);
    } catch (err) {
        console.error('Error in route:', err);
        res.status(400).json({ message: err.message });
    }
});

route.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { userName, email } = req.body;

    // Validate user data
    const { error } = userSchema.validate({ userName, email });
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        await updateUser({ userId: id, userName, email });
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

route.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await deleteUser(id);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint לספירת משתמשים
route.get('/count', async (req, res) => {
    try {
        const userCount = await countUsers();
        res.json({ count: userCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default route;

import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { getAllSingers,getSinger, getSingerById, postSinger, deletePassword, deleteSinger, updateSinger, postPass, getPasswordBySingerId, updatePassword, countSingers } from '../database/singersDB.js';
import { fileURLToPath } from 'url';
import Joi from 'joi';
const route = express.Router();


// הגדרת נתיבים עבור העלאת קבצים
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');

// יצירת תיקיית העלאות אם היא לא קיימת
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// הגדרת אחסון הקבצים עבור Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// פונקציה לבדיקת תקינות נתונים ליצירת זמר חדש
function validateSinger(singer) {
  const singerSchema = Joi.object({
    singerName: Joi.string().required(),
    singerPhone: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
    profile: Joi.string().required(),
    password:Joi.required(),
    pictureUrl: Joi.any()
  });
  return singerSchema.validate(singer);
}


route.post('/', upload.single('pictureUrl'), async (req, res) => {
  try {
    const { singerName, singerPhone, profile, password } = req.body;
    const pictureUrl = req.file ? `/uploads/${req.file.filename}` : '';

    // בדיקת תקינות הנתונים שנקלטו
    const { error } = validateSinger({ singerName, singerPhone, profile, password, pictureUrl });
    if (error) {
      console.log("error",error.message);
      return res.status(400).json({ message: error.details[0].message });
    }

    const newSinger = await postSinger({ singerName, singerPhone, pictureUrl, profile });
    await postPass(newSinger.singerId, password);
    const data = await getSinger(newSinger.singerName, password);
    res.status(201).send(data);
  } catch (err) {
    console.error('Error adding new singer:', err);
    res.status(400).json({ message: err.message });
  }
});

route.put('/:id', upload.single('pictureUrl'), async (req, res) => {
  try {
    const id = req.params.id;
    const { singerName, singerPhone, profile, password } = req.body;
    const pictureUrl = req.file ? `/uploads/${req.file.filename}` : req.body.pictureUrl;
    //בדיקת תקינות
    const { error } = validateSinger({ singerName, singerPhone, profile, password, pictureUrl });
    if (error) {
      console.log("error",error.message);
      return res.status(400).json({ message: error.details[0].message });
    }
    const updatedSinger = { singerName, singerPhone, profile, pictureUrl };

    const singer = await updateSinger(id, updatedSinger);
    
    if (password) {
      await updatePassword(id, password);
    }

    res.status(200).json(singer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

route.get('/', async (req, res) => {
  try {
    const singers = await getAllSingers();
    if (!singers) {
      return res.sendStatus(404);
    }
    res.send(singers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

route.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const singer = await getSingerById(id);
    if (!singer) {
      return res.sendStatus(404);
    }
    res.send(singer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

route.post('/singerLogin', async (req, res) => {
  try {
    const { userName, password } = req.body;
    const singer = await getSinger(userName, password);
    if (!singer) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.send(singer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



route.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await deletePassword(id);
    await deleteSinger(id);
    res.status(200).json({ message: 'Singer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


//קבלת סיסמא לזמר
route.get('/:id/password', async (req, res) => {
  try {
    const id = req.params.id;
    const password = await getPasswordBySingerId(id);
    if (!password) {
      return res.sendStatus(404);
    }
    res.json({ password });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


//ספירת הזמרים
route.get('/count/:userId', async (req, res) => {
  try {
    const singerCount = await countSingers();
    res.json({ count: singerCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




export default route;



// route.post('/:id/password', async (req, res) => {
  //   try {
  //     const id = req.params.id;
  //     const password = req.body.password;
  //     await postPass(id, password);
  //     res.status(201).json({ message: 'Password created successfully' });
  //   } catch (error) {
  //     res.status(400).json({ message: error.message });
  //   }
  // });
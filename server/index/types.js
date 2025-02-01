import { getAllTypes } from '../database/typesDB.js'
import express from "express";
const route = express.Router();

// Get all types
route.get('/', async (req, res) => {
    try {
      const types = await getAllTypes();
      console.log("types",types)
      if (!types) {
        return res.sendStatus(404);
      }
      res.send(types);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  export default route;
  
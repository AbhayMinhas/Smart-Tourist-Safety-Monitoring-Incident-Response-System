import express from "express";
import { protect } from "../../middleware/auth.middleware.js";
import {
  createIncidentHandler,
  getNearbyIncidentsHandler,
} from "./incident.controller.js";

const incidentRouter = express.Router();

incidentRouter.post("/", protect, createIncidentHandler);
incidentRouter.get("/nearby", protect, getNearbyIncidentsHandler);

export default incidentRouter;
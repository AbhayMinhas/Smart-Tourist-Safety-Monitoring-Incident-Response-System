import express from "express";
import { protect } from "../../middleware/auth.middleware.js";
import {
  createIncidentHandler,
  deleteIncidentHandler,
  getNearbyIncidentsHandler,
  updateIncidentHandler,
} from "./incident.controller.js";

const incidentRouter = express.Router();

incidentRouter.post("/", protect, createIncidentHandler);
incidentRouter.get("/nearby", protect, getNearbyIncidentsHandler);
incidentRouter.patch("/:id",protect,updateIncidentHandler);
incidentRouter.delete("/:id",protect,deleteIncidentHandler);

export default incidentRouter;
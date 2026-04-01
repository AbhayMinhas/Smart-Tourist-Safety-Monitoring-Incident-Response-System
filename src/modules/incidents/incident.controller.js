import { createIncident, getNearbyIncidents } from "./incident.service.js";

export const createIncidentHandler = async (req, res, next) => {
  try {
    const incident = await createIncident({
      userId: req.user._id,
      data: req.body,
    });
    res.status(201).json({
      success: true,
      data: incident,
    });
  } catch (err) {
    next(err);
  }
};

export const getNearbyIncidentsHandler = async (req,res,next)=>{
    try{
        const {lat,lng}=req.query;

        const incidents = await getNearbyIncidents({
            lat:parseFloat(lat),
            lng:parseFloat(lng),
        });

        res.json({
            success:true,
            data:incidents,
        });
    }catch(err){
        next(err);
    }
}
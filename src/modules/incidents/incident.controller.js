import { createIncident, deleteIncident, getNearbyIncidents, updateIncident } from "./incident.service.js";

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

export const updateIncidentHandler = async (req,res,next)=>{
  try{
    const incident = await updateIncident({
      incidentId: req.params.id,
      userId:req.user._id,
      data:req.body,
    });

    res.json({
      success:true,
      data:incident
    });
  }catch(err){
    next(err);
  }
};

export const deleteIncidentHandler = async (req,res,next)=>{
    try{
        await deleteIncident({
          incidentId:req.params.id,
          userId:req.user._id,
        });
        res.json({success:true,message:"Incident deleted"});
    }catch(err){
      next(err);
    }
};
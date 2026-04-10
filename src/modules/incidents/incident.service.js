import Incident from "./incident.model.js";

export const updateIncident = async ({ incidentId, userId, data }) => {
  const incident = await Incident.findById(incidentId);

  if (!incident) {
    throw {
      statusCode: 404,
      message: "Incident not found",
    };
  }

  if (incident.user.toString() != userId.toString()) {
    throw {
      statusCode: 403,
      message: "Unauthorized incident access",
    };
  }
  const allowedIncidentFields = ["type", "description"];

  const filteredIncidentData = {};
  Object.keys(data).forEach((key) => {
    if (allowedIncidentFields.includes(key)) {
      filteredIncidentData[key] = data[key];
    }
  });

  Object.keys(filteredIncidentData).forEach((key)=>{
    incident[key]=filteredIncidentData[key];
  })

  return await incident.save();
};

export const deleteIncident = async ({incidentId,userId})=>{
  const incident = await Incident.findById(incidentId);
  if (!incident) {
    throw {
      statusCode: 404,
      message: "Incident not found",
    };
  }

  if (incident.user.toString() != userId.toString()) {
    throw {
      statusCode: 403,
      message: "Unauthorized incident access",
    };
  }

  await incident.deleteOne();
  return {message:"Incident deleted"};
  
}

export const createIncident = async ({ userId, data }) => {
  const { lat, lng, type, description } = data;

  return await Incident.create({
    user: userId,
    type,
    description,
    location: {
      type: "Point",
      coordinates: [lng, lat],
    },
  });
};

export const getNearbyIncidents = async ({ lat, lng }) => {
  return await Incident.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng, lat],
        },
        distanceField: "distance",
        maxDistance: 2000,
        spherical: true,
      },
    },
    {
      $match: {
        createdAt: {
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000), //lat 24 hrs
        },
      },
    },
    {
      $project: {
        type: 1,
        description: 1,
        coordinates: "$location.coordinates",
        user: 1,
      },
    },
  ]);
};

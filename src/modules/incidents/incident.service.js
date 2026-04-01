import Incident from "./incident.model.js";

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
        $match:{
            createdAt:{
                $gte:new Date(Date.now()-24*60*60*1000),//lat 24 hrs
            },
        },
    },
    {
        $project:{
            type:1,
            description:1,
            coordinates:"$location.coordinates",
        },
    },
  ]);
};

import { fetchNearbyUsers } from "./location.service.js";


export const getNearbyUsers= async(req,res, next)=>{
    try{
        const {lat,lng}=req.query;
        if(!lat||!lng){
            throw{
                statusCode:400,
                message: "Latitude and Longitude required",
            };
        }
        const users = await fetchNearbyUsers({
            userId:req.user._id,
            lat: parseFloat(lat),
            lng: parseFloat(lng),
        });
        
        res.status(200).json({
            success:true,
            data: users,
        });
    }
    catch(err){
        next(err);
    }
};
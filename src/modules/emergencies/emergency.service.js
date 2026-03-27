import Emergency from "./emergency.model.js";
import { sendEmail } from "../../utils/email.service.js";
import { userLocations } from "../../utils/locationCache.js";

export const getUserEmergencies = async (userId) => {
  return await Emergency.find({ user: userId }).sort({ createdAt: -1 });
};

export const getEmergency = async (id, userId) => {
  const emergency = await Emergency.findById(id);

  if (!emergency) {
    throw {
      statusCode: 404,
      message: "Emergency not found",
    };
  }
  if (emergency.user.toString() !== userId.toString()) {
    throw {
      statusCode: 403,
      message: "Not authorized",
    };
  }

  return emergency;
};

export const resolveEmergency = async (id, userId) => {
  const emergency = await Emergency.findById(id);

  if (!emergency) {
    throw {
      statusCode: 404,
      message: "Emergency not found",
    };
  }

  if (emergency.user.toString() !== userId.toString()) {
    throw {
      statusCode: 403,
      message: "Not authorized",
    };
  }

  if (emergency.status === "resolved") {
    throw {
      statusCode: 400,
      message: "SOS already resolved",
    };
  }

  emergency.status = "resolved";

  await emergency.save();

  return emergency;
};

export const createSOS = async (user, data) => {
  let latitude = 28.6139;
  let longitude = 77.209;

  // real-time location(memory)
  const cached= userLocations.get(user._id.toString());
  if(cached){
    latitude=cached.latitude;
    longitude=cached.longitude;
  }
  else{
    const lastLocation = await Location.findOne({user:user._id}).sort({createdAt:-1});

    if(lastLocation){
      longitude = lastLocation.location.coordinates[0];
      latitude=lastLocation.location.coordinates[1];

    }
    else{
      throw {
        statusCode: 400,
        message:"User location not available",
      }
    }
  }
  const message =
    data?.message || `${user.firstName} is in Problem need help ASAP!`;
  const alert = await Emergency.create({
    user: user._id,
    location: { latitude, longitude },
    message,
  });

  const safetyProfile = user.safetyProfile || {};
  const contacts = safetyProfile.emergencyContacts || [];

  const subject = "Emergency SOS Alert by the traveller!";

  const text = `
  Emergency Alert! 
  this is important the user might be in any threat or difficulty!

  Message:${message}

  User: ${user.firstName}
  Location: https://maps.google.com/?q=${latitude},${longitude}
  Blood Group: ${safetyProfile.bloodGroup || "N/A"}
  Allergies: ${safetyProfile.allergies || "N/A"}
  Medical Notes:${safetyProfile.medicalNotes || "N/A"}`;

  const html = `
    <h2>Emergency SOS Alert</h2>
    <p>this is important the user might be in any threat or difficulty!</p>

    <p><strong>Message:</strong> ${message}</p>

    <p><strong>User:</strong> ${user.firstName}</p>
    <p>
      <strong>Location:</strong>
      <a href="https://maps.google.com/?q=${latitude},${longitude}">
        View on Google Maps
      </a>
    </p>

    <h3>Medical Info:</h3>
    <ul>
      <li><strong>Blood Group:</strong> ${safetyProfile.bloodGroup || "N/A"}</li>
      <li><strong>Allergies:</strong> ${safetyProfile.allergies || "N/A"}</li>
      <li><strong>Medical Notes:</strong> ${safetyProfile.medicalNotes || "N/A"}</li>
    </ul>
  `;

  const emailPromises = contacts
    .filter((c) => c.email)
    .map((contact) =>
      sendEmail({
        to: contact.email,
        subject,
        text,
        html,
      }),
    );

  await Promise.all(emailPromises);
  return alert;
};

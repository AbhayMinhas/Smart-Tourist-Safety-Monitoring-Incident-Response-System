import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["theft", "accident", "harassment", "other"],
      required: true,
    },
    description: {
      type: String,
      maxLength: 500,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  { timestamps: true },
);

incidentSchema.index({location:"2dsphere"});

export default mongoose.model("Incident",incidentSchema);
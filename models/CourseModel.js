import mongoose from "mongoose";

const { Schema } = mongoose;

const courseSchema = new Schema({

    title: {
        type: String,
        requried: [true, "Please enter course title"],
        minLength: [4, "Title will be at least 4 characters"],
        maxLength: [80, "Title can't exceed 80 characters"],
    },

    description: {
        type: String,
        requried: [true, "Please enter course description"],
        minLength: [20, "Title must be at least 20 characetrs"]
    },

    lectures: [
        {
            title: {
                type: String,
                requried: true,
            },
            description: {
                type: String,
                requried: true,
            },
            video: {
                public_id: {
                    type: String,
                    required: true,
                },
                url: {
                    type: String,
                    required: true,
                },
            },
        },
    ],

    poster: {

        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },

    views: {
        type: Number,
        default: 0,
    },

    numOfVideos: {
        type: Number,
        default: 0,
    },

    category: {
        type: String,
        default: true,
    },

    createdBy: {
        type: String,
        default: "Enter the course creator name",
    },

    createdAt: {
        type: Date,
        default: Date.now(),
    },

})

export default mongoose.model("Course", courseSchema);
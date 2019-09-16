import mongoose from 'mongoose';

//schema é similar ao Model e similar à tabela do sql

const NotificationSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    user: {
      type: Number,
      required: true,
    },
    read: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
    {
      timestamps: true,
    }
  );

  export default mongoose.model('Notification', NotificationSchema);
const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['SYSTEM', 'URGENT', 'GENERAL'],
    default: 'GENERAL'
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    // Optional if it's a global system announcement
  }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);

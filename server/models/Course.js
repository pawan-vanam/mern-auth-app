const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a course title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  shortDescription: {
    type: String,
    required: [true, 'Please add a short description'],
    maxlength: [150, 'Short description cannot be more than 150 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a full description']
  },
  category: {
    type: String,
    required: true,
    enum: ['IT', 'Data Science (DS)', 'CS', 'Management', 'Commerce', 'Other']
  },
  categoryCode: {
    type: String // Derived from Category usually, e.g. IT, DS, CS
  },
  instructor: {
    type: String,
    required: [true, 'Please add an instructor name']
  },
  duration: {
    type: String,
    required: [true, 'Please add course duration (e.g. 6 Months)']
  },
  tags: [{
    label: String,
    type: {
      type: String,
      enum: ['primary', 'secondary'],
      default: 'primary'
    }
  }],
  theme: {
    type: String,
    enum: ['green', 'blue', 'orange', 'purple', 'red', 'indigo'],
    default: 'blue'
  },
  icon: {
    type: String,
    required: true, 
    // We will store just the key name: 'globe', 'code', 'lock', 'server', 'database', etc.
    // Frontend handles the mapping to actual Icon component.
    default: 'globe'
  },
  price: {
    type: Number,
    default: 199
  },
  modules: [{
    id: Number,
    title: String,
    description: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create slug from title
courseSchema.pre('validate', function() {
  if (this.title) {
    this.slug = this.title.toLowerCase().split(' ').join('-');
  }
});

module.exports = mongoose.model('Course', courseSchema, 'courses');

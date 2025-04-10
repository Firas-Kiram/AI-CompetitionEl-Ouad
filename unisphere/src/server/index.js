/**
 * UniSphere API Server
 * 
 * Express server to handle database operations and expose them via REST API
 */

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import eventService from '../services/eventService';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.send('UniSphere API is running');
});

// Event routes
app.get('/api/events', async (req, res) => {
  try {
    const { type, university } = req.query;
    
    let events;
    if (type) {
      events = await eventService.getEventsByType(parseInt(type));
    } else if (university) {
      events = await eventService.getEventsByUniversity(parseInt(university));
    } else {
      events = await eventService.getAllEvents();
    }
    
    res.json({ success: true, data: events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ success: false, message: 'Error fetching events' });
  }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const event = await eventService.getEventDetails(eventId);
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    res.json({ success: true, data: event });
  } catch (error) {
    console.error('Error fetching event details:', error);
    res.status(500).json({ success: false, message: 'Error fetching event details' });
  }
});

app.post('/api/events/:id/register', async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    
    const result = await eventService.registerForEvent(eventId, userId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ success: false, message: 'Error registering for event' });
  }
});

app.delete('/api/events/:id/register', async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    
    const result = await eventService.cancelEventRegistration(eventId, userId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error cancelling event registration:', error);
    res.status(500).json({ success: false, message: 'Error cancelling registration' });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const eventData = req.body;
    
    if (!eventData.title || !eventData.event_date || !eventData.start_time || !eventData.end_time) {
      return res.status(400).json({ 
        success: false, 
        message: 'Required fields missing (title, event_date, start_time, end_time)' 
      });
    }
    
    const result = await eventService.createEvent(eventData);
    
    if (result.success) {
      // If schedule items were included, add them
      if (eventData.schedule && Array.isArray(eventData.schedule) && eventData.schedule.length > 0) {
        await eventService.addEventSchedule(result.eventId, eventData.schedule);
      }
      
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ success: false, message: 'Error creating event' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`UniSphere API server running on port ${PORT}`);
});

export default app; 
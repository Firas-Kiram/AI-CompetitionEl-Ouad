/**
 * Event Service
 * 
 * Service for handling event-related operations with the database
 */

import db from '../config/db';

/**
 * Get all events with university and event type information
 * @returns {Promise<Array>} Array of event objects
 */
export const getAllEvents = async () => {
  const query = `
    SELECT 
      e.*, 
      u.name as university_name, 
      u.location as university_location,
      et.name as event_type_name
    FROM events e
    LEFT JOIN universities u ON e.university_id = u.id
    LEFT JOIN event_types et ON e.event_type_id = et.id
    ORDER BY e.event_date ASC, e.start_time ASC
  `;
  
  return await db.query(query);
};

/**
 * Get events filtered by type
 * @param {number} typeId - The event type ID
 * @returns {Promise<Array>} Array of filtered event objects
 */
export const getEventsByType = async (typeId) => {
  const query = `
    SELECT 
      e.*, 
      u.name as university_name, 
      u.location as university_location,
      et.name as event_type_name
    FROM events e
    LEFT JOIN universities u ON e.university_id = u.id
    LEFT JOIN event_types et ON e.event_type_id = et.id
    WHERE e.event_type_id = ?
    ORDER BY e.event_date ASC, e.start_time ASC
  `;
  
  return await db.query(query, [typeId]);
};

/**
 * Get events by university
 * @param {number} universityId - The university ID
 * @returns {Promise<Array>} Array of events for the specified university
 */
export const getEventsByUniversity = async (universityId) => {
  const query = `
    SELECT 
      e.*, 
      u.name as university_name, 
      u.location as university_location,
      et.name as event_type_name
    FROM events e
    LEFT JOIN universities u ON e.university_id = u.id
    LEFT JOIN event_types et ON e.event_type_id = et.id
    WHERE e.university_id = ?
    ORDER BY e.event_date ASC, e.start_time ASC
  `;
  
  return await db.query(query, [universityId]);
};

/**
 * Get detailed information about a specific event
 * @param {number} eventId - The event ID
 * @returns {Promise<Object>} Event object with schedule and participant count
 */
export const getEventDetails = async (eventId) => {
  // Get event basic information
  const eventQuery = `
    SELECT 
      e.*, 
      u.name as university_name, 
      u.location as university_location,
      et.name as event_type_name,
      o.username as organizer_username,
      o.first_name as organizer_first_name,
      o.last_name as organizer_last_name,
      o.email as organizer_email,
      (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id) as participant_count
    FROM events e
    LEFT JOIN universities u ON e.university_id = u.id
    LEFT JOIN event_types et ON e.event_type_id = et.id
    LEFT JOIN users o ON e.organizer_id = o.id
    WHERE e.id = ?
  `;
  
  const event = await db.getOne(eventQuery, [eventId]);
  
  if (!event) {
    return null;
  }
  
  // Get event schedule
  const scheduleQuery = `
    SELECT * FROM event_schedule
    WHERE event_id = ?
    ORDER BY time_slot ASC
  `;
  
  const schedule = await db.query(scheduleQuery, [eventId]);
  
  // Return combined data
  return {
    ...event,
    schedule
  };
};

/**
 * Register a user for an event
 * @param {number} eventId - The event ID
 * @param {number} userId - The user ID
 * @returns {Promise<Object>} The registration result
 */
export const registerForEvent = async (eventId, userId) => {
  try {
    // Check if already registered
    const checkQuery = `
      SELECT id FROM event_participants 
      WHERE event_id = ? AND user_id = ?
    `;
    
    const existing = await db.getOne(checkQuery, [eventId, userId]);
    
    if (existing) {
      return { success: false, message: 'Already registered for this event' };
    }
    
    // Check if event is at capacity
    const capacityQuery = `
      SELECT 
        e.max_participants,
        (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id) as current_participants
      FROM events e
      WHERE e.id = ?
    `;
    
    const capacity = await db.getOne(capacityQuery, [eventId]);
    
    if (capacity && capacity.current_participants >= capacity.max_participants) {
      return { success: false, message: 'Event is at full capacity' };
    }
    
    // Register for the event
    await db.insert('event_participants', {
      event_id: eventId,
      user_id: userId,
      status: 'registered'
    });
    
    return { success: true, message: 'Successfully registered for event' };
  } catch (error) {
    console.error('Error registering for event:', error);
    return { success: false, message: 'Error registering for event' };
  }
};

/**
 * Cancel a user's registration for an event
 * @param {number} eventId - The event ID
 * @param {number} userId - The user ID
 * @returns {Promise<Object>} The cancellation result
 */
export const cancelEventRegistration = async (eventId, userId) => {
  try {
    const result = await db.remove('event_participants', {
      event_id: eventId,
      user_id: userId
    });
    
    if (result.affectedRows > 0) {
      return { success: true, message: 'Registration cancelled successfully' };
    } else {
      return { success: false, message: 'No registration found to cancel' };
    }
  } catch (error) {
    console.error('Error cancelling event registration:', error);
    return { success: false, message: 'Error cancelling registration' };
  }
};

/**
 * Create a new event
 * @param {Object} eventData - The event data
 * @returns {Promise<Object>} The creation result with the new event ID
 */
export const createEvent = async (eventData) => {
  try {
    const result = await db.insert('events', eventData);
    
    if (result.insertId) {
      return { 
        success: true, 
        message: 'Event created successfully', 
        eventId: result.insertId 
      };
    } else {
      return { success: false, message: 'Failed to create event' };
    }
  } catch (error) {
    console.error('Error creating event:', error);
    return { success: false, message: 'Error creating event' };
  }
};

/**
 * Add schedule items to an event
 * @param {number} eventId - The event ID
 * @param {Array} scheduleItems - Array of schedule items (time_slot, activity)
 * @returns {Promise<Object>} The result of adding schedule items
 */
export const addEventSchedule = async (eventId, scheduleItems) => {
  try {
    // Add each schedule item
    for (const item of scheduleItems) {
      await db.insert('event_schedule', {
        event_id: eventId,
        time_slot: item.time_slot,
        activity: item.activity
      });
    }
    
    return { success: true, message: 'Schedule items added successfully' };
  } catch (error) {
    console.error('Error adding event schedule:', error);
    return { success: false, message: 'Error adding schedule items' };
  }
};

export default {
  getAllEvents,
  getEventsByType,
  getEventsByUniversity,
  getEventDetails,
  registerForEvent,
  cancelEventRegistration,
  createEvent,
  addEventSchedule
}; 
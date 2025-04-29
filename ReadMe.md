# CRUD API Assignment

## Easy Tasks
### /add-song
POST /add-song
Content-Type: application/json

{
    "songName": "Title",
    "artist": "Artist Name",
    "genre": "Pop"
}

### /get-songs
GET /get-songs
*Returns all songs on record*

## Medium Tasks
### /add-event
POST /add-event
Content-Type: application/json

{
    "eventName": "",
    "description": "",
    "date": ""
}

### /get-events
GET /get-events
*Returns all events on record*

### /add-rsvp
POST /add-rsvp
Content-Type: application/json

{
    "userName": "Bob Breakdancer",
    "email": "bob@breakdance.com",
    "attendance": "GOING",
    "eventId": 1
}

*attendanceEnum(['GOING', 'MAYBE', 'NOT_GOING'])*

### /get-rsvps/:eventId
GET /get-rsvps/:eventId

*Returns event details that corresponds with eventId*

## Hard Tasks
### /assign-homework
POST /assign-homework
Content-Type: application/json

**Adds a new assignment to students in the student model**

{
  "assignment": {
    "title": "Rhythm is king",
    "description": "Practice your moves for the final dance",
    "dueDate": "2025-05-01T23:59:00.000Z"
  },
  "studentIds": [2, 3, 4]
}

**Adds an existing assignment to any student not previously assigned to task**

{
  "assignmentId": 1,
  "studentIds": [1]
}

### /update-assignment/:assignmentId
PATCH /update-assignment/:assignmentId

{
    "title": "Rhythm is king",
    "description": "Practice your moves for the final dance",
    "dueDate": "2025-05-01T23:59:00.000Z"
}

**It should accept a partial update, so the following example should also be accepted**
{
    "title": "Rhythm is king II",
    "description": "Practice the choreography again and again",
}
*Leaving the dueDate unchanged*
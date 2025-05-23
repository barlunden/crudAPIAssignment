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
    "date": "YYYY-MM-DD"
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
### /add-student
POST /add-student
Content-Type: application/json

**Adds a student to the student roster**

{
  "name": "Name Nameson",
  "email: "email@emailson.com"
}

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
*This should leave the dueDate unchanged*

### /delete-assignment/:assignmentId
DELETE /delete-assignment/:assignmentId

**Deletes the assignment and any completions corresponding to it**

### /mark-completed
POST /mark-completed
Content-Type: application/json

{
    "studentId": 1,
    "assignmentId": 1,
    "dateCompleted": "2025-05-01T23:59:00.000Z",
    "notes": "Done and dusted",
}

### /completed-assignment/:assignmentId
GET /completed-assignment/:assignmentId

**Lists the corresponding assignment and the students claiming to have completed it.**

#### Things I consider further work on:
1. Change the dueDate on assignments to YYYY-MM-DD format as well
2. Validate that the dateCompleted is *after* the dueDate.
3. Make attendance non-case sensitive. In a user interface it would probably be a selector of some sorts.
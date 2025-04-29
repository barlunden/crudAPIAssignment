# CRUD API Assignment

## Easy Model
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

## Medium Model
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

*attendanceEnum(['GOING', 'MAYBE','NOT_GOING'])*
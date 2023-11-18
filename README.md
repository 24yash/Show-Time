# Show Time - Movie Ticket Booking Web Application

## Description

Show Time is a web application built primarily using Flask at the backend and Vue.js at the frontend. This project serves as a Mockie Ticket Booking website offering multiple User and Admin functionalities. Users can book tickets for various movies and give ratings based on their booking experiences. The application provides CRUD (Create, Read, Update, Delete) operations for theaters and movies.

## Technologies Used

- Flask
- Bootstrap
- Vue.js
- Flask-SQLAlchemy: Models implementation
- Celery: Backend Jobs such as Export Data and Scheduled Jobs
- Redis: Utilized for Celery Jobs and Caching to enhance Application Performance
- Flask JWT Extended: Token-based authentication
- Smtplib for testing email sending

## Database Schema Design

### Models:

- Users: Represents users in the system with a many-to-many relationship to shows through the bookings table.
- Venues: Represents theaters or venues with a one-to-many relationship to shows.
- Shows: Represents movies or shows with a many-to-many relationship to users (via bookings) and a many-to-one relationship to venues.
- Bookings: An association table implementing the many-to-many relationship between Users and Shows.

## Architecture

### Files:

- `models.py`: Contains the models for the database.
- `app.py`: Includes controllers for the application.
- `celery_worker.py`: Configuration for Celery.
- `templates`: Folder housing the single HTML file served.
- `static`: Contains styles.css, images, and Appjs Folder with the Vue app.
- CSS Styling: Utilized both internal CSS and styles.css file.

## Features

- Admin Credentials:

```
  Username: admin
  Password: password
```

- Signup feature available for Admin.
- Admin can create Theaters and add Movies.
- CRUD functionality for Theaters and Movies managed by Admin.
- Users can search for Movies or Theaters based on various criteria such as name, tag, location, rating, etc.
- Users can book tickets for Movies and rate their booking experiences.

## Instructions to Run the Application

In separate terminals in a Linux environment, run the following commands:

```bash
# Start Redis server
redis-server

# Run Flask server
python3 app.py

# Start Mailhog server (URL: http://localhost:8025/)
~/go/bin/MailHog

# Execute Celery worker for jobs
celery -A app.celery worker -l info

# Run Celery scheduler
celery -A app.celery beat
```

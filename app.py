from flask import *
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Mail, Message
from celery.schedules import crontab
from celery.result import AsyncResult
from datetime import datetime, timedelta
from flask_caching import Cache
import json
import csv
import os
import io

from models import *
from celery_worker import make_celery

current_dir = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'super-secret'
app.config['SECRET_KEY'] = 'Thisissecret'
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///bookings.sqlite3"

app.config['CACHE_TYPE'] = 'RedisCache'
app.config['CACHE_REDIS_HOST'] = '127.0.0.1'
app.config['CACHE_REDIS_PORT'] = 6379

jwt = JWTManager(app)
mail = Mail(app)
cache = Cache(app)
app.app_context().push()
db.init_app(app)

class Config:
    SCHEDULER_API_ENABLED = True
    SCHEDULER_TIMEZONE = 'Asia/Kolkata'

app.config.from_object(Config())

app.config.update(
    broker_url='redis://localhost:6379',
    result_backend='redis://localhost:6379'
)

from celery.schedules import crontab

celery = make_celery(app)

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

def send_email(to_address, subject, message):
    msg = MIMEMultipart()
    msg['Subject'] = subject
    msg['From'] = 'hey@showtime.com'
    msg['To'] = to_address
    msg.attach(MIMEText(message, "html"))

    s = smtplib.SMTP(host="localhost", port=1025)

    s.login("user@gmail.com", "pass")
    s.send_message(msg)
    s.quit()
    return True
    
#  Scheduling Jobs
@celery.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # # Calls test('send_monthly_report') every 40 seconds.
    # sender.add_periodic_task(40.0, send_monthly_report.s(), name='Report every 40')
    # Calls test('send_monthly_report') every 44 seconds.
    # sender.add_periodic_task(44.0, send_reminder.s(), name='Reminder every 44')

    # Executes every midnight on 28th day of month
    sender.add_periodic_task(
        crontab(hour=0, minute=0, day_of_month=28),
        send_monthly_report.s(),
    )

    # Calls send_reminder every day at 6:45 pm
    sender.add_periodic_task(
        crontab(hour=18, minute=45),
        send_reminder.s(),
    )

@celery.task
def send_reminder():
    with app.app_context():
        print("reminder job starting")

        now = datetime.utcnow()
        time_period = timedelta(days=1)
        cutoff_time = now - time_period

        users = Users.query.filter(~Users.bookings.any(Booking.date >= cutoff_time)).all()
        print(users)
        for user in users:
            if Users.checkAdmin(user):
                continue
            if(send_email(to_address=user.umail, subject="Reminder - Show Time", message="Don't forget to book tickets for your favourite show!")):
                print("emails sent")
        print("Reminders Sent")

@celery.task
def send_monthly_report():
    now = datetime.now()
    year = now.year
    month = now.month
    users = Users.query.all()
    print("Sending Reports")
    done="Report Sent"
    for user in users:
        if Users.checkAdmin(user):
            continue
        bookings = Booking.query.filter(Booking.user_id == user.uid, db.extract('year', Booking.date) == year, db.extract('month', Booking.date) == month).all()
        
        report = f"<h1>Monthly Entertainment Report for {month}/{year}</h1>"
        report += "<table style='border:1px solid black; border-collapse: collapse;'>"
        report += "<tr><th style='border:1px solid black; border-collapse: collapse;'>Show</th><th style='border:1px solid black; border-collapse: collapse;'>Rating</th><th style='border:1px solid black; border-collapse: collapse;'>Venue</th><th style='border:1px solid black; border-collapse: collapse;'>Number of Tickets</th></tr>"
        for booking in bookings:
            show = Shows.query.get(booking.show_id)
            venue = Venues.query.get(show.venue_id)
            report += f"<tr><td style='border:1px solid black; border-collapse: collapse;'>{show.sname}</td><td style='border:1px solid black; border-collapse: collapse;'>{show.rating}</td><td style='border:1px solid black; border-collapse: collapse;'>{venue.vname}</td><td style='border:1px solid black; border-collapse: collapse;'>{booking.num_tickets}</td></tr>"
        report += "</table>"
        send_email(to_address=user.umail, subject=f"Monthly Entertainment Report for {month}/{year}", message=report)
        print("sending...")
    print("Reports Sent")
    return done

@celery.task
def export_theater_csv(theater_id):
    import time
    time.sleep(4)
    shows = Shows.query.filter_by(venue_id=theater_id).all()
    bookings = Booking.query.join(Shows).filter(Shows.venue_id == theater_id).all()

    # Generate the CSV data
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Show Name', 'Show Time', 'Show Tag', 'Show Rating', 'Number of Bookings'])
    for show in shows:
        show_bookings = [booking for booking in bookings if booking.show_id == show.sid]
        writer.writerow([show.sname, show.time, show.tag, show.rating, len(show_bookings)])
    
    csv_data = output.getvalue()
    
    rows = csv_data.split('\n')
    data = [row.split(',') for row in rows]
    filename = os.path.join(current_dir, 'output.csv')
    # Writes the data to the CSV file
    with open(filename, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerows(data)
    return "Job Started..."

# --- ROUTES ---

# first time admin at db creation if admin already not present 
def create_admin():
    data = {'username': 'admin', 'password': 'password', 'name': 'Admin', 'umail': 'admin@admin.com'}
    user = Users.query.filter_by(username=data['username']).first()
    if not user:
        hashed_password = generate_password_hash(data['password'], method='sha256')
        new_user = Users(username=data['username'], password=hashed_password, uname=data['name'], umail=data['umail'], roles='ADMIN')
        db.session.add(new_user)
        db.session.commit()


@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('base.html')

@app.route('/adminlogin', methods=['GET', 'POST'])
def adminlogin():

    data = request.get_json()
    user = Users.query.filter_by(username=data['username']).first()
    if not user or not check_password_hash(user.password, data['password']) or not Users.checkAdmin(user):
        return jsonify({'message': 'Bad credentials'}), 401

    access_token = create_access_token(identity=user.username, expires_delta=timedelta(seconds=900))
    
    return jsonify({'access_token': access_token}), 200

@app.route('/login', methods=['GET', 'POST'])
def login():
    data = request.get_json()
    user = Users.query.filter_by(username=data['username']).first()
    if not user or not check_password_hash(user.password, data['password']) or Users.checkAdmin(user):
        return jsonify({'message': 'Bad credentials'}), 401

    access_token = create_access_token(identity=user.username, expires_delta=timedelta(seconds=900))

    return jsonify({'access_token': access_token}), 200

@app.route('/adminsignup', methods=['GET', 'POST'])
def adminsignup():
    data = request.get_json()
    user = Users.query.filter_by(username=data['username']).first()
    if not user:
        hashed_password = generate_password_hash(data['password'], method='sha256')
        new_user = Users(username=data['username'], password=hashed_password,  uname=data['name'], umail=data['umail'], roles='ADMIN')
        db.session.add(new_user)
        db.session.commit()

        access_token = create_access_token(identity=new_user.username, expires_delta=timedelta(seconds=900))
        

    return jsonify({'message': 'Registered successfully', 'access_token': access_token}), 200

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    data = request.get_json()
    user = Users.query.filter_by(username=data['username']).first()
    if not user:
        hashed_password = generate_password_hash(data['password'], method='sha256')
        new_user = Users(username=data['username'], password=hashed_password, uname=data['name'], umail=data['umail'])
        db.session.add(new_user)
        db.session.commit()

        access_token = create_access_token(identity=new_user.username, expires_delta=timedelta(seconds=900))
        

    return jsonify({'message': 'Registered successfully', 'access_token': access_token}), 200

@app.route('/api/is-admin')
@jwt_required()
def is_admin():
    user_username = get_jwt_identity()
    user = Users.query.filter_by(username=user_username).first()
    if Users.checkAdmin(user):
        return jsonify(isAdmin=True)
    else:
        return jsonify(isAdmin=False)
    
@cache.cached(timeout=10, key_prefix='get_all_venues')
def get_all_venues():
    venues = Venues.query.all()
    return venues

# CRUD ROUTES ON VENUES for ADMIN

#gets information for dashboard both user and admin
@app.route('/api/venues', methods=['GET', 'POST'])
@jwt_required()
def get_venues():
    venues = get_all_venues()
    result = []
    for venue in venues:
        shows = []
        for show in venue.shows:
            shows.append({'id': show.sid, 'name': show.sname, 'tag': show.tag, 'rating': show.rating, 'date': show.time, 'price': show.price})
        result.append({
            'id': venue.vid,
            'name': venue.vname,
            'location': venue.vlocation,
            'shows': shows
        })
    return json.dumps(result)

# new venue
@app.route('/addvenue', methods=['POST'])
@jwt_required()
def add_venue():
    data = request.get_json()
    name = data.get('name')
    location = data.get('location')
    capacity = data.get('capacity')
    if not name or not location or not capacity:
        return jsonify({'error': 'Missing data'}), 400
    venue = Venues(vname=name, vlocation=location, venue_capacity=capacity)
    db.session.add(venue)
    db.session.commit()
    return jsonify({'id': venue.vid}), 201
    
# delete venue
@app.route('/delete/venue/<int:venue_id>', methods=['DELETE'])
@jwt_required()
def delete_venue(venue_id):
    venue = Venues.query.get(venue_id)
    if venue:
        shows = Shows.query.filter_by(venue_id=venue_id).all()
        for show in shows:
            bookings = Booking.query.filter_by(show_id=show.sid).all()
            for booking in bookings:
                db.session.delete(booking)
            db.session.delete(show)
        db.session.delete(venue)
        db.session.commit()
        return '', 204
    else:
        return '', 404
    
# update venue get and put
@app.route("/updatevenue/<int:id>", methods=["GET"])
@jwt_required()
def get_venue(id):
    venue = Venues.query.get(id)
    return jsonify({
        "name": venue.vname,
        "location": venue.vlocation
    })


@app.route('/updatevenue/<int:venue_id>', methods=['PUT'])
@jwt_required()
def update_venue(venue_id):
    data = request.get_json()
    name = data.get('name')
    location = data.get('location')
    venue = Venues.query.get(venue_id)
    if not venue:
        return jsonify({'error': 'Venue not found'}), 404
    if name:
        venue.vname = name
    if location:
        venue.vlocation = location
    db.session.commit()
    return '', 204
    

#New show of a venue
@app.route("/api/venues/<int:id>/shows", methods=["POST"])
@jwt_required()
def add_show(id):
    data = request.get_json()
    show = Shows(
        sname=data["name"],
        time=data["time"],
        tag=data["tag"],
        rating=data["rating"],
        price=data["price"],
        venue_id=id
    )
    db.session.add(show)
    db.session.commit()
    return jsonify({"message": "Show added successfully"})

#Update show get and put
@app.route("/updateshow/<int:id>", methods=["GET"])
@jwt_required()
def get_show(id):
    show = Shows.query.get(id)
    return jsonify({
        "name": show.sname,
        "time": show.time,
        "tag": show.tag,
        "rating": show.rating,
        "price": show.price
    })

@app.route("/updateshow/<int:id>", methods=["PUT"])
@jwt_required()
def update_show(id):
    data = request.get_json()
    show = Shows.query.get(id)
    show.sname = data["name"]
    show.time = data["time"]
    show.tag = data["tag"]
    show.rating = data["rating"]
    show.price = data["price"]
    db.session.commit()
    return jsonify({"message": "Show updated successfully"})

#delete show
@app.route('/delete/show/<int:show_id>', methods=['DELETE'])
@jwt_required()
def delete_show(show_id):
    show = Shows.query.get(show_id)
    if show:
        bookings = Booking.query.filter_by(show_id=show.sid).all()
        for booking in bookings:
            db.session.delete(booking)
        db.session.delete(show)
        db.session.commit()
        return '', 204
    else:
        return '', 404
    

# FOR USER

#search 
@app.route('/api/search', methods=['POST'])
@jwt_required()
def search():
    searchkey = request.form['searchitem']
    result = []
    # search for matching venues
    venues = Venues.query.filter(
        Venues.vname.ilike('%'+searchkey+'%') |
        Venues.vlocation.ilike('%' + searchkey+'%')
    ).all()
    for venue in venues:
        shows = []
        for show in venue.shows:
            shows.append({
                'id': show.sid,
                'name': show.sname,
                'time': show.time,
                'tag': show.tag,
                'rating': show.rating,
                'price': show.price,
                'venue_id': show.venue_id,
                'venue_name': venue.vname
            })
        result.append({
            'id': venue.vid,
            'name': venue.vname,
            'location': venue.vlocation,
            'capacity': venue.venue_capacity,
            'shows': shows
        })
    # search for matching shows
    shows = Shows.query.filter(
        Shows.sname.ilike('%' + searchkey+'%') |
        Shows.tag.ilike('%' + searchkey+'%') |
        Shows.rating.ilike(searchkey+'%')
    ).all()
    for show in shows:
        result.append({
            'id': show.sid,
            'name': show.sname,
            'time': show.time,
            'tag': show.tag,
            'rating': show.rating,
            'price': show.price,
            'venue_id': show.venue_id,
            'venue_name': show.venue.vname,
            'venue_location': show.venue.vlocation
        })
    return json.dumps(result)

# Show details while making booking
@app.route('/api/shows/<int:show_id>')
@jwt_required()
def get_show_details(show_id):
    show = Shows.query.get(show_id)
    if show:
        venue = Venues.query.get(show.venue_id)
        bookings = Booking.query.filter_by(show_id=show_id).all()
        booked_tickets = sum([booking.num_tickets for booking in bookings])
        available_tickets = venue.venue_capacity - booked_tickets
        return jsonify({
            'name': show.sname,
            'availableTickets': available_tickets,
            'price': show.price
        })
    else:
        return jsonify({'error': 'Show not found'}), 404

# Make a new booking
@app.route('/api/bookings', methods=['POST'])
@jwt_required()
def create_booking():
    data = request.get_json()
    show_id = data['showId']
    num_tickets = int(data['numTickets'])
    user_username = get_jwt_identity()
    print(user_username)
    user_id = Users.query.filter_by(username=user_username).first().uid

    show = Shows.query.get(show_id)
    if show:
        venue = Venues.query.get(show.venue_id)
        bookings = Booking.query.filter_by(show_id=show_id).all()
        booked_tickets = sum([booking.num_tickets for booking in bookings])
        available_tickets = venue.venue_capacity - booked_tickets
        if num_tickets <= available_tickets:
            booking = Booking(user_id=user_id, show_id=show_id, num_tickets=num_tickets)
            db.session.add(booking)
            db.session.commit()
            return jsonify({'success': True})
        else:
            return jsonify({'error': 'Not enough tickets available'}), 400
    else:
        return jsonify({'error': 'Show not found'}), 404

# Return bookings detail
@app.route('/api/mybookings')
@jwt_required()
def get_bookings():
    user_username = get_jwt_identity()
    print(user_username)
    user_id = Users.query.filter_by(username=user_username).first().uid
    bookings = Booking.query.filter_by(user_id=user_id).all()
    result = []
    for booking in bookings:
        show = Shows.query.get(booking.show_id)
        venue = Venues.query.get(show.venue_id)
        result.append({
            'id': booking.id,
            'showId': show.sid,
            'showName': show.sname,
            'venueName': venue.vname,
            'venueLocation': venue.vlocation,
            'numTickets': booking.num_tickets,
            'rated': booking.Rated,
            'rating': show.rating
        })
    return jsonify(result)

# Return rating of a show
@app.route('/api/shows/<int:show_id>/rating')
@jwt_required()
def get_show_rating(show_id):
    show = Shows.query.get(show_id)
    if show:
        return jsonify({'rating': show.rating})
    else:
        return jsonify({'error': 'Show not found'}), 404

# User gives rating
@app.route('/api/shows/<int:show_id>/rate', methods=['POST'])
@jwt_required()
def rate_show(show_id):
    data = request.get_json()
    rating = data['rating']
    booking_id = data['bookingId']

    # Update user have rated for the booking
    booking = Booking.query.get(booking_id)
    if booking:
        booking.Rated = True
        db.session.commit()

    # Update show rating in database
    show = Shows.query.get(show_id)
    if show:
        if rating<show.rating:
            show.rating  = min(round(show.rating-(rating*0.1), 1), 5)
        else:
            show.rating  = max((round(show.rating+(rating*0.1), 1)),0)
        db.session.commit()
        return jsonify({'success': True})
    else:
        return jsonify({'error': 'Show not found'}), 404

# export csv triggering the job
@app.route("/trigger-celery-job/<int:theater_id>")
def trigger_celery_job(theater_id):
    a = export_theater_csv.delay(theater_id)
    return {
        "Task_ID" : a.id,
        "Task_State" : a.state,
        "Task_Result" : a.result
    }

@app.route("/status/<id>")
def check_status(id):
    res = AsyncResult(id, app = celery)
    return {
        "Task_ID" : res.id,
        "Task_State" : res.state,
        "Task_Result" : res.result
    }

@app.route("/download-file")
def download_file():
    return send_file("output.csv")

#sales or summary api provides number of tickets for a show 
from sqlalchemy import func
@app.route('/api/show-bookings')
@jwt_required()
def show_bookings():
    shows = Shows.query.all()
    data = []
    for show in shows:
        ticket_count = Booking.query.with_entities(func.sum(Booking.num_tickets)).filter_by(show_id=show.sid).scalar()
        venue_name = show.venue.vname
        data.append({'show': f"{show.sname}, {venue_name}", 'tickets': ticket_count})
    return jsonify(data)

import warnings

warnings.filterwarnings("ignore", category=UserWarning)

from sqlalchemy.exc import LegacyAPIWarning

warnings.filterwarnings("ignore", category=LegacyAPIWarning)

if __name__ == "__main__":
    create_admin()
    app.run(host='0.0.0.0',debug=True)
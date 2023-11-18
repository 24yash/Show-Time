from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

db = SQLAlchemy()

bookings = db.Table('bookings',
    db.Column('id', db.Integer, primary_key=True),
    db.Column('user_id', db.Integer, db.ForeignKey('users.uid')),
    db.Column('show_id', db.Integer, db.ForeignKey('shows.sid')),
    db.Column('num_tickets', db.Integer, nullable=False),
    db.Column('Rated', db.Boolean, nullable=False, default=False),
    db.Column('date', db.DateTime, nullable=False, default=datetime.utcnow)
)

class Booking(db.Model):
    __table__ = bookings

class Users(db.Model, UserMixin):
    uid = db.Column(db.Integer(), primary_key = True)
    password = db.Column(db.String(), nullable = False)
    uname = db.Column(db.String(25), nullable = False)
    username = db.Column(db.String(15), nullable = False, unique= True)
    umail = db.Column(db.String(60), nullable = False)
    roles = db.Column(db.String(8), default = 'USER')
    bookings = db.relationship('Shows', secondary=bookings, lazy='subquery', backref=db.backref('users', lazy=True))
    
    def get_id(self):
        return str(self.uid)

    def checkAdmin(self): 
        if self.roles == 'ADMIN':
            return True
        else:
            return False
        

class Venues(db.Model):
    vid = db.Column(db.Integer(), primary_key = True)
    vname = db.Column(db.String(40), nullable = False)
    vlocation = db.Column(db.String(100), nullable = False)
    venue_capacity = db.Column(db.Integer(), nullable = False) 
    shows = db.relationship('Shows', backref='venue', lazy="subquery")

class Shows(db.Model):
    sid = db.Column(db.Integer(), primary_key = True)
    sname = db.Column(db.String(80), nullable = False)
    time = db.Column(db.String(80), nullable = False)
    tag = db.Column(db.String(25), nullable = False)
    rating = db.Column(db.Integer(), nullable = False)
    price = db.Column(db.Integer(), nullable = False)
    venue_id = db.Column(db.Integer, db.ForeignKey('venues.vid'), nullable=False)

    def venue_name(self):
        return self.venue.vname
    
    def venue_location(self):
        return self.venue.vlocation
    
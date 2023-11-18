const MyBookings = Vue.component("my-bookings", {
    template: `
        <div>
        <nav class="navbar navbar-expand-lg navbar-dark" style="background-color: #D14D72; padding: 5px;">
                    <div class="container-fluid">
                    <a class="navbar-brand" href="#">Showtime</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul class="navbar-nav mb-2 mb-lg-0 ms-auto">
                <li class="nav-item">
                                    <router-link to="/search" class="nav-link">Search</router-link>
                                </li>
                                <li class="nav-item">
                                    <router-link to="/home" class="nav-link">Dashboard</router-link>
                                </li>
                                <li class="nav-item">
                                    <router-link to="/mybookings" class="nav-link">Bookings</router-link>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" @click="logout">Logout</a>
                                </li>
                        </ul>
                    </div>
                    </div>
                </nav>
            <div style="width: 80%; margin:auto; margin-top:3%;">
                <h1 style="color:white;">My Bookings</h1>
                <div v-for="booking in bookings" :key="booking.id" class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title">{{ booking.showName }}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">{{ booking.venueName }}, {{ booking.venueLocation }}</h6>
                        <p class="card-text">Number of Tickets: {{ booking.numTickets }}</p>
                        <p class="card-text">⭐{{ booking.rating }}</p>
                        <form v-if="!booking.rated" @submit.prevent="rateShow(booking)">
                            <label for="rating">Rate this show:</label>
                            <input type="number" id="rating" v-model.number="booking.newRating" min="1" max="5" placeholder="">
                            <button type="submit" class="btn btn-primary btn-sm">Submit</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `,
    data: function() {
        return {
            bookings: []
        }
    },
    mounted: function() {
        // Fetch bookings data from API
        fetch('/api/mybookings', {
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') }
        })
            .then(response => response.json())
            .then(data => {
                // Add newRating property to each booking
                this.bookings = data.map(booking => ({
                    ...booking,
                    newRating: null
                }));
            });
    },
    methods: {
        logout() {
            localStorage.removeItem('access_token');
            this.$router.push('/');
        },
        rateShow: function(booking) {
            // Send rating to API
            fetch(`/api/shows/${booking.showId}/rate`, {
                method: "POST",
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') ,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    rating: booking.newRating,
                    bookingId: booking.id
                })
            })
                .then(response => response.json())
                .then(data => {
                    // Handle rating response
                    if (data.success) {
                        alert("Rating submitted!");
                        booking.newRating = null;
                        location.reload();
                    } else {
                        alert("Failed to submit rating.");
                    }
                });
        }
    }
    
});


export default MyBookings;

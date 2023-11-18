const BookTicket = Vue.component("book-ticket", {
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
        <div class="card" style="margin:2%;">
            <div class=" card-body" style="width: 80%; margin:auto;">
                <h2>Book Tickets for {{ showName }}</h2>
                <p v-if="availableTickets > 0">Available Tickets: {{ availableTickets }}</p>
                <div v-if="availableTickets > 0">
                    <label for="num-tickets">Number of Tickets:</label>
                    <input type="number" id="num-tickets" v-model="numTickets" step="1">
                    <p>Total Price: {{ totalPrice }}</p>
                    <button @click="bookTickets" class="btn">Book</button>
                    <button type="button" class="btn" @click="$router.go(-1)">Cancel</button>
                </div>
                <div v-else-if="!isLoading">
                    <p>Sorry No Tickets are available</p>
                    <p>Housefull!</p>
                </div>
            </div>
        </div>
        </div>
    `,
    data: function() {
        return {
            showName: "",
            availableTickets: 0,
            numTickets: 0,
            isLoading: true, // New property
        }
    },
    computed: {
        totalPrice: function() {
            if (this.numTickets>0) {
                return this.numTickets * this.ticketPrice;
            } else {
                return 0;
            }
        }
    },
    mounted: function() {
        // Fetch show data from API
        fetch(`/api/shows/${this.$route.params.showId}`, {
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') }
        })
            .then(response => response.json())
            .then(data => {
                this.showName = data.name;
                this.availableTickets = data.availableTickets;
                this.ticketPrice = data.price;
                this.isLoading = false; // Data has been fetched
            });
    },
    methods: {
        logout() {
            localStorage.removeItem('access_token');
            this.$router.push('/');
        },
        bookTickets: function() {
            if (this.numTickets < 1 || this.numTickets % 1 !== 0 || this.numTickets>this.availableTickets) {
                alert("Please enter a valid number of tickets.");
                return;
            }
            // Send booking request to API
            fetch(`/api/bookings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                },
                body: JSON.stringify({
                    showId: this.$route.params.showId,
                    numTickets: this.numTickets
                })
            })
                .then(response => response.json())
                .then(data => {
                    // Handle booking response
                    if (data.success) {
                        alert("Booking successful!");
                    } else {
                        alert("Booking failed.");
                    }
                }).then(() => {
                    this.$router.push('/home');
                });
        }
    }
});

export default BookTicket;

const Search = Vue.component("search", {
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
            <div style="display: flex; justify-content: center; margin: 2%;">
                <input @keyup.enter="search" type="text" v-model="query" placeholder="Search for shows or theatres" style="margin-right: 10px;">
                <button @click="search" class="btn btn-primary btn-sm">Search</button>
            </div>
    
            <div v-for="result in results" :key="result.id" style="margin:5%;">
                <div class="card" style="width: 100%;">
                    <div class="card-body">
                        <div>
                            <h2 style="display: inline-block;">{{ result.name }}</h2>
                            <h2 v-if="result.location" style="display: inline-block;">, {{ result.location }}</h2>
                        </div>
                        <div class="d-flex">
                            <div v-for="show in result.shows" :key="show.id">
                                <div class="card" style="width: 180px; margin-right:20px;">
                                    <div class="card-body">
                                        <h6>{{ show.name }}</h6>
                                        <p class="text-muted" style="margin-bottom:1px; ">{{show.tag}}</p>
                                        <p class="text-muted">{{show.rating}}⭐</p>
                                        <p class="text-muted">{{show.time}}</p>
                                        <router-link :to="{ name: 'book-ticket', params: { showId: show.id } }" class="btn btn-primary">Book</router-link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p v-if="result.venue_name" class="text-muted" style="margin-bottom:1px; ">{{result.tag}}</p>
                        <p v-if="result.venue_name" class="text-muted">{{result.rating}}⭐</p>
                        <p v-if="result.venue_name" class="text-muted">{{result.time}}</p>
                        <h5 v-if="result.venue_name" class="text-muted">{{ result.venue_name }}, {{ result.venue_location }}</h5>
                        <router-link v-if="result.venue_name" :to="{ name: 'book-ticket', params: { showId: result.id } }" class="btn btn-primary">Book</router-link>
                    </div>
                </div>
            </div>
        </div>
    `,
    data: function() {
        return {
            query: "",
            results: []
        }
    },
    methods: {
        logout() {
            localStorage.removeItem('access_token');
            this.$router.push('/');
        },
        search: function() {
            fetch(`/api/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' ,'Authorization': 'Bearer ' + localStorage.getItem('access_token') },
                body: `searchitem=${this.query}`
            })
                .then(response => response.json())
                .then(data => { this.results = data; });
        }
    }
})

export default Search;

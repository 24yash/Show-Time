const AddVenue = Vue.component("Addvenue", {
    template : `
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
                            <router-link to="/admin" class="nav-link">Dashboard</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link to="/summary" class="nav-link">Sales</router-link>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" @click="logout">Logout</a>
                        </li>
                
                        </ul>
                    </div>
                    </div>
                </nav>
                <div class="card center" style="margin:auto; margin-top:3%; width: 80%;">
                <div class=" card-body" style="width: 100%; margin:auto;">
                <div>
                    <form @submit.prevent="addVenue">
                        <div class="mb-3">
                            <label for="venue-name" class="form-label">Venue Name</label>
                            <input type="text" class="form-control" id="venue-name" v-model="newVenueName" required>
                        </div>
                        <div class="mb-3">
                            <label for="venue-location" class="form-label">Venue Location</label>
                            <input type="text" class="form-control" id="venue-location" v-model="newVenueLocation" required>
                        </div>
                        <div class="mb-3">
                            <label for="venue-capacity" class="form-label">Venue Capacity</label>
                            <input type="number" class="form-control" id="venue-capacity" v-model.number="newVenueCapacity" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Add Venue</button>
                        <button type="button" class="btn" @click="$router.go(-1)">Cancel</button>
                    </form>
                    </div>
                    </div>
                </div>
                </div>
    `,
    data() {
        return {
            
            newVenueName: '',
            newVenueLocation: '',
            newVenueCapacity: 0
        }
      },
      methods: {
        logout() {
            localStorage.removeItem('access_token');
            this.$router.push('/');
        },
        addVenue() {
            const venueData = {
            name: this.newVenueName,
            location: this.newVenueLocation,
            capacity: this.newVenueCapacity
          };
        fetch('/addvenue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('access_token') },
            body: JSON.stringify(venueData)
        }).then(() => {
            this.newVenueName = '';
            this.newVenueLocation = '';
            this.newVenueCapacity = 0;
        }).then(() => {
            window.history.back();
        });
        }
      }
})

export default AddVenue;
const UpdateShow = Vue.component("update-show", {
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
                    <div style="width: 80%; margin:auto;">
                    <h2>Update Show</h2>
                    <form @submit.prevent="updateShow">
                        <div class="form-group">
                            <label for="name">Name:</label>
                            <input type="text" id="name" v-model="show.name" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="time">Time and Date:</label>
                            <input type="text" id="time" v-model="show.time" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="tag">Tag:</label>
                            <input type="text" id="tag" v-model="show.tag" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="rating">Rating:</label>
                            <input type="number" step=".01" id="rating" v-model.number="show.rating" class="form-control" max="5" min="1">
                        </div>
                        <div class="form-group">
                            <label for="price">Price:</label>
                            <input type="number" id="price" v-model.number="show.price" class="form-control" min="0">
                        </div>
                        <br>
                        <button type="submit" class="btn">Update Show</button>
                        <button type="button" class="btn" @click="$router.go(-1)">Cancel</button>
                    </form>
                    </div>
                </div>
            </div>
        </div>
    `,
    data: function() {
        return {
            show: {
                name: "",
                time: "",
                tag: "",
                rating: 0,
                price: 0
            }
        }
    },
    mounted: function() {
        fetch(`/updateshow/${this.$route.params.id}`, {
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') }
        })
            .then(response => response.json())
            .then(data => {
                this.show = data;
            });
    },
    methods: {
        logout() {
            localStorage.removeItem('access_token');
            this.$router.push('/');
        },
        updateShow() {
            fetch(`/updateshow/${this.$route.params.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                },
                body: JSON.stringify(this.show)
            }).then(() => {
                this.$router.push({ name: "adminhome" });
            });
        }
    }
});

export default UpdateShow;
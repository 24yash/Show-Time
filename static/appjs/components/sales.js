const Sales = Vue.component("sales", {
    data() {
        return {
            bookingsData: []
        }
    },
    mounted() {
        fetch('/api/show-bookings', {
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') }
        }).then(response => response.json())
            .then(data => {
                this.bookingsData = data;
                this.renderChart();
            });
    },    
    methods: {
        logout() {
            localStorage.removeItem('access_token');
            this.$router.push('/');
        },
        renderChart() {
            const ctx = document.getElementById('bookingsChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: this.bookingsData.map(item => item.show),
                    datasets: [{
                        label: 'Tickets',
                        data: this.bookingsData.map(item => item.tickets),
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        }        
    },
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
        <div style="margin-top:3%;">
            <div style="background-color: white; padding: 20px; width: 60%; margin: 0 auto;">
                <h1>Show Bookings</h1>
                <canvas id="bookingsChart"></canvas>
            </div>
        </div>
        </div>
    `
})

export default Sales;

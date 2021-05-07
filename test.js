const axios = require("axios");

axios
.post('http://localhost:5000/availability/new', {
    startDateTime: new Date(2020, 11, 20, 14, 0),
    endDateTime: new Date(2020, 11, 20, 14, 30)
})
.then((data) => {
    console.log(data.data)
})
.catch((error) => {
    console.log(error)
})

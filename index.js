const express = require('express')
const app = express()

const Port = 3000;

app.use(express.static('public'))

const server = app.listen(Port, () => {
    const port = server.address().port
    console.log('server started')
})
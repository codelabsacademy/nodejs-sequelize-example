const fs = require('fs')
const server = require('http').createServer()

server.on('request', (req, res) => {
    // Using fs.readFile
    // fs.readFile('./bigTextFile.txt', (err, data) => {
    //     if (err) throw new Error('Error while reading the file')

    //     res.end(data)
    // })

    // Using streams
    const source = fs.createReadStream("./bigTextFile.txt")

    source.pipe(res)
} )

server.listen(3000)
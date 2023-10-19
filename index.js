import Express from 'express'
import cors from 'cors'

const app = Express();
const port = 3000

app.use(Express.static('client'))
app.use(cors())

app.get('/', (req, res) => {
    res.sendFile('D:/projects/ChatApp/client/index.html')
})

app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`)
})

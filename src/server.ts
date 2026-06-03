
import app from "./app";
import config from "./config";
import { initDB } from "./db";
const port = config.port

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const main = ()=>{
   initDB()
   app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
}

main()
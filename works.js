let Order = require('./models/Orders')
process.on('message', (remoteData) => {
        setInterval( ()=>{
        remoteData.expire--
        if (remoteData.expire < 0 ) {
            return
        }
        Order.updateOne({ orderNumber: remoteData.orderNumber}, { expire: remoteData.expire })
             .then()
             .catch(err =>res.json('works,error'))
    },1000)
})
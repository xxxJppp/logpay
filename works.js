let Order = require('./models/Orders')
process.on('message', (remoteData) => {
        setInterval(()=>{
        remoteData.expire--
        if (remoteData.expire < 0 ) {
            process.kill(remoteData.pid, 'SIGTERM')
        }
        Order.updateOne({ orderNumber: remoteData.orderNumber}, { expire: remoteData.expire })
             .then()
             .catch(err =>res.json('works-error'))
    },1000)
})
let Order = require('./models/Orders')
process.on('message', (remoteData) => {
    if (remoteData.select) {
        clearInterval(timer)
    }
    timer = setInterval( ()=>{
        remoteData.expire--
        if (remoteData.expire < 0 ) {
            return
        }
        Order.updateOne({ orderNumber: remoteData.orderNumber}, { expire: remoteData.expire },(err,data)=>{
            if (err) {
                return res.status(500).send('Server error')                                    
            }
        })
    },1000)
})
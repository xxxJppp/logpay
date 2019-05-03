let Order = require('./models/Orders')
process.on('message', (remoteData) => {
        setInterval(()=>{
        remoteData.expire--
        if (remoteData.expire < 0 ) {
            try {
              return process.kill(remoteData.pid,'SIGTERM')		 
			} catch (e) {
				return console.log(e)
			}
        }
        Order.updateOne({ orderNumber: remoteData.orderNumber}, { expire: remoteData.expire })
             .then()
             .catch(err =>console.log('works-error'))
    },1000)
})
module.exports = {
    /* 应用AppID */
	"appid": 2019012263127570,

	/* 通知URL */
	"notifyUrl": "https://api.logpay.cn/server/api/alipayF2fNotify",

	/* 应用RSA私钥 请勿忘记 -----BEGIN RSA PRIVATE KEY----- 与 -----END RSA PRIVATE KEY-----  */
    "merchantPrivateKey": '-----BEGIN RSA PRIVATE KEY-----\r\nMIIEogIBAAKCAQEA3Y8xpJqPz6F9JXkhEXoVDVQRn88PWH5QJjHy4MeDVJbmHLuTayZ3LqCgzYm3QighWaEleoVbYLN9DUPPr1briYAjvUGo0OIARZjJJFTLLLnbzwmQcMbZaX97IkC103yuVZDYT1GYnDfDchupQ04PUpH0l2Gj5M/gf+Cp/7VCAKnlbogY/p42CWigS63bSP99MMi5fgQ3Zz0/2sSv2YaOpY0laxgTSyodPNLsHTjqCfOWi+kg5bBZd9iKVIGJ36AnoYlQ8Wge/Kokai5rxCYDPZTY2Ou4wmhDpUf9AgDgHGH8qMx/aCKk+N5XYp+AvqG24ykugkeutAkMpIwjvCpaGwIDAQABAoIBAGqC9midbVlx1wn2y3DtccVwjvB2yHfQcZOLG6n4ACjgSkux2VL/sPgXfHaTKCiDxlSiZbQa/Czm3M1NtkAi1yTJF2VadV/F5j+PDdOLeAlOaF+Fx4yP6+ENyhJTbZX4MI8uDO9E2Mrw++KVba/PjQoy5JUJ+ZJ8ZP7U8KTfbJWIMp4t7JjKQVjujEWyOkDS6P5VsEBpRA1hQ2IZtyv3U/9IWSol1hYcCi8r6J4WwHw3r6piOjaC7PTADQxZWjHNh5xEIQjpFICy3+L7Hpnjcoz2TRx9FG0drRIlf/jp0i9d7GfTLVXjvt81aWx8XELlyLTuUyHpW5Ozj7p6mFVRCtECgYEA8u1WrW4m9oQQ1t39e+EmL1oq4ZE9Ep3vOoUrPVmLB+BIMgHQgsRVEX40AFK3HkE1UaTMJarYlKGX04OXdbyKXObtLzDn7nfCcGIDWaflB6w52fEc0L8vrigPSmiKi3piuODtknMwPeyI7J6nRHeKpbR62M3g06bRUWT4PlHY1/0CgYEA6Xt8Ddshs9GXxeJAnad6UbZSD5VV/C+5LEKogGF5v01qlY71CmzH8f5OpLna4O9WcXp18zZQ28UAn1BmMssGHVVzSGeCkSHkwdBWnDfla/Sb3l1l4r7myrIphLQhr+eAUJamehZExaMCazBZNu/riMRHNMt1MW7DL0/PSVe3WfcCgYBRo/PSW0ea521lWLucy2Dy3wG0RwRYYl2ItEKA3rv7zKNWswdpOyQ/ucMuLJ4/+7g4lQLK0ezxnpEQ05OuTMvPRwiFKJF5siPVcwsfMW6mMnpKxV5ixS34AJyK7DFLiLju2yDca/vVg83Mf9FFEEu3Pr1eaWpalyCXkzBeeVE/3QKBgHOuahWXaAhnJVK3Ohqiuzk3I0tzS0oK/y1NzZzmLuM44UE+tmw2344n2SFGsIrYKrVI3p3lYISzBA7rT+eErf/ksZzDJG7yIxxgNDlsfHBTntK65dtFiKYPRgDpGvPDuNC1A8DjvalKjc08BEfy8Xku/rTKxcL7RRvw6BxHqKGbAoGABX3V8MwOK2jvlH/ht7ymC48SwYrzCggSwoLLL6/L05Wz6yhfOf56uE+hSVNGFyKW0pKl70wQ8eMfdwzYfl3B5rf4TPTpDe3BkMuXZfcCSJHa6Eje0daQlWGoWOZEAzch0e75li2qhPcwmeqIGzoxLmS68yI42FzwIxXBSzC7fGg=\r\n-----END RSA PRIVATE KEY-----',
    
	/* 支付宝公钥 如果为空会使用默认值 请勿忘记 -----BEGIN PUBLIC KEY----- 与 -----END PUBLIC KEY----- */
    "alipayPublicKey":'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxq5ef1opG7x63SqsF8b64mKK/maYckR/2JPiaate896gO6yL6/Lv4fBdDjzhNPwf9XnRjTeNwGjsjnIi4B4T+jQbXFyGIJExkrUhtOnYoyiKykXY7iFrWkCYkqlpzc6ncsqEBJONaFfIEdS+GecmMp9JMvNyr57kHVd775TttzTQcPKU8DKugBeIKYlPTEW/KHZT/8/za5n3FGSfWYl8ccqWOb/BFdhN0kO8Jn+QcwWqE8nj5eLZpni797Q17+55b2ewDXlgpfKdzdbwqX18j6GVI3bV2IvkzJyzTsDsMV0zytRtCHHxH1KRLu9iL03Oeoto9naD4vJSEgHxnrT4/wIDAQAB',
	
	/* 支付宝支付网关 如果为空会使用沙盒网关 */
	"gatewayUrl": "https://openapi.alipay.com/gateway.do",
}
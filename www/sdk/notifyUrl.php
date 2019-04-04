<?php
/*
 * 异步回调通知页面 (需商户在下单请求中传递notify_url)
 */
//接受通知返回的支付方式
require_once 'config.php';
require_once 'lib/logpay.class.php';
$logpay = new logpay($config['uid'], $config['token']);
date_default_timezone_set('Asia/Shanghai');
$data = file_get_contents('php://input');
$body = json_decode($data);
if ($body->payType == 'alipayf2f') {
	$Array['payType'] = $body->payType;// (支付渠道)
	$Array['price'] = $body->price;  //(1.00)
	$Array['orderNumber'] = $body->orderNumber; //(商户订单号)
	$Array['orderName'] = $body->orderName;
	$Array['orderUid'] = $body->orderUid;
	$Array['notifyUrl'] = $config['notifyUrl'];
    $Array['returnUrl'] = $config['returnUrl'];
	$sign = $logpay->Sign($Array);
	if ( $sign == $body->callbackSign) {
		// do something update database
		echo 'SUCCESS';
	} else {
		echo 'FAIL';
		header("HTTP/1.0 405 Method Not Allowed");
		exit();
	}
} else {
	//返回数据
	$Array['orderUid'] = $body->orderUid;// (支付用户账号)
	$Array['payPrice'] = $body->payPrice; //(实际支付价格)
	$Array['payType'] = $body->payType;// (支付渠道)
	$Array['price'] = $body->price;  //(1.00)
	$Array['orderNumber'] = $body->orderNumber; //(商户订单号)
	$Array['sign'] = $body->sign;
	$Array['token'] = $config['token'];
	// 签名函数
	$sign = md5( $Array['payPrice']. $Array['price']. $Array['payType']. $Array['orderNumber']. $Array['orderUid']. $Array['sign']. $Array['token'] );
	// 对比签名
	if($sign == $body->callbackSign) {
		// do something update database
		
		echo 'SUCCESS';
	} else {
		echo 'FAIL';
		header("HTTP/1.0 405 Method Not Allowed");
		exit();
	};
}
?>
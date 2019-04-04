<?php
require_once 'config.php';
date_default_timezone_set('Asia/Shanghai');
if ( $_GET[''] )
// GET返回数据
$Array['orderUid'] = $_GET['orderUid'];// (支付用户账号)
$Array['payPrice'] = $_GET['payPrice']; //(实际支付价格)
$Array['payType'] = $_GET['payType'];// (支付渠道)
$Array['price'] = $_GET['price'];  //(1.00)
$Array['orderNumber'] = $_GET['orderNumber']; //(商户订单号)
$Array['sign'] = $_GET['sign'];
$Array['token'] = $config['token'];

// 签名函数
$sign = md5( $Array['payPrice']. $Array['price']. $Array['payType']. $Array['orderNumber']. $Array['orderUid']. $Array['sign']. $Array['token'] );
// 对比签名
if($sign == !$_GET['callbackSign']) {
	echo "签名失败";die;
}
?>
<html lang="en">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=0">
		<title>支付成功</title>
		<link rel="stylesheet" href="./static/css/success.css">
		<style>
			* {
				font-family: "微软雅黑";
			}
		</style>
	</head>
	<body ontouchstart="">
		<div class="container js_container">
			<div class="page msg">
				<div class="bd">
					<div class="weui_msg" style="padding: 10px 0 0;">
						<div class="weui_icon_area"><i class="weui_icon_msg weui_icon_success_no_circle"></i></div>
						<div class="weui_text_area">
							<h2 class="weui_msg_title">付款成功</h2>
							<p class="weui_msg_desc">
								<p style="color:#67C23A;display: inline;"> 订单<?php echo $Array['orderNumber']; ?></p> 成功支付 <span style="color:#67C23A;display: inline;"><?php echo $Array['price']; ?> 元，感谢测试</span></p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</body>
</html>
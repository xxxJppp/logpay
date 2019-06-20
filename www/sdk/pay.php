<?php
date_default_timezone_set('Asia/Shanghai');
// 引入配置文件
require_once 'config.php';
require_once 'lib/logpay.class.php';
$logpay = new logpay($config['uid'], $config['token']);
// 得到get的文件
$Data['price'] = $_GET['price'];
$Data['orderUid'] = $_GET['orderUid'];
$Data['orderName'] = $_GET['orderName'];
$Data['notifyUrl'] = $config['notifyUrl'];
$Data['returnUrl'] = $config['returnUrl'];
if ($_GET['payType'] == 'alipayf2f') {
    $Data['orderNumber'] = 'YS'.date("YmdHis") . rand(100000, 999999);
} else {
    $Data['orderNumber'] = 'GR'. date("YmdHis") . rand(100000, 999999);
}
if($_GET['payType'] == 'alipayH5') {
	function Sign($Array) {
		$Sign = md5($Array['price']. $Array['payType']. $Array['orderUid']. $Array['orderName']. $Array['orderNumber']. $Array['notifyUrl']. $Array['returnUrl']. $Array['uid']. $Array['token']);
		return $Sign;
	}
	$Data['payType'] = 'alipay';
	$Data['uid'] = '10006';
    $Data['token'] = '84752af3c7347ab77b98244d1fc4e973';
	// md5加密
	$sign = Sign($Data);
} else {
	$Data['payType'] = $_GET['payType'];
	$Data['uid'] = $config['uid'];
    $Data['token'] = $config['token'];
	// md5加密
    $sign = $logpay -> Sign($Data);
}
function Ip() {
        //strcasecmp 比较两个字符，不区分大小写。返回0，>0，<0。
        if(getenv('HTTP_CLIENT_IP') && strcasecmp(getenv('HTTP_CLIENT_IP'), 'unknown')) {
            $ip = getenv('HTTP_CLIENT_IP');
        } elseif(getenv('HTTP_X_FORWARDED_FOR') && strcasecmp(getenv('HTTP_X_FORWARDED_FOR'), 'unknown')) {
            $ip = getenv('HTTP_X_FORWARDED_FOR');
        } elseif(getenv('REMOTE_ADDR') && strcasecmp(getenv('REMOTE_ADDR'), 'unknown')) {
            $ip = getenv('REMOTE_ADDR');
        } elseif(isset($_SERVER['REMOTE_ADDR']) && $_SERVER['REMOTE_ADDR'] && strcasecmp($_SERVER['REMOTE_ADDR'], 'unknown')) {
            $ip = $_SERVER['REMOTE_ADDR'];
        }
        $res =  preg_match ( '/[\d\.]{7,15}/', $ip, $matches ) ? $matches [0] : '';
        return $res;
        //dump(phpinfo());//所有PHP配置信息
    }

$Data['ip'] = Ip();
// 发送请求
if ($_GET['json']) {
echo '<html>
        <head><title>redirect...</title></head>
            <form id="post_data" method="post" action="https://api.logpay.cn/server/api/pay?format=json">
                <input type="hidden" name="payType" value='.$Data["payType"].'>
                <input type="hidden" name="sign" value='.$sign.'>
                <input type="hidden" name="notifyUrl" value='.$Data['notifyUrl'].'>
                <input type="hidden" name="orderNumber" value='.$Data['orderNumber'].'>
                <input type="hidden" name="price" value='.$Data["price"].'>
                <input type="hidden" name="returnUrl" value='.$Data['returnUrl'].'>
                <input type="hidden" name="uid" value='.$Data['uid'].'>
                <input type="hidden" name="orderUid" value='.$Data['orderUid'].'>
                <input type="hidden" name="orderName" value='.$Data['orderName'].'>
                <input type="hidden" name="ip" value='.$Data['ip'].'>
            </form>
            <script>document.getElementById("post_data").submit();</script>
</html>';
} else {
echo '<html>
        <head><title>redirect...</title></head>
            <form id="post_data" method="post" action="https://api.logpay.cn/server/api/pay">
                <input type="hidden" name="payType" value='.$Data["payType"].'>
                <input type="hidden" name="sign" value='.$sign.'>
                <input type="hidden" name="notifyUrl" value='.$Data['notifyUrl'].'>
                <input type="hidden" name="orderNumber" value='.$Data['orderNumber'].'>
                <input type="hidden" name="price" value='.$Data["price"].'>
                <input type="hidden" name="returnUrl" value='.$Data['returnUrl'].'>
                <input type="hidden" name="uid" value='.$Data['uid'].'>
                <input type="hidden" name="orderUid" value='.$Data['orderUid'].'>
                <input type="hidden" name="orderName" value='.$Data['orderName'].'>
                <input type="hidden" name="ip" value='.$Data['ip'].'>
            </form>
            <script>document.getElementById("post_data").submit();</script>
</html>';	
}
﻿<?php
date_default_timezone_set('Asia/Shanghai');
// 引入配置文件
require_once 'config.php';
require_once 'lib/logpay.class.php';
$logpay = new logpay($config['uid'], $config['token']);
// 得到get的文件
$Data['price'] = $_GET['price'];
$Data['orderUid'] = $_GET['orderUid'];
$Data['orderName'] = $_GET['orderName'];
$Data['payType'] = $_GET['payType'];

$Data['orderNumber'] = date("YmdHis") . rand(100000, 999999);
$Data['uid'] = $config['uid'];
$Data['token'] = $config['token'];
$Data['return_url'] = $config['return_url'];
$Data['notify_url'] = $config['notify_url'];
// md5加密
$sign = $logpay -> Sign($Data);
function GetIP(){
if(!empty($_SERVER["HTTP_CLIENT_IP"])){
  $cip = $_SERVER["HTTP_CLIENT_IP"];
}
elseif(!empty($_SERVER["HTTP_X_FORWARDED_FOR"])){
  $cip = $_SERVER["HTTP_X_FORWARDED_FOR"];
}
elseif(!empty($_SERVER["REMOTE_ADDR"])){
  $cip = $_SERVER["REMOTE_ADDR"];
}
else{
  $cip = "无法获取！";
}
return $cip;
}
$Data['ip'] = GetIP();
// 发送请求
echo '<html>
        <head><title>redirect...</title></head>
            <form id="post_data" method="post" action="https://api.logpay.cn/server/api/pay">
                <input type="hidden" name="payType" value='.$Data["payType"].'>
                <input type="hidden" name="sign" value='.$sign.'>
                <input type="hidden" name="notify_url" value='.$Data['notify_url'].'>
                <input type="hidden" name="orderNumber" value='.$Data['orderNumber'].'>
                <input type="hidden" name="price" value='.$Data["price"].'>
                <input type="hidden" name="return_url" value='.$Data['return_url'].'>
                <input type="hidden" name="uid" value='.$Data['uid'].'>
                <input type="hidden" name="orderUid" value='.$Data['orderUid'].'>
                <input type="hidden" name="orderName" value='.$Data['orderName'].'>
                <input type="hidden" name="ip" value='.$Data['ip'].'>
            </form>
            <script>document.getElementById("post_data").submit();</script>
</html>';
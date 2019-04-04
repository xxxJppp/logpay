<template>
<div class="recharge">
    <p style="font-size:16px;margin:1%  0 0 2.7%;">账户充值</p>
    <div class="body">
        <ul>
            <li v-for="(moneyList,i) in moneyLists" :key="i" @click="select(i,moneyList)" :class="{ active:i == selectId }">
                <p>{{ moneyList.money }}&nbsp;元</p>
                <img src="../../assets/images/select.png" class="none" :class="{ Nnone:i == selectId }" >
            </li>
            <li class="random" @click="selectRandom" :class="{ active: isActive }">
                <input type="number" placeholder="输入金额" v-model="randommoney">
                <img src="../../assets/images/select.png"  class="none" :class="{ Nnone:isActive }" >
            </li>
        </ul>
    </div>
    <div class="bottom" @click="goFloat">
        <p>我要充值</p>
    </div>
    <div class="float" v-show="float">
        <div class="fdetail">
            <p>本次充值
                <span >{{ money }}</span>
                元
            </p>
            <div class="wxpay" @click="wxpay">微信支付</div>
            <div class="alipay" @click="alipay">支付宝支付</div>
            <div class="close" @click="float=false">取消</div>
        </div>
    </div>
</div>
</template>
<script>
import { mapGetters } from 'vuex'
import axios from 'axios'
export default {
   data() {
    return {
        moneyLists: [
            {money:100},{money:200},{money:500},{money:1000},{money:1500},{money:5000}
        ],
        money: 100,
        selectId: 0,
        isActive: false,
        float: false,
        randommoney: ''
    }
    },
    computed: {
      ...mapGetters([
        'uid',
        'token'
      ])
      },
    methods: {
        alipay() {
            if(parseFloat(this.money)<=0) return false
            location.href = `https://api.logpay.cn/sdk/pay?price=${this.money}&payType=alipay&orderUid=${this.uid}&orderName=LogPayRecharge`
        },
        wxpay() {
             if(parseFloat(this.money)<=0) return false
             location.href = `https://api.logpay.cn/sdk/pay?price=${this.money}&payType=wxpay&orderUid=${this.uid}&orderName=LogPayRecharge`
        },
        select(item,moneyList) {
            this.money = moneyList.money
            this.isActive = false
            this.selectId = item
            this.randommoney = ''
        },
        selectRandom () {
            this.selectId = -1
            this.isActive = true
        },
        goFloat () {
            this.float = true
            if (this.randommoney) {
                this.money = this.randommoney
            }
        }
    }
    // activated() {
    //     this.money = 100,
    //     this.selectId = 0,
    //     this.isActive = false
    // }
}
</script>
<style lang="scss" scoped>
@import '../../assets/css/reset.css';
.recharge {
    .float {
        margin: 0 auto;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,.65);
        .fdetail {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: #fff;
            height: 268px;
            text-align: center;
            p {
                margin: 10px 0;
                display: inline-block;
                font-size: 18px;
                span {
                display: inline-block;
                font-size: 18px;
                color: #ff4c4c;
                }
            }
            .wxpay {
                margin: 10px 38px;
                height: 46px;
                border-radius: 10px;
                line-height: 46px;
                font-size: 16px;
                background-color: #67C23A;
                color: #fff;
            }
            .alipay {
                color: #fff;
                margin: 20px 38px;
                height: 46px;
                border-radius: 10px;
                line-height: 46px;
                font-size: 16px;
                background-color: #409EFF;
            }
            .close {
                margin: 10px 38px;
                height: 46px;
                border: 1px solid #cccccc;
                border-radius: 10px;
                line-height: 46px;
                font-size: 16px;
                color: #cccccc;
            }
        }
    }
    .bottom {
        height: 58px;
        background-color: #67C23A;
        margin: 28px 10px;
        border-radius: 5px;
        line-height: 58px;
        p {
            font-size: 20px;
            color: #ffffff;
            text-align: center;
        }
    }
    .body {
        margin-top: 20px;
        ul {
            width: 100%;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            li.active {
                border:1px solid #ff4c4c;
            }
            li {
                width: 30%;
                height: 66px;
                border: 1px solid #cccccc;
                border-radius: 5px;
                box-sizing: border-box;
                line-height: 66px;
                margin: 15px 5px;
                position: relative;
                .none {
                    display:none;
                }
                .Nnone {
                width: 30px;
                height: 30px;
                display: inline-block;
                position: absolute;
                bottom: 0;
                right: 0;
                }
                P {
                    color: #333;
                    text-align: center;
                    font-size: 16px;
                }
            }
            .random {
                height: 66px;
                line-height: 66px;
                input {
                    width: 100%;
                    color: #333;
                    text-align: center;
                }
                input::-webkit-input-placeholder{
                    color:#cccccc;
                    text-align: center;
                }
                input::-moz-placeholder{   /* Mozilla Firefox 19+ */
                    color:#cccccc;
                    text-align: center;
                }
                input:-moz-placeholder{    /* Mozilla Firefox 4 to 18 */
                    color:#cccccc;
                    text-align: center;
                }
                input:-ms-input-placeholder{  /* Internet Explorer 10-11 */ 
                    color:#cccccc;
                    text-align: center;
                }
            }
        }
    }
}
</style>
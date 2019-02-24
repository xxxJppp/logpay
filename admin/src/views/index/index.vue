<template>
<div class="wrapper">
  <div class="header">
    <div class="hleft">
      <el-button type="primary" size="mini"><a href="http://129.204.199.91/#/user/cmeal">修改套餐</a></el-button>
      <p v-if="mf">免费版</p>
      <p v-else-if="bz">标准版</p>
      <p v-else-if="gj">高级版</p>
    </div>
    <div class="hright">
      <el-button type="success" size="mini"><a href="http://129.204.199.91/#/user/recharge">账户充值</a></el-button>
      <p>{{ money }}</p>
    </div>
  </div>
  <!-- <div class="header" style="height:99px;">
    <div class="hleft">
      <el-button type="danger" >套餐到期时间</el-button>
      <p>{{ mealtime }}</p>
    </div>
    <div class="hright">
      <el-button type="warning" >注意</el-button>
      <p v-if="phoneStatus" style="color:#67C23A;">保持手机常亮</p>
      <p style="color:#F56C6C;" v-else>请打开app连接</p>
    </div>
  </div> -->
    <div class="today">
      <p style="text-align:center;">交易额数据</p>
      <el-table
    :data="tod_yes_data"
    border
    style="width: 100%">
    <el-table-column
      align="center"
      prop="tod_yes"
      label="">
    </el-table-column>
    <el-table-column
      align="center"      
      prop="ali"
      label="支付宝">
      </el-table-column>
    <el-table-column
      align="center"
      prop="wx"
      label="微信支付">
    </el-table-column>
    <el-table-column
      align="center"      
      prop="all"
      label="总收款">
    </el-table-column>
  </el-table>
  <div class="yes_tod_data">
    <p style="text-align:center;">订单数据</p>
      <el-table
    :data="yes_tod_data"
    border
    style="width:100%;">
    <el-table-column
      align="center"      
      prop="yes_tod"
      label="">
    </el-table-column>
    <el-table-column
      align="center"      
      prop="all_orderNumber"
      label="总订单数">
    </el-table-column>
    <el-table-column
      align="center"      
      prop="no_orderNumber"
      label="未回调订单数">
      <template slot-scope="scope">
            <span style="color:red;">{{ scope.row.no_orderNumber }}</span>
        </template>
    </el-table-column>
    <el-table-column
      align="center"      
      prop="pay_orderNumber"
      label="付款订单数">
    </el-table-column>
    <el-table-column
      align="center"      
      prop="pay_all"
      label="总收入">
    </el-table-column>
  </el-table>
  </div>
  </div>
</div>
</template>

<script>
import { mapGetters } from 'vuex'
import axios from 'axios'
export default {
  computed: {
    ...mapGetters([
      'meal',
      'mealtime',
      'money',
      'uid'
    ])
  },
   data() {
      return {
        mf:'',
        bz:'',
        gj:'',
        tod_yes_data: [
          {tod_yes: '今日',ali:'加载中...',wx:'加载中...',all:'加载中...'},
          {tod_yes: '昨日',ali:'加载中...',wx:'加载中...',all:'加载中...'},
          {tod_yes: '总',ali:'加载中...',wx:'加载中...',all:'加载中...'}
          ],
        yes_tod_data: [
          { yes_tod:'今日', all_orderNumber:'加载中...', no_orderNumber:'加载中...', pay_orderNumber:'加载中...',pay_all: '加载中...' },
          { yes_tod:'昨日', all_orderNumber:'加载中...', no_orderNumber:'加载中...', pay_orderNumber:'加载中...',pay_all: '加载中...' },
          { yes_tod:'总', all_orderNumber:'加载中...', no_orderNumber:'加载中...', pay_orderNumber:'加载中...',pay_all: '加载中...' }
        ]
      }
    },
  methods: {
    getDayMoney() {
      axios.get('http://129.204.199.91:9000/order/getDayMoney',{
        params:{
        uid:this.uid
        }
      })
      .then(res => {
          if (res.data.code == -1) {
              this.$message.error(res.data.msg)
              return false
          }
          if (res.data.data.all_fee && this.uid==='10001') {
            this.tod_yes_data[0].ali = `${res.data.data.tod_ali}(${res.data.data.tod_ali_fee})`
            this.tod_yes_data[0].wx = `${res.data.data.tod_wx}(${res.data.data.tod_wx_fee})`
            this.tod_yes_data[0].all = `${res.data.data.tod_all}(${res.data.data.tod_all_fee})`
            this.yes_tod_data[0].pay_all = res.data.data.tod_all
            this.tod_yes_data[1].ali = `${res.data.data.yes_ali}(${res.data.data.yes_ali_fee})`
            this.tod_yes_data[1].wx = `${res.data.data.yes_wx}(${res.data.data.yes_wx_fee})`
            this.tod_yes_data[1].all = `${res.data.data.yes_all}(${res.data.data.yes_all_fee})`
            this.yes_tod_data[1].pay_all = res.data.data.yes_all
            this.tod_yes_data[2].ali = `${res.data.data.all_ali}(${res.data.data.all_ali_fee})`
            this.tod_yes_data[2].wx = `${res.data.data.all_wx}(${res.data.data.all_wx_fee})`
            this.tod_yes_data[2].all = `${res.data.data.all_all}(${res.data.data.all_all_fee})`
            this.yes_tod_data[2].pay_all = res.data.data.all_all
          } else {
            this.tod_yes_data[0].ali = res.data.data.tod_ali
            this.tod_yes_data[0].wx = res.data.data.tod_wx
            this.tod_yes_data[0].all = res.data.data.tod_all
            this.yes_tod_data[0].pay_all = res.data.data.tod_all
            this.tod_yes_data[1].ali = res.data.data.yes_ali
            this.tod_yes_data[1].wx = res.data.data.yes_wx
            this.tod_yes_data[1].all = res.data.data.yes_all
            this.yes_tod_data[1].pay_all = res.data.data.yes_all
            this.tod_yes_data[2].ali = res.data.data.all_ali
            this.tod_yes_data[2].wx = res.data.data.all_wx
            this.tod_yes_data[2].all = res.data.data.all_all
            this.yes_tod_data[2].pay_all = res.data.data.all_all
          }
      })
    },
    getOrderNumber() {
      axios.get('http://129.204.199.91:9000/order/getOrderNumber',{
        params:{
        uid:this.uid
        }
      })
      .then(res => {
          if (res.data.code == -1) {
              this.$message.error(res.data.msg)
              return false
          }
          this.yes_tod_data[0].pay_orderNumber = res.data.data.today_success_order.length
          this.yes_tod_data[0].no_orderNumber = res.data.data.today_no_order.length
          this.yes_tod_data[0].all_orderNumber = res.data.data.today_all_order.length
          this.yes_tod_data[1].pay_orderNumber = res.data.data.yes_success_order.length
          this.yes_tod_data[1].no_orderNumber = res.data.data.yes_no_order.length
          this.yes_tod_data[1].all_orderNumber = res.data.data.yes_all_order.length
          this.yes_tod_data[2].pay_orderNumber = res.data.data.all_success_order.length
          this.yes_tod_data[2].no_orderNumber = res.data.data.all_no_order.length
          this.yes_tod_data[2].all_orderNumber = res.data.data.all_order.length
      })
    },
    getMeal() {
      if (this.meal == 'mf') {
        this.mf = true
      } else if (this.meal == 'bz') {
        this.bz = true
      } else if (this.meal == 'gj') {
        this.gj = true
      }
    }
  },
  mounted() {
    this.getMeal()
    this.getDayMoney()
    this.getOrderNumber()
  },
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.wrapper {
  width: 98%;
  font-size: 20px;
  margin: 0 auto;
  .header {
    height: 66px;
    font-size: 16px;
    margin-top: 1%;
    border-radius: 10px;
    background-color: #eeeeee;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    .hleft {
      width: 46%;
      display: inline-block;
      p {
        color: #409EFF;
        display: inline-block;
        margin-left: 2px;
        margin-right: 10px;
      }
    }
    .hright {
      width: 46%;
      display: inline-block;
      p {
        color: #67c23a;
        display: inline-block;
        margin-left: 3px;
      }
    }
  }
  .today {
    padding-top: 18px;
  }
  .yes_tod_data {
    padding-top: 18px;
  }
}
</style>

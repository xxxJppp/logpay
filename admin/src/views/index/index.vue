<template>
<div class="wrapper">
  <div class="header">
    <div class="hleft">
      <el-button type="primary"><a href="http://192.168.0.107:9259/#/user/cmeal">修改套餐</a></el-button>
      <p v-if="mf">免费版</p>
      <p v-else-if="bz">标准版</p>
      <p v-else-if="gj">高级版</p>
    </div>
    <div class="hright">
      <el-button type="success" ><a href="http://192.168.0.107:9259/#/user/recharge">账户充值</a></el-button>
      <p>{{ money }}</p>
    </div>
  </div>
  <div class="header" style="height:99px;">
    <div class="hleft">
      <el-button type="danger" >到期时间</el-button>
      <p>{{ mealtime }}</p>
    </div>
    <div class="hright">
      <el-button type="warning" >手机状态</el-button>
      <p v-if="phoneStatus" style="color:#67C23A;">连接成功</p>
      <p style="color:#F56C6C;" v-else>请打开app连接</p>
    </div>
  </div>
    <div class="today">
      <p style="text-align:center;">当日数据</p>
      <el-table
    :data="today_data"
    border
    style="width: 100%">
    <el-table-column
      align="center"
      prop="pid"
      label="手机">
    </el-table-column>
    <el-table-column
      align="center"
      prop="today_wx"
      label="当日微信收款">
    </el-table-column>
    <el-table-column
      align="center"      
      prop="today_ali"
      label="当日支付宝收款">
    </el-table-column>
    <el-table-column
      align="center"      
      prop="today_all"
      label="当日总收款">
    </el-table-column>
  </el-table>
  <div class="yes_tod_data">
    <p style="text-align:center;">交易数据分析</p>
      <el-table
    :data="yes_tod_data"
    border>
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

export default {
  computed: {
    ...mapGetters([
      'meal',
      'mealtime',
      'money'
    ])
  },
   data() {
      return {
        mf:'',
        jc:'',
        bz:'',
        gj:'',
        phoneStatus:false,
        today_data: [
          {pid: '手机1',
          today_wx: '16000',
          today_ali: '20000',
          // today_all: parseInt(today_ali) + parseInt(today_wx)
          today_all:'36000'
        }],
        yes_tod_data: [
          { yes_tod:'今日', all_orderNumber:1000,pay_orderNumber:899,pay_all: 36000 },
          { yes_tod:'昨日', all_orderNumber:1000,pay_orderNumber:899,pay_all: 36000 }
        ]
      }
    },
  name: 'index',
  methods: {
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
  },
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.wrapper {
  width: 94%;
  font-size: 20px;
  margin: 0 auto;
  .header {
    height: 88px;
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
        margin-left: 8px;
        margin-right: 10px;
      }
    }
    .hright {
      width: 46%;
      display: inline-block;
      p {
        color: #67c23a;
        display: inline-block;
        margin-left: 8px;
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

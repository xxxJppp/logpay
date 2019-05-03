<template>
<div class="wrapper">
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
      prop="all"
      label="总收款">
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
      label="总收款">
    </el-table-column>
  </el-table>
  </div>
  </div>
</div>
</template>

<script>
import { mapGetters } from 'vuex'
import { get_day_money, get_order_number } from '@/api/order'
export default {
  computed: {
    ...mapGetters([
      'roles'
    ])
  },
   data() {
      return {
        tod_yes_data: [
          {tod_yes: '今交易额',all:'加载中...',ali:'加载中...',wx:'加载中...'},
          {tod_yes: '今手续费',all:'加载中...',ali:'加载中...',wx:'加载中...'},
          {tod_yes: '昨交易额',all:'加载中...',ali:'加载中...',wx:'加载中...'},
          {tod_yes: '昨手续费',all:'加载中...',ali:'加载中...',wx:'加载中...'},
          {tod_yes: '总交易额',all:'加载中...',ali:'加载中...',wx:'加载中...'},
          {tod_yes: '总手续费',all:'加载中...',ali:'加载中...',wx:'加载中...'}
          ],
        yes_tod_data: [
          { yes_tod:'今日', all_orderNumber:'加载中...', no_orderNumber:'加载中...', pay_orderNumber:'加载中...',pay_all: '加载中...' },
          { yes_tod:'昨日', all_orderNumber:'加载中...', no_orderNumber:'加载中...', pay_orderNumber:'加载中...',pay_all: '加载中...' },
          { yes_tod:'总', all_orderNumber:'加载中...', no_orderNumber:'加载中...', pay_orderNumber:'加载中...',pay_all: '加载中...' }
        ]
      }
    },
  methods: {
    async getDayMoney() {
        let params = {
        role:this.roles[0]
        }
        let res = await get_day_money(params)
        this.tod_yes_data[0].ali = res.data.tod_ali
        this.tod_yes_data[1].ali = res.data.tod_ali_fee
        this.tod_yes_data[0].wx = res.data.tod_wx
        this.tod_yes_data[1].wx = res.data.tod_wx_fee
        this.tod_yes_data[0].all = res.data.tod_all
        this.tod_yes_data[1].all = res.data.tod_all_fee
        this.yes_tod_data[0].pay_all = res.data.tod_all

        this.tod_yes_data[2].ali = res.data.yes_ali
        this.tod_yes_data[3].ali = res.data.yes_ali_fee
        this.tod_yes_data[2].wx = res.data.yes_wx
        this.tod_yes_data[3].wx = res.data.yes_wx_fee
        this.tod_yes_data[2].all = res.data.yes_all
        this.tod_yes_data[3].all = res.data.yes_all_fee
        this.yes_tod_data[1].pay_all = res.data.yes_all

        this.tod_yes_data[4].ali = res.data.all_ali
        this.tod_yes_data[5].ali = res.data.all_ali_fee
        this.tod_yes_data[4].wx = res.data.all_wx
        this.tod_yes_data[5].wx = res.data.all_wx_fee
        this.tod_yes_data[4].all = res.data.all_all
        this.tod_yes_data[5].all = res.data.all_all_fee
        this.yes_tod_data[2].pay_all = res.data.all_all
    },
    async getOrderNumber() {
      let params = {
        role:this.roles[0]
      }
      let res = await get_order_number(params)
      this.yes_tod_data[0].pay_orderNumber = res.data.today_success_order.length
      this.yes_tod_data[0].no_orderNumber = res.data.today_no_order.length
      this.yes_tod_data[0].all_orderNumber = res.data.today_all_order.length
      this.yes_tod_data[1].pay_orderNumber = res.data.yes_success_order.length
      this.yes_tod_data[1].no_orderNumber = res.data.yes_no_order.length
      this.yes_tod_data[1].all_orderNumber = res.data.yes_all_order.length
      this.yes_tod_data[2].pay_orderNumber = res.data.all_success_order.length
      this.yes_tod_data[2].no_orderNumber = res.data.all_no_order.length
      this.yes_tod_data[2].all_orderNumber = res.data.all_order.length
    }
  },
  mounted() {
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
  // .today {
  //   padding-top: 0px;
  // }
  // .yes_tod_data {
  //   padding-top: 6px;
  // }
}
</style>

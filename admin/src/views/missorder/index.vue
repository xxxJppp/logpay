  <template>
  <div class="container">
    <div class="header">
      <el-input style="width:49%;" v-model="merchantUid" placeholder="商户号" v-if="this.roles[0] === 'admin'"></el-input>
      <el-input style="width:49%;" v-model="money" placeholder="未匹配金额"></el-input>
      <el-select style="margin:5px 0;width:49%;" v-model="type" placeholder="请选择">
      <el-option
        v-for="item in pay_type"
        :key="item.type"
        :label="item.label"
        :value="item.type">
      </el-option>
      </el-select>
      <el-date-picker
        v-model="missOrderDate"
        type="datetimerange"
        style="margin-bottom:5px;"
        :picker-options="picker"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        align="right">
      </el-date-picker>
      <el-button style="margin:0 0 5px 5px;" @click="selectMissOrder" size="mini">查询</el-button>
      <el-checkbox style="margin-left:10px;" v-model="missOrdersExport">订单导出</el-checkbox>
      <el-button  v-if="missOrdersExport" style="margin-left:5px;" @click="exportMissOrders" size="mini" >确认导出</el-button><span style="color:#cccccc;font-size:10px;margin-left:5px;" v-if="missOrdersExport">不支持Safari&nbsp;</span>
    </div>
    <el-table
      v-loading="listLoading"
      :data="missOrderList"
      element-loading-text="Loading"
      border
      fit
      >
      <el-table-column prop="uid" label="商户号" align="center" v-if="this.roles[0] === 'admin'">
      </el-table-column>
      <el-table-column prop="payPrice" label="未匹配价格" align="center">
      </el-table-column>
      <el-table-column prop="payType" label="支付渠道" align="center">
        <template slot-scope="scope">
            <span v-if="scope.row.payType == 'alipay'">支付宝</span>
            <span v-else>微信支付</span>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="支付时间" align="center">
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="nextPage"
      :page-sizes="[10, 20, 30, 40]"
      :page-size="page.num"
      layout="total, sizes, prev, pager, next, jumper"
      :total="page.total"
      style="width:100px;">
    </el-pagination>
  </div>
</template>

<script>
import axios from 'axios'
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      // 日期快捷选择
      picker: {
          shortcuts: [
            {
            text: '最近一天',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 1)
              picker.$emit('pick', [start, end])
            }
          },{
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
          }
          }]
        },
        // 获取日期
        missOrderDate:'',
        // 获取未匹配价格
        money:null,
        // 支付渠道得选择
        pay_type: [
          {
            type: null,
            label: '所有支付渠道'
          },
          {
            type: 'alipay',
            label: '支付宝'
          }, {
            type: 'wxpay',
            label: '微信'
          }],
          type: null,
        // 过滤得到得订单列表
        missOrderList: null,
        // 分页
        page: {
          page: 1,
          num: 10,
          total: 0
        },
        // 是否勾选到处订单
        missOrdersExport:false,
        // 订单导出的数组列表
        exportMissList:null,
        listLoading:false
    }
  },
  computed: {
    ...mapGetters([
      'uid',
      'roles'
    ])
  },
  created() {
    this.getMissOrder()
  },
  methods: {
    // 过滤订单列表
    selectMissOrder() {
      this.getMissOrder()
    },
    // 每一页有多少的订单个数
    handleSizeChange(val) {
        this.page.num = val
        this.getMissOrder()
      },
    // 下一页
    nextPage (val) {
      this.page.page = val;
      this.getMissOrder()
            },
      // 发起导出订单
      exportMissOrders() {
        let money = this.money
        if (this.money !== null) {
            money = parseFloat(this.money).toFixed(2,'0')
        }
        if (this.missOrderDate === null) {
          this.missOrderDate = ''
        }
        this.listLoading = true
        axios({
        url: 'https://api.logpay.cn/order/getMissOrder',
        method: 'get',
        params: {
            payPrice: money,
            payType:this.type,
            uid: this.uid,
            page: this.page.page,
            num: this.page.num,
            missOrderDate:this.missOrderDate,
            merchantUid:this.merchantUid,
            role:this.roles[0]
        }
    }).then(res => {
        if (res.data.code == -1) {
            this.$message.error(res.data.msg)
            return false
        }
        this.listLoading = false
        import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['未匹配金额', '支付渠道', '支付时间']
        const filterVal = ['payPrice', 'payType', 'createTime']
        this.exportMissList = res.data.data.missOrder
        this.exportMissList.map(v => {
            v.createTime = `${v.createTime.substring(0,10)} ${v.createTime.substring(11,19)}`
        })
        const data = this.formatJson(filterVal, this.exportMissList)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'LogPayMissOrders',
          autoWidth: true,
          bookType: 'xls'
        })
      })
    })
    .catch(err => this.$message.error('系统繁忙'))
    },
    // 过滤导出订单的属性
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else if (v[j] === 'alipay') {
          return '支付宝'
        } else if (v[j] === 'wxpay') {
          return '微信支付'
        } else {
          return v[j]
        }
      }))
    },
    // 发起获得订单列表
    getMissOrder() {
        let money = this.money
        if (this.money !== null) {
            money = parseFloat(this.money).toFixed(2,'0')
        }
        if (this.missOrderDate === null) {
            this.missOrderDate = ''
        }
        this.listLoading = true
        axios({
            url: 'https://api.logpay.cn/order/getMissOrder',
            method: 'get',
            params: {
                payPrice:money,
                payType:this.type,
                uid: this.uid,
                page: this.page.page,
                num: this.page.num,
                missOrderDate:this.missOrderDate,
                merchantUid:this.merchantUid,
                role:this.roles[0]
            }
        }).then(res => {
            if (res.data.code == -1) {
                this.$message.error(res.data.msg)
                return false
            }
            this.missOrderList = res.data.data.select
            this.missOrderList.map(v => {
            v.createTime = `${v.createTime.substring(0,10)} ${v.createTime.substring(11,19)}`
        })
            this.page.total = res.data.data.missOrder.length
            this.listLoading = false
        })
        .catch(err => this.$message.error('系统繁忙'))
        }
    }
}
</script>
<style>
.container {
  width: 98%;
  margin: 0 auto;
  margin-top: 1%;
}
.el-table .warning-row {
background: oldlace;
}
.el-table .success-row {
background: #f0f9eb;
}
</style>
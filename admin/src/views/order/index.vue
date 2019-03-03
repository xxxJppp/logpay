  <template>
  <div class="container">
    <div class="header">
      <el-input style="width:49%;" v-model="number" placeholder="订单号"></el-input>
      <el-input style="width:49%;" v-model="name" placeholder="订单用户名"></el-input>
      <el-select style="margin:5px 0;width:49%;" v-model="value1" placeholder="请选择">
      <el-option
        v-for="item in type"
        :key="item.value1"
        :label="item.label"
        :value="item.value1">
      </el-option>
      </el-select>
      <el-select style="margin:5px 0;width:49%;" v-model="value2" placeholder="请选择">
      <el-option
        v-for="item in Status"
        :key="item.value2"
        :label="item.label"
        :value="item.value2">
      </el-option>
      </el-select>
      <el-button style="margin-bottom:5px;" @click="selectOrder" size="mini">查询</el-button>
      <el-checkbox style="margin-left:10px;" v-model="ordersExport">订单导出</el-checkbox>
      <el-button style="margin-bottom:5px;margin:0 10px;" v-if="ordersExport"  @click="exportOrders" size="mini" >确认导出</el-button><span style="color:#cccccc;font-size:10px;" v-if="ordersExport">不支持Safari&nbsp;</span>
      <el-date-picker
        v-if="ordersExport"
        v-model="orderDate"
        style="margin-bottom:5px;"
        type="datetimerange"
        :picker-options="picker"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        align="right">
      </el-date-picker>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      :row-class-name="tableRowClassName"
      >
      <el-table-column prop="orderName" label="商品名称" align="center">
      </el-table-column>
      <el-table-column prop="orderNumber" label="订单号" align="center">
      </el-table-column>
      <el-table-column prop="orderUid" label="用户名" align="center">
      </el-table-column>
      <el-table-column prop="create_time" label="创建时间" align="center">
      </el-table-column>
      <el-table-column prop="pay_time" label="支付时间" align="center">
      </el-table-column>
      <el-table-column prop="payType" label="支付渠道" align="center">
        <template slot-scope="scope">
            <span v-if="scope.row.payType == 'alipay'">支付宝</span>
            <span v-else>微信支付</span>
        </template>
      </el-table-column>
      <el-table-column prop="pay_price" label="支付金额" align="center">
      </el-table-column>
      <el-table-column prop="fee" label="服务费" align="center">
      </el-table-column>
      <el-table-column prop="status" label="状态" align="center">
        <template slot-scope="scope">
            <span v-if="scope.row.status == '-1'" style="color:red;">未支付</span>
            <span v-else-if="scope.row.status == '1'" style="color:red;">回调失败</span>
            <span v-else-if="scope.row.status == '2'" style="color:#37B328;">支付成功</span>
        </template>
      </el-table-column>
      <el-table-column width="110" label="操作" align="center">
          <template slot-scope="scope">
              <el-button
              size="mini"
              type="danger"
              @click="handleNotify(scope.row.orderNumber)" v-if="scope.row.status == 1">手动回调</el-button>
              <el-button
              size="mini"
              type="primary"
              v-if="scope.row.status == 2">^-^</el-button>
              <el-button
              size="mini"
              type="Info"
              v-else-if="scope.row.status == -1">........</el-button>
          </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="nextPage"
      :page-sizes="[10, 20, 30, 40]"
      :page-size="page.num"
      layout="total, sizes, prev, pager, next, jumper"
      :total="page.total">
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
        orderDate:'',
        // 获取订单号
        number:null,
        // 获取订单名称
        name:null,
        // 支付渠道得选择
        type: [
          {
            value1: null,
            label: '所有支付渠道'
          },
          {
            value1: 'alipay',
            label: '支付宝'
          }, {
            value1: 'wxpay',
            label: '微信'
          }],
          value1: null,
        // 支付状态得选择
        Status: [
          {
            value2: null,
            label: '所有状态'
          },{
            value2: '-1',
            label: '未支付'
          }, {
            value2: '1',
            label: '回调失败'
          }, {
            value2: '2',
            label: '支付成功'
          }],
          value2: null,
        // 过滤得到得订单列表
        list: null,
        // 分页
        page: {
          page: 1,
          num: 10,
          total: 0
        },
        // 是否勾选到处订单
        ordersExport:false,
        // 订单导出的数组列表
        exportList:null,
        listLoading:false
    }
  },
  computed: {
    ...mapGetters([
      'uid'
    ])
  },
  created() {
    this.getOrder()
  },
  methods: {
    // 处理未通知的
    handleNotify(orderNumber) {
      axios.post('http://logpay.paywz.cn/server/api/query',{orderNumber,uid:this.uid})
           .then(data => {
             this.getOrder()
             })
           .catch(err => this.$message.error(err))
    },
    // 过滤订单列表
    selectOrder() {
      this.getOrder()
    },
    // 每一页有多少的订单个数
    handleSizeChange(val) {
        this.page.num = val
        this.getOrder()
      },
    // 下一页
    nextPage (val) {
      this.page.page = val;
      this.getOrder()
            },
    // 状态不同有不同的颜色
    tableRowClassName({row,status}) {
        if (row.status == 1) {
          return 'warning-row'
        } else if (row.status == 2) {
          return 'success-row'
        }
      },
      // 发起导出订单
      exportOrders() {
          axios({
        url: 'http://logpay.paywz.cn/order/getOrder',
        method: 'get',
        params: {
            orderNumber:this.number,
            orderUid:this.name,
            status:this.value2,
            payType:this.value1,
            uid: this.uid,
            page: this.page.page,
            num: this.page.num,
            start: this.orderDate[0],
            end:this.orderDate[1]
        }
    }).then(res => {
        if (res.data.code == -1) {
            this.$message.error(res.data.msg)
            return false
        }
        import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['商品名称', '订单号', '用户名', '支付渠道', '创建时间', '支付时间', '支付金额', '价格', '服务费', '状态']
        const filterVal = ['orderName', 'orderNumber', 'orderUid', 'payType', 'create_time', 'pay_time', 'pay_price','price', 'fee', 'status']
        this.exportList = res.data.data.order
        const data = this.formatJson(filterVal, this.exportList)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'LogPayOrders',
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
        } else if (v[j] === -1) {
          return '未支付'
        } else if (v[j] === 1) {
          return '支付成功通知失败'
        } else if (v[j] === 2) {
          return '支付成功'
        } else {
          return v[j]
        }
      }))
    },
    // 发起获得订单列表
    getOrder() {
      this.listLoading = true
      axios({
        url: 'http://logpay.paywz.cn/order/getOrder',
        method: 'get',
        params: {
            orderNumber:this.number,
            orderUid:this.name,
            status:this.value2,
            payType:this.value1,
            uid: this.uid,
            page: this.page.page,
            num: this.page.num
        }
    }).then(res => {
        if (res.data.code == -1) {
            this.$message.error(res.data.msg)
            return false
        }
        this.list = res.data.data.select
        this.page.total = res.data.data.order.length
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

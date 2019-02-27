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
      <el-button style="margin-bottom:5px;" @click="selectOrder">查询</el-button>
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
        number:null,
        name:null,
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
      list: null,
      listLoading: true,
      page: {
        page: 1,
        num: 10,
        total: 0
      }
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
    handleNotify(orderNumber) {
      axios.post('http://logpay.paywz.cn/server/api/query',{orderNumber:orderNumber})
           .then(data => {
             this.getOrder()
             })
           .catch(err => this.$message.error(err))
    },
    selectOrder() {
      this.getOrder()
    },
    handleSizeChange(val) {
        this.page.num = val
        this.getOrder()
      },
    nextPage (val) {
      this.page.page = val;
      this.getOrder()
            },
    tableRowClassName({row,status}) {
        if (row.status == 1) {
          return 'warning-row'
        } else if (row.status == 2) {
          return 'success-row'
        }
      },
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

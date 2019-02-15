  <template>
  <div class="app-container">
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row>
      <el-table-column align="center" label="编号">
        <template slot-scope="scope">
          {{ scope.$index }}
        </template>
      </el-table-column>
      <el-table-column label="商品名称" align="center">
        <template slot-scope="scope">
          {{ scope.row.orderName }}
        </template>
      </el-table-column>
      <el-table-column label="订单号" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.orderNumber }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户名" align="center">
        <template slot-scope="scope">
          {{ scope.row.orderUid }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center">
        <template slot-scope="scope">
          {{ scope.row.create_time }}
        </template>
      </el-table-column>
      <el-table-column label="支付时间" align="center">
        <template slot-scope="scope">
          {{ scope.row.pay_time }}
        </template>
      </el-table-column>
      <el-table-column label="支付渠道" align="center">
        <template slot-scope="scope">
          {{ scope.row.payType }}
        </template>
      </el-table-column>
      <el-table-column label="支付金额" align="center">
        <template slot-scope="scope">
          {{ scope.row.pay_price }}
        </template>
      </el-table-column>
      <el-table-column label="服务费" align="center">
        <template slot-scope="scope">
          {{ scope.row.pay_price }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="状态" align="center">
        <template slot-scope="scope">
          <el-tag >{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getOrder } from '@/api/getOrder'
export default {
  data() {
    return {
      list: null,
      listLoading: true
    }
  },
  created() {
    this.getOrder()
  },
  methods: {
    getOrder() {
      this.listLoading = true
      getOrder(this.listQuery).then(response => {
        this.list = response.data
        this.listLoading = false
      })
    }
  }
}
</script>
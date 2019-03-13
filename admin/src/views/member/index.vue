  <template>
  <div class="container">
    <div class="header">
      <el-select style="margin:5px 0;width:49%;" v-model="value1" placeholder="请选择">
      <el-option
        v-for="item in type"
        :key="item.value1"
        :label="item.label"
        :value="item.value1">
      </el-option>
      </el-select>
      <el-input style="width:49%;" v-model="value2" placeholder=""></el-input>
      <el-button style="margin:0 0 5px 5px;" @click="selectMerchant" size="mini">查询</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      >
      <el-table-column prop="uid" label="商户号" align="center">
      </el-table-column>
      <el-table-column prop="email" label="商户邮箱" align="center">
      </el-table-column>
      <el-table-column prop="money" label="商户余额" align="center">
      </el-table-column>
      <el-table-column prop="meal" label="套餐" align="center">
        <template slot-scope="scope">
            <span v-if="scope.row.meal == 'mf'" style="color:#37B328;">免费版</span>
            <span v-else-if="scope.row.meal == 'bz'" style="color:#37B328;">标准版</span>
            <span v-else-if="scope.row.meal == 'gj'" style="color:#37B328;">高级版</span>
        </template>
      </el-table-column>
      <el-table-column prop="mealtime" label="到期时间" align="center">
      </el-table-column>
      <el-table-column prop="date" label="注册时间" align="center">
      </el-table-column>
      <el-table-column prop="address" label="注册地址" align="center">
      </el-table-column>
    </el-table>
    <el-pagination
      style="width:100%;"
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
        type: [
          {
            value1: 'uid',
            label: '商户号'
          }, {
            value1: 'email',
            label: '邮箱'
          },
        ],
        value1: 'uid',
        value2: '',
        // 过滤得到得订单列表
        list: null,
        // 分页
        page: {
          page: 1,
          num: 10,
          total: 0
        },
        listLoading:false
    }
  },
  created() {
    this.getMerchant()
  },
  methods: {
    // 过滤订单列表
    selectMerchant() {
      this.getMerchant()
    },
    // 每一页有多少的订单个数
    handleSizeChange(val) {
        this.page.num = val
        this.getMerchant()
      },
    // 下一页
    nextPage (val) {
      this.page.page = val;
      this.getMerchant()
            },
    // 发起获得订单列表
    getMerchant() {
      this.listLoading = true
      axios({
        url: 'http://logpay.paywz.cn/user/getMerchant',
        method: 'get',
        params: {
            type:this.value1,
            value:this.value2,
            page: this.page.page,
            num: this.page.num,
        }
    }).then(res => {
        if (res.data.code == -1) {
            this.$message.error(res.data.msg)
            return false
        }
        this.list = res.data.data.select
        console.log(this.list)
        this.list.map(v=>{
          v.date = `${v.date.substring(0,10)} ${v.date.substring(11,19)}`
        })
        this.page.total = res.data.data.user.length
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

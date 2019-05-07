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
            <span v-else style="color:#37B328;">{{ scope.row.meal }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="mealtime" label="到期时间" align="center">
      </el-table-column>
      <el-table-column prop="date" label="注册时间" align="center">
      </el-table-column>
      <el-table-column prop="address" label="注册地址" align="center">
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <span style="height:5px;"></span>
          <el-button size="mini" type="success" @click="handleMerchant(scope.row)">统计</el-button>
        </template>
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

    <el-dialog title="编辑商户" :visible.sync="merchantEdit"  :width="dialogWidth" top="100px">
    <el-form :model="merchantForm">
        <el-form-item label="商户号" :label-width="formLabelWidth">
            <el-input v-model="merchantForm.uid" auto-complete="off" placeholder="" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="商户邮箱" :label-width="formLabelWidth">
            <el-input v-model="merchantForm.email" auto-complete="off" placeholder="" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="商户余额" :label-width="formLabelWidth">
            <el-input v-model="merchantForm.money" auto-complete="off" placeholder="" ></el-input>
        </el-form-item>
        <el-form-item label="商户套餐" :label-width="formLabelWidth">
            <template>
              <el-select v-model="merchantMeal" placeholder="请选择">
                <el-option
                  v-for="item in mealOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </template>
        </el-form-item>
        <el-form-item label="到期时间" :label-width="formLabelWidth">
            <el-input v-model="merchantForm.mealtime" auto-complete="off" placeholder="" ></el-input>
        </el-form-item>
        <el-form-item label="备注" :label-width="formLabelWidth">
            <el-input v-model="merchantForm.remark" auto-complete="off" placeholder="请输入该商户的备注" ></el-input>
        </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
        <el-button @click="cancel()">取 消</el-button>
        <el-button type="primary" @click="submitChange()">确 定</el-button>
    </div>
    </el-dialog>

    <el-dialog title="商户统计" :visible.sync="merchantCount" :width="dialogWidth" top="100px">
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
    <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="merchantCount=false">确 定</el-button>
    </div>
    </el-dialog>
</div>
</template>

<script>
import { mapGetters } from 'vuex'
import { get_merchant, change_merchant_meal, get_meal } from '@/api/admin'
import { get_day_money, get_order_number } from '@/api/order'
export default {
  data() {
    return {
        dialogWidth:'92%',
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
        ],
      formLabelWidth:'70px',
      merchantMeal:'',
      mealOptions:'',
      merchantEdit:false,
      merchantCount:false,
      merchantForm:{},
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
        listLoading:false,
        screenWidth: document.body.clientWidth,  //设置的监听屏幕的变化
    }
  },
  computed: {
    ...mapGetters([
      'roles'
    ])
  },
  mounted() {
    this.getMerchant()
    this.getMealOptions()
    this.getScreenWidth()
    // 获取实时监听
    // const that = this
    // window.onresize = () => {
    //     return (() => {
    //         window.screenWidth = document.body.clientWidth
    //         that.screenWidth = window.screenWidth
    //     })()
    // }
  },
  methods: {
    getScreenWidth() {
      if (this.screenWidth < 990) {
        this.dialogWidth = '98%'
      } else {
        this.dialogWidth = '42%'
      }
    },
    async getDayMoney(uid) {
        let params = {
        uid
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
    async getOrderNumber(uid) {
        let params = {
        uid
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
    },
    async getMealOptions() {
      let List = []
      let params = {
            role:this.roles[0]
      }
      let res = await get_meal(params)
      res.data.meal.forEach(v=>{
        if (v.mealName === 'mf') {
          List.push({value:'mf',label:'免费版'})
        }
        else if (v.mealName === 'bz') {
          List.push({value:'bz',label:'标准版'})
        }
        else if (v.mealName === 'gj') {
          List.push({value:'gj',label:'高级版'})
        } else {
          List.push({value:v.mealName,label:v.mealName})
        }
      })
      this.mealOptions = List
    },
    cancel() {
      this.merchantEdit = false
      this.getMerchant()
    },
    handleEdit(row) {
      this.merchantEdit = true
      this.merchantMeal = row.meal
      this.merchantForm = row
    },
    async submitChange() {
        this.merchantEdit = false
        let data = {  _id:this.merchantForm._id,meal:this.merchantMeal,money:this.merchantForm.money,mealtime:this.merchantForm.mealtime,remark:this.merchantForm.remark}
        let res = await change_merchant_meal(data)
        this.$message.success(res.msg)
        this.getMerchant()
    },
    handleMerchant(row) {
      this.merchantCount = true
      this.getDayMoney(row.uid)
      this.getOrderNumber(row.uid)
    },
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
    async getMerchant() {
      this.listLoading = true
      let params = {
            type:this.value1,
            value:this.value2,
            page: this.page.page,
            num: this.page.num,
            role: this.roles[0]
      }
      let res = await get_merchant(params)
      this.list = res.data.select
      this.list.map(v=>{
        v.date = `${v.date.substring(0,10)} ${v.date.substring(11,19)}`
      })
      this.page.total = res.data.user.length
      this.listLoading = false
    }
  }
    // watch: {
    // screenWidth: {
    //   handler(val) {
    //     if(val < 990){
    //     this.dialogWidth = '100%'
    //     }else{
    //     this.dialogWidth = '50%'
    //     }
    // },
    // deep:true
    // }
    // },
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
.el-dialog__body {
  padding: 0 5px;
}
/*media dialog*/
.el-select {
    width: 100%;
}
</style>

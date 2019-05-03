<template>
  <div class="app-container">
    <div class="addMeal">
        <el-button type="success" size="mini" style="margin:1% 0;" @click="handleAdd()">增加套餐</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;">
      <el-table-column label="套餐费率" prop="mealFee" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.mealFee }}</span>
        </template>
      </el-table-column>
      <el-table-column label="套餐名称" prop="mealName" align="center">
        <template slot-scope="scope">
            <span v-if="scope.row.mealName == 'mf'" style="color:#37B328;">免费版</span>
            <span v-else-if="scope.row.mealName == 'bz'" style="color:#37B328;">标准版</span>
            <span v-else-if="scope.row.mealName == 'gj'" style="color:#37B328;">高级版</span>
            <span v-else style="color:#37B328;">{{ scope.row.mealName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="套餐月价格" prop="mealPrice" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.mealPrice }} 元</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <span style="height:5px;"></span>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
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

    <el-dialog title="编辑套餐" :visible.sync="dialogFormVisible" :width="dialogWidth">
    <el-form :model="mealForm">
        <el-form-item label="套餐费率" :label-width="formLabelWidth">
            <el-input v-model="mealForm.mealFee" autocomplete="off" placeholder="例:0.008"></el-input>
        </el-form-item>
        <el-form-item label="套餐名称" :label-width="formLabelWidth">
            <el-input v-model="mealForm.mealName" autocomplete="off" placeholder="例:免费版"></el-input>
        </el-form-item>
        <el-form-item label="套餐月价" :label-width="formLabelWidth">
            <el-input v-model="mealForm.mealPrice" autocomplete="off" placeholder="例:88"></el-input>
        </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
        <el-button @click="cancel()">取 消</el-button>
        <el-button type="primary" v-if="mealForm._id" @click="submitChange()">确 定</el-button>
        <el-button type="primary" v-else @click="submitAdd()">确 定</el-button>
    </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { get_meal, del_meal, add_meal, change_meal } from '@/api/admin'
export default {
  data() {
    return {
      dialogWidth:'92%',
      screenWidth: document.body.clientWidth,  //设置的监听屏幕的变化
      list: null,
      listLoading: true,
      page: {
          total: 0,
          page: 1,
          num: 10,
      },
      dialogFormVisible: false,
      formLabelWidth: '78px',
      mealForm:{
          _id:'',
          mealName:'',
          mealPrice:'',
          mealFee:''
      }
    }
  },
  computed: {
    ...mapGetters([
        'roles'
    ])
  },
  created() {
    this.getMealList()
    this.getScreenWidth()
  },
  methods: {
    getScreenWidth() {
      if (this.screenWidth < 990) {
        this.dialogWidth = '98%'
      } else {
        this.dialogWidth = '42%'
      }
    },
    cancel() {
        this.dialogFormVisible = false
        this.getMealList()
    },
    handleAdd() {
        this.mealForm._id = undefined
        this.mealForm.mealName = ''
        this.mealForm.mealFee = ''
        this.mealForm.mealPrice = ''
        this.dialogFormVisible = true
    },
    async submitAdd() {
        this.dialogFormVisible = false
        let data = this.mealForm
        let res = await add_meal(data)
        this.$message.success(res.msg)
        this.getMealList()
    },
    async submitChange() {
        this.dialogFormVisible = false
        let data = this.mealForm
        let res = await change_meal(data)
        this.$message.success(res.msg)
        this.getMealList()
    },
    // 每一页有多少的订单个数
    handleSizeChange(val) {
        this.page.num = val
        this.getMealList()
      },
    // 下一页
    nextPage (val) {
      this.page.page = val;
      this.getMealList()
            },
    async getMealList() {
      this.listLoading = true
      let params = {
          page: this.page.page,
          num: this.page.num,
          role:this.roles[0]
      }
      let res = await get_meal(params)
      this.list = res.data.select
      this.page.total = res.data.meal.length
      this.listLoading = false
    },
    handleUpdate(row) {
      this.dialogFormVisible = true
      this.mealForm.mealName = row.mealName
      this.mealForm.mealFee = row.mealFee
      this.mealForm.mealPrice = row.mealPrice
      this.mealForm._id = row._id
    },
    handleDelete (row) { // 删除
            let that = this
            that.$confirm('确定删除此套餐?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                let result = await that.delMeal(row._id)
                if (result == '删除成功!') {
                    that.$message({
                        type: 'success',
                        message: result
                    });
                    that.getMealList()
                } else {
                    that.$message({
                        type: 'error',
                        message: result
                    });
                }
                
            }).catch(() => {
                that.$message({
                    type: 'info',
                    message: '已取消删除'
                })
            })
    },
    delMeal (id) {
        return new Promise(async (resolve, reject) => {
            let data = {
                id: id
            }
            let res = await del_meal(data)
            this.$message.success(res.msg)
            this.getMealList()
        })
    }
  }
}
</script>

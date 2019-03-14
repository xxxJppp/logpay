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

    <el-dialog title="编辑套餐" :visible.sync="dialogFormVisible" @before-close="cancel">
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
import axios from 'axios'
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
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
  },
  methods: {
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
    submitAdd() {
        this.dialogFormVisible = false
        axios.post('http://logpay.paywz.cn/user/addMeal', this.mealForm )
           .then(res => {
                if (res.data.code == -1) {
                        this.$message.error(res.data.msg)
                        return false
                    } else {
                        this.$message.success(res.data.msg)
                        this.getMealList()
                }
             })
           .catch(err => this.$message.error(err))
    },
    submitChange() {
        this.dialogFormVisible = false
        axios.post('http://logpay.paywz.cn/user/changeMeal', this.mealForm )
           .then(res => {
             if (res.data.code == -1) {
                        this.$message.error(res.data.msg)
                        return false
                    } else {
                        this.$message.success(res.data.msg)
                        this.getMealList()
                }
             })
           .catch(err => this.$message.error(err))
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
    getMealList() {
      this.listLoading = true
      axios({
        url: 'http://logpay.paywz.cn/user/getMeal',
        method: 'get',
        params: {
            page: this.page.page,
            num: this.page.num,
            role:this.roles[0]
        }
    }).then(res => {
        if (res.data.code == -1) {
            this.$message.error(res.data.msg)
            return false
        }
        this.list = res.data.data.select
        this.page.total = res.data.data.meal.length
        this.listLoading = false
    })
    .catch(err => this.$message.error('系统繁忙'))
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
                return new Promise(async (res, rej) => {
                    axios({
                        url: 'http://logpay.paywz.cn/user/delMeal',
                        method: 'delete',
                        data: {
                            id: id
                        }
                    }).then(res => {
                        if (res.data.code == -1) {
                        this.$message.error(res.data.msg)
                        return false
                            } else {
                                this.$message.success(res.data.msg)
                                this.getMealList()
                        }
                    })
                })
            },
    }
}
</script>

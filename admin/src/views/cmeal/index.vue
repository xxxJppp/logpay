<template>
<div class="wrapper">
<div class="meal">
    <p>套餐</p>
    <el-select v-model="value1" placeholder="请选择">
    <el-option
        v-for="item in Meal"
        :key="item.value1"
        :label="item.label"
        :value="item.value1">
    </el-option>
    </el-select>
</div>
<div class="mealtime">
    <p>时间</p>
    <el-select v-model="value2" placeholder="请选择">
        <el-option
        v-for="item in Mealtime"
        :key="item.value2"
        :label="item.label"
        :value="item.value2">
        </el-option>
    </el-select>
</div>
<div class="meal-time">
    <p>过期时间</p>
    <span style="color:#67C23A;">{{ Time }}</span>
</div>
<div class="price">
    <p>费用</p>
    <p style="color:#67C23A;font-size:15px;">总费用￥{{ all_price }}, 原套餐抵扣￥{{ d_price }}, 补差价￥{{ price }}</p>
</div>
    <el-button type="success" style="margin-top:20px;" v-if="enough" @click="submit">确定</el-button>
    <el-button type="success" style="margin-top:20px;" v-else><a href="http://logpay.paywz.cn/#/user/recharge">余额不足请先充值</a></el-button>
    <el-checkbox v-model="checked" style="margin-bottom:3px;">开启自动套餐续费</el-checkbox>
</div>
</template>
<script>
import axios from 'axios'
import { mapGetters } from 'vuex'
export default {
   data() {
    return {
        checked:true,
        Meal: [{
          value1: 'mf',
          label: '免费版'
        }, {
          value1: 'bz',
          label: '标准版'
        }, {
          value1: 'gj',
          label: '高级版'
        }],
        value1: '',
        Mealtime: [{
          value2: 'bb',
          label: '不变'
        }, {
          value2: 'ygy',
          label: '一个月'
        }, {
          value2: 'sgy',
          label: '三个月(8.5折)'
        }, {
          value2: 'bn',
          label: '半年(8折)'
        },{
            value2:'yn',
            label: '一年(7折)'
        }],
        value2: 'bb',
        time:''
    }
    },
    computed: {
        Time() {
          if (this.meal == this.value1 && this.meal !='mf' ) {
                     if (this.value2 == 'bb') {
                       return this.time
                     }
                     else if (this.value2 == 'ygy') {
                        return this.getTime(this.mealtime ,1)
                     } else if (this.value2 == 'sgy') {
                        return this.getTime(this.mealtime, 3)
                     } else if (mealtime == 'bn') {
                        return this.getTime(this.mealtime, 6)
                     } else if (mealtime == 'yn') {
                        return this.getTime(this.mealtime, 12)
                     }
                } else if (this.meal == 'mf') {
                    let date = new Date()
                    let now = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`
                    if (this.value2 == 'bb') {
                       return this.time
                     }
                    if (this.value2 == 'ygy') {
                        return this.getTime(now,1)
                     } else if (this.value2 == 'sgy') {
                        return this.getTime(now, 3)
                     } else if (this.value2 == 'bn') {
                        return this.getTime(now, 6)
                     } else if (this.value2 == 'yn') {
                        return this.getTime(now, 12)
                     }
                } else if (this.meal == 'bz' && this.value1 == 'gj') {
                    if (this.value2 == 'bb') {
                       return this.time
                     }
                    let date = new Date()
                    let now = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`
                    if (this.value2 == 'ygy') {
                        return this.getTime(now,1)
                     } else if (this.value2 == 'sgy') {
                        return this.getTime(now, 3)
                     } else if (this.value2 == 'bn') {
                        return this.getTime(now, 6)
                     } else if (this.value2 == 'yn') {
                        return this.getTime(now, 12)
                     }
                }
        },
        enough() {
          if (parseFloat(this.money) < parseFloat(this.price)) {
            return false
          } else {
            return true
          }
        },
        ...mapGetters([
          'meal','mealtime','money','uid'
        ]),
        all_price() {
           if(this.value1 == 'mf') {
               return '0.00'
           } else if (this.value1 == 'bz') {
             if (this.value2 == 'bb') {
               return '0.00'
             } else if (this.value2 == 'ygy') {
               return '20.00'
             } else if (this.value2 == 'sgy') {
               return parseFloat(20*0.85*3).toFixed(2,'0')
             } else if (this.value2 == 'bn') {
               return parseFloat(20*0.8*6).toFixed(2,'0')
             } else if (this.value2 == 'yn') {
               return parseFloat(20*0.7*12).toFixed(2,'0')
             }
           } else if (this.value1 == 'gj') {
             if (this.value2 == 'bb') {
               return '0.00'
             } else if (this.value2 == 'ygy') {
               return '50.00'
             } else if (this.value2 == 'sgy') {
               return parseFloat(50*0.85*3).toFixed(2,'0')
             } else if (this.value2 == 'bn') {
               return parseFloat(50*0.8*6).toFixed(2,'0')
             } else if (this.value2 == 'yn') {
               return parseFloat(50*0.7*12).toFixed(2,'0')
             }
           }
        },
        d_price() {
          if (this.meal == 'mf') {
            return '0.00'
          } else if (this.meal == 'bz') {
            if (this.value1 == 'mf') {
              alert('不能降低套餐!')
              this.value1 = 'bz'
              return '0.00'
            }
            if (this.value1 == 'bz') {
              return '0.00'
            }
            let y1 = this.mealtime.substring(0,4)
            let m1 = this.mealtime.substring(5,7)
            let d1 = this.mealtime.substring(8,10)
            let date = new Date()
            let now = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')} ` 
            let y2 = now.substring(0,4)
            let m2 = now.substring(5,7)
            let d2 = now.substring(8,10)
            let y = parseInt(y1)-parseInt(y2)
            let m = parseInt(m1)-parseInt(m2)
            let d = parseInt(d1)-parseInt(d2)
            return parseFloat(y*365*0.5+m*30*0.5+d*0.5).toFixed(2,'0')
          } else if (this.meal == 'gj') {
            if (this.value1 == 'bz' || this.value1 == 'mf') {
              alert('不能降低套餐!')
              this.value1 = 'gj'
              return '0.00'
            }
            if (this.value1 == 'gj') {
              return '0.00'
            }
          }
        },
        price() {
          if(parseFloat(this.all_price-this.d_price) < 0) {
            return '0.00'
          } else {
            return parseFloat(this.all_price-this.d_price).toFixed(2,'0')
          }
        },
    },
    methods: {
      getTime(time, month) {
        let y1 = time.substring(0,4)
        let m1 = parseInt(time.substring(5,7))
        let d1 = parseInt(time.substring(8,10))
        let date = new Date()
        date.setFullYear(y1)
        date.setMonth(m1)
        date.setDate(d1)
        date.setMonth(date.getMonth()+ month -1 )
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`
      },
      submit() {
        if (this.value1 == 'mf' && this.meal == 'mf') {
          location.href = '/#/user/cmeal'
          return
        }
        // bz升级gj过程中防止客户损失
        if (parseFloat(this.all_price-this.d_price) < 0) {
          alert('充值参数有误!')
          return false
        }
        axios.post('/user/cmeal',{ uid:this.uid, meal:this.value1,mealtime:this.value2,cmoney:this.price,renew:this.checked })
             .then()
             .catch(err => console.log(err))
        location.href = '/'
      },
      gettime() {
        if (this.value1 == 'mf') {
          let date = new Date()
          this.time = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')} ` 
        } else {
          this.time = this.mealtime
        }
        }
    },
    mounted() {
      this.value1 = this.meal
      this.gettime()
    },
}
</script>
<style lang="scss" scoped>
.wrapper {
    width: 94%;
    margin:0 auto;
    .meal {
        margin:1% 0;
    }
}
</style>
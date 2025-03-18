<script setup name="home">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import timeFormatter from '@/utils/timeFormatter';
import OAMain from '@/components/OAMain.vue';
import homeHttp from '@/api/homeHttp';
import * as echarts from 'echarts';


let informs = ref([])
let absents = ref([])

onMounted(async () => {
    try {
        informs.value = await homeHttp.getLatestInforms()
        console.log(informs.value)
        absents.value = await homeHttp.getLatestAbsents()
        let rows = await homeHttp.getDepartmentStaffCount()
        console.log(rows)
        let xdatas = []
        let ydatas = []
        for (let row of rows) {
            xdatas.push(row.name)
            ydatas.push(row.staff_count)
        }

        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(document.getElementById('main'));
        // 绘制图表
        myChart.setOption({
            tooltip: {},
            xAxis: {
                data: xdatas
            },
            yAxis: {},
            series: [
                {
                    name: '員工數量',
                    type: 'bar',
                    data: ydatas
                }
            ]
        });
    } catch (detail) {
        ElMessage.error(detail)
    }
})



</script>

<template>
    <OAMain title="首頁">
        <el-card>
            <template #header>
                <h2>部門員工數量</h2>
            </template>
            <div id="main" style="width: 100%;height:300px;"></div>
        </el-card>

        <el-row :gutter="20">
            <el-col :span="12">
                <el-card>
                    <template #header>
                        <h2>最新通知</h2>
                    </template>
                    <el-table :data="informs">
                        <el-table-column label="標題">
                            <template #default="scope">
                                <router-link :to="{ name: 'inform_detail', params: { pk: scope.row.id } }">{{
                                    scope.row.title }}</router-link>
                            </template>
                        </el-table-column>
                        <el-table-column label="發布者" prop="author.realname"></el-table-column>
                        <el-table-column label="發布時間">
                            <template #default="scope">
                                {{ timeFormatter.stringFromDate(scope.row.create_time) }}
                            </template>
                        </el-table-column>
                        <el-table-column label="是否已讀">
                            <template #default="scope">
                                <el-tag v-if="scope.row.reads.length > 0">已讀</el-tag>
                                <el-tag v-else type="danger">未讀</el-tag>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-card>
            </el-col>
            <el-col :span="12">
                <el-card>
                    <template #header>
                        <h2>最新請假</h2>
                    </template>
                    <el-table :data="absents">
                        <el-table-column label="部門" prop="requester.department.name"></el-table-column>
                        <el-table-column label="發起人" prop="requester.realname"></el-table-column>
                        <el-table-column label="起始日期" prop="start_date"></el-table-column>
                        <el-table-column label="結束日期" prop="end_date"></el-table-column>
                        <el-table-column label="發起時間">
                            <template #default="scope">
                                {{ timeFormatter.stringFromDateTime(scope.row.create_time) }}
                            </template>
                        </el-table-column>
                    </el-table>
                </el-card>
            </el-col>
        </el-row>
    </OAMain>
</template>

<style scoped></style>
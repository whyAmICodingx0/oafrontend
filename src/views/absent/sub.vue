<script setup name="myabsent">
import OAPageHeader from '@/components/OAPageHeader.vue'
import absentHttp from '@/api/absentHttp'
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import timeFormatter from '@/utils/timeFormatter';
import OAMain from '@/components/OAMain.vue';
import OAPagination from '@/components/OAPagination.vue';
import OADialog from '@/components/OADialog.vue';

let absents = ref()
let pagination = reactive({
    total: 0,
    page: 1
})
let dialogVisible = ref(false)
let absentForm = reactive({
    status: 2,
    response_content: ""
})
let rules = reactive({
    status: [{ required: true, message: '請選擇處理結果', trigger: 'change' }],
    response_content: [{ required: true, message: '請輸入理由', trigger: 'blur' }]
})
let absentFormRef = ref()
let handleIndex = null

onMounted(async () => {
    try {
        let data = await absentHttp.getSubAbsents()
        pagination.total = data.count
        absents.value = data.results
    } catch (detail) {
        ElMessage.error(detail)
    }
})

const onShowDialog = (index) => {
    absentForm.status = 2
    absentForm.response_content = ""
    dialogVisible.value = true
    handleIndex = index
}

const onSubmitAbsent = () => {
    absentFormRef.value.validate(async (valid, fields) => {
        if(valid){
            try{
                dialogVisible.value = false
                const absent = absents.value[handleIndex]
                const data = await absentHttp.handleSubAbsent(absent.id, absentForm.status, absentForm.response_content)
                absents.value.splice(handleIndex, 1, data)
                ElMessage.success('下屬考勤處理成功')
            }catch(detail){
                ElMessage.error(detail)
            }
        }
    })
}

</script>

<template>
    <OADialog title="處理考勤" v-model="dialogVisible" @submit="onSubmitAbsent">
        <el-form :model="absentForm" :rules="rules" ref="absentFormRef" label-witdth="100px">
            <el-form-item label="結果" prop="status">
                <el-radio-group v-model="absentForm.status">
                    <el-radio :value="2">通過</el-radio>
                    <el-radio :value="3">拒絕</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="理由" prop="response_content">
                <el-input type="textarea" v-model="absentForm.response_content" autocomplete="off" />
            </el-form-item>
        </el-form>
    </OADialog>
    <OAMain title="下屬考勤">
        <el-card>
            <el-table :data="absents" style="width: 100%">
                <el-table-column prop="title" label="標題" />
                <el-table-column label="發起者">
                    <template #default="scope">
                        {{ '[' + scope.row.requester.department.name + ']' + scope.row.requester.realname }}
                    </template>
                </el-table-column>
                <el-table-column prop="absent_type.name" label="類型" />
                <el-table-column prop="request_content" label="原因" />
                <el-table-column label="發起時間">
                    <template #default="scope">
                        {{ timeFormatter.stringFromDateTime(scope.row.create_time) }}
                    </template>
                </el-table-column>
                <el-table-column prop="start_date" label="開始日期" />
                <el-table-column prop="end_date" label="結束日期" />
                <el-table-column prop="responder.realname" label="審批領導" />
                <el-table-column prop="reqponse_content" label="反饋意見" />
                <el-table-column label="審核狀態">
                    <template #default="scope">
                        <el-tag type="info" v-if="scope.row.status == 1">審核中</el-tag>
                        <el-tag type="success" v-else-if="scope.row.status == 2">已通過</el-tag>
                        <el-tag type="danger" v-else>已拒絕</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="處理">
                    <template #default="scope">
                        <el-button v-if="scope.row.status == 1" @click="onShowDialog(scope.$index)" type="primary" icon="EditPen" />
                        <el-button v-else disable type="default">
                            已處理
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <template #footer>
                <!-- <el-pagination background layout="prev, pager, next" :total="pagination.total" :page-size="1"
                    v-model:current-page="pagination.page" /> -->
                <OAPagination v-model="pagination.page" :total="pagination.total"></OAPagination>
            </template>
        </el-card>
    </OAMain>

</template>

<style scoped></style>
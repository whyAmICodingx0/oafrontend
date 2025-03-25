<script setup name="myabsent">
import OAPageHeader from '@/components/OAPageHeader.vue'
import absentHttp from '@/api/absentHttp'
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import timeFormatter from '@/utils/timeFormatter';
import OAMain from '@/components/OAMain.vue';
import OAPagination from '@/components/OAPagination.vue';
import OADialog from '@/components/OADialog.vue';

let formLabelWidth = "100px"
let dialogFormVisible = ref(false)
let absentform = reactive({
    title: '',
    absent_type_id: null,
    date_range: [],
    request_content: "",
})
let absentFormRef = ref()
let rules = reactive({
    title: [
        { required: true, message: '請輸入標題！', trigger: 'blur' }
    ],
    absent_type_id: [
        { required: true, message: '請選擇請假類型！', trigger: 'change' }
    ],
    date_range: [
        { required: true, message: '請選擇請假時間！', trigger: 'blur' }
    ],
    request_content: [
        { required: true, message: '請輸入請假理由！', trigger: 'blur' }
    ]
})
// 個人考勤訊息
let absents = ref([])
let absent_types = ref({})
let responder = reactive({
    email: '',
    realname: ''
})
let pagination = reactive({
    total: 0,
    page: 1
})
let responder_str = computed(() => {
    if (responder.email) {
        return '[' + responder.email + ']' + responder.realname
    } else {
        return "無"
    }
})

watch(() => pagination.page, (newValue, oldValue) => {
    requestAbsents(newValue)
})

const requestAbsents = async (page) => {
    try {
        let absents_data = await absentHttp.getMyAbsents(page)
        let total = absents_data.count;
        pagination.total = total
        let results = absents_data.results;
        absents.value = results
    } catch (detail) {
        ElMessage.error(detail)
    }
}

const onShowDialog = () => {
    absentform.title = ""
    absentform.absent_type_id = null
    absentform.date_range = []
    absentform.request_content = ""
    dialogFormVisible.value = true
}

const onSubmitAbsent = () => {
    absentFormRef.value.validate(async (valid, fields) => {
        if (valid) {
            let data = {
                title: absentform.title,
                absent_type_id: absentform.absent_type_id,
                start_date: absentform.date_range[0],
                end_date: absentform.date_range[1],
                request_content: absentform.request_content,
            }
            try {
                let absent = await absentHttp.applyAbsent(data)
                dialogFormVisible.value = false
                absents.value.unshift(absent)
                ElMessage.success('請假發起成功')
            } catch (detail) {
                ElMessage.error(detail)
            }
        }
    })
}

onMounted(async () => {
    try {
        // 1. 獲取請假類型
        let absent_types_data = await absentHttp.getAbsentTypes()
        absent_types.value = absent_types_data

        // 2. 獲取審批者
        let responder_data = await absentHttp.getResponder()
        Object.assign(responder, responder_data)

        // 3. 獲取個人考勤列表
        requestAbsents(1)
    } catch (detail) {
        ElMessage.error(detail)
    }
})

</script>

<template>
    <OAMain title="個人考勤">
        <el-card style="text-align: right;">
            <el-button type="primary" @click="onShowDialog"><el-icon>
                    <Plus />
                </el-icon>發起考勤</el-button>
        </el-card>
        <el-card>
            <el-table :data="absents" style="width: 100%">
                <el-table-column prop="title" label="標題" />
                <el-table-column prop="absent_type.name" label="類型" />
                <el-table-column prop="request_content" label="原因" />
                <el-table-column label="發起時間">
                    <template #default="scope">
                        {{ timeFormatter.stringFromDateTime(scope.row.create_time) }}
                    </template>
                </el-table-column>
                <el-table-column prop="start_date" label="開始日期" />
                <el-table-column prop="end_date" label="結束日期" />
                <el-table-column label="審批領導">
                    {{ responder_str }}
                </el-table-column>
                <el-table-column prop="response_content" label="反饋意見" />
                <el-table-column label="審核狀態">
                    <template #default="scope">
                        <el-tag type="info" v-if="scope.row.status == 1">審核中</el-tag>
                        <el-tag type="success" v-else-if="scope.row.status == 2">已通過</el-tag>
                        <el-tag type="danger" v-else>已拒絕</el-tag>
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

    <OADialog title="發起請假" v-model="dialogFormVisible" @submit="onSubmitAbsent">
        <el-form :model="absentform" :rules="rules" ref="absentFormRef">
            <el-form-item label="標題" :label-width="formLabelWidth" prop="title">
                <el-input v-model="absentform.title" autocomplete="off" />
            </el-form-item>
            <el-form-item label="請假類型" :label-width="formLabelWidth" prop="absent_type_id">
                <el-select v-model="absentform.absent_type_id" placeholder="請選擇請假類型">
                    <el-option v-for="item in absent_types" :label="item.name" :value="item.id" :key="item.name" />
                </el-select>
            </el-form-item>
            <el-form-item label="請假時間" :label-width="formLabelWidth" prop="date_range">
                <el-date-picker v-model="absentform.date_range" type="daterange" range-separator="到"
                    start-placeholder="起始日期" end-placeholder="結束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
            </el-form-item>
            <el-form-item label="審批領導" :label-width="formLabelWidth">
                <el-input :value="responder_str" readonly disabled autocomplete="off" />
            </el-form-item>
            <el-form-item label="請假理由" :label-width="formLabelWidth" prop="request_content">
                <el-input type="textarea" v-model="absentform.request_content" autocomplete="off" />
            </el-form-item>
        </el-form>
    </OADialog>

</template>

<style scoped></style>
<script setup name="stafflist">
import OAMain from '@/components/OAMain.vue';
import { ref, reactive, onMounted, watch } from 'vue';
import timeFormatter from '@/utils/timeFormatter';
import staffHttp from '@/api/staffHttp';
import { ElMessage } from 'element-plus';
import OADialog from '@/components/OADialog.vue';
import { useAuthStore } from '@/stores/auth';


const authStore = useAuthStore()

let staffs = ref([])
let pagination = reactive({
    page: 1,
    total: 0
})
let page_size = ref(10)
let dialogVisible = ref(false)
let staffForm = reactive({
    status: 1
})
let handleIndex = 0
let departments = ref([])
let filterForm = reactive({
    department_id: null,
    realname: "",
    date_joined: []
})
let tableRef = ref()
const BASE_URL = import.meta.env.VITE_BASE_URL

async function fetchStaffList(page, page_size) {
    try {
        // 獲取員工列表
        let data = await staffHttp.getStaffList(page, page_size, filterForm)
        pagination.total = data.count
        pagination.page = page
        staffs.value = data.results
    } catch (detail) {
        ElMessage.error(detail)
    }
}

onMounted(async () => {
    fetchStaffList(1, page_size.value)

    try {
        let data = await staffHttp.getAllDepartment()
        departments.value = data.results
    } catch (detail) {
        ElMessage.error(detail)
    }
})

watch(() => pagination.page, async function (value) {
    fetchStaffList(value, page_size.value)
})

watch(page_size, async function (value) {
    if (pagination.page == 1) {
        fetchStaffList(1, value)
    } else {
        pagination.page = 1
    }
})

const onEditStaff = (index) => {
    handleIndex = index
    dialogVisible.value = true
    let staff = staffs.value[index]
    staffForm.status = staff.status
}

const onSubmitEditStaff = async () => {
    let staff = staffs.value[handleIndex]
    try {
        let newstaff = await staffHttp.updateStaffStatus(staff.uid, staffForm.status)
        ElMessage.success('員工狀態修改成功')
        dialogVisible.value = false
        staffs.value.splice(handleIndex, 1, newstaff)
    } catch (detail) {
        ElMessage.error(detail)
    }
}

const onSearch = () => {
    fetchStaffList(1, page_size.value)
}

const onDownload = async () => {
    let rows = tableRef.value.getSelectionRows()
    if(!rows || rows.length==0){
        ElMessage.info('請先選擇要導出的員工')
        return ;
    }
    try{
        let response = await staffHttp.downloadStaffs(rows.map(row => row.uid))
        // 借助a標籤，將response數據放到a標籤的href屬性上，然後模擬點擊行為
        // 將返回的二進至數據，創建成一個url對象
        let href = URL.createObjectURL(response.data)
        // 創建a標籤
        const a = document.createElement("a")
        a.href = href
        // 設置a標籤的download屬性，在典籍的時候就會執行下載操作
        a.setAttribute('download', '員工信息.xlsx')
        // 將a標籤添加到網頁連結中
        document.body.appendChild(a)
        // 模擬點擊行為，只要點擊了瀏覽器就會自動下載操作(下載href屬性指定的數據)
        a.click()

        // 只要執行下載了a標籤就沒用了，就可刪了
        document.body.removeChild(a)
        // 移除URL數據
        URL.revokeObjectURL(href)
    }catch(detail){
        ElMessage.error(detail)
    }
}

const onUploadSuccess = () => {
    ElMessage.success('員工上傳成功')
    // 重新獲取第一頁的員工數據
    fetchStaffList(1, page_size.value)
}

const onUploadFail = (error) => {
    const detail = JSON.parse(error.message).detail
    ElMessage.error(detail)
}

</script>

<template>
    <OADialog title="修改員工狀態" v-model="dialogVisible" @submit="onSubmitEditStaff">
        <el-form :model="staffForm" label-witdth="100px">
            <el-form-item label="狀態">
                <el-radio-group v-model="staffForm.status">
                    <el-radio :value="1">啟用</el-radio>
                    <el-radio :value="3">鎖定</el-radio>
                </el-radio-group>
            </el-form-item>
        </el-form>
    </OADialog>
    <OAMain title="員工列表">
        <el-card>
            <el-form :inline="true" class="my-form-inline">
                <el-form-item label="按部門">
                    <el-select v-model="filterForm.department_id">
                        <el-option v-for="department in departments" :label="department.name" :value="department.id"
                            :key="department.name" />
                    </el-select>
                </el-form-item>
                <el-form-item label="按姓名">
                    <el-input v-model="filterForm.realname" />
                </el-form-item>
                <el-form-item label="按入職時間">
                    <el-date-picker v-model="filterForm.date_joined" type="daterange" range-separator="到"
                        start-placeholder="起始日期" end-placeholder="結束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="Search" @click="onSearch"></el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="danger" icon="Download" @click="onDownload">下載</el-button>
                </el-form-item>
                <el-form-item>
                    <el-upload
                        :action="BASE_URL+'/staff/upload'"
                        :headers="{Authorization: 'JWT '+authStore.token}"
                        :on-success="onUploadSuccess"
                        :on-error="onUploadFail"
                        :show-file-list="false"
                        :auto-upload="true"
                        accept=".xlsx, .xls">
                        <el-button type="danger" icon="Upload">上傳</el-button>
                    </el-upload>
                </el-form-item>
            </el-form>
        </el-card>
        <el-card>
            <el-table :data="staffs" ref="tableRef">
                <el-table-column type="selection" width="55" />
                <el-table-column label="序號" width="60">
                    <template #default="scope">
                        {{ scope.$index + 1 }}
                    </template>
                </el-table-column>
                <el-table-column prop="realname" label="姓名" />
                <el-table-column prop="email" label="信箱" />
                <el-table-column label="入職時間">
                    <template #default="scope">
                        {{ timeFormatter.stringFromDate(scope.row.date_joined) }}
                    </template>
                </el-table-column>
                <el-table-column prop="department.name" label="部門" />
                <el-table-column label="狀態">
                    <template #default="scope">
                        <el-tag type="info" v-if="scope.row.status == 1">正常</el-tag>
                        <el-tag type="success" v-else-if="scope.row.status == 2">未啟用</el-tag>
                        <el-tag type="danger" v-else>已鎖定</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <el-button type="primary" icon="Edit" circle @click="onEditStaff(scope.$index)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <template #footer>
                <div style="display: flex; justify-content: space-between;">
                    <el-form-item label="每頁">
                        <el-select v-model="page_size" size="small" style="width: 100px;">
                            <el-option select label="10條/頁" :value="10" />
                            <el-option label="20條/頁" :value="20" />
                        </el-select>
                    </el-form-item>
                    <el-pagination background layout="prev, pager, next" :total="pagination.total"
                        v-model:currentPage="pagination.page" :page-size="page_size" />
                </div>
            </template>
        </el-card>
    </OAMain>
</template>

<style scoped>
.my-form-inline .el-input {
    --el-input-width: 140px;
}

.my-form-inline .el-select {
    --el-select-width: 140px;
}

.el-form--inline .el-form-item {
    margin-right: 20px;
}
</style>
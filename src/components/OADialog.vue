<script setup>
import { ref, defineModel, defineProps, defineEmits } from 'vue';

let dialogVisible = defineModel({required: true})
let props = defineProps({
    title: {
        type: String,
        default: ''
    },
    width: {
        type: String,
        default: '500'
    }
})

// 定義監聽事件
const emits = defineEmits(['cancel', 'submit'])

const onCancel = () => {
    dialogVisible.value = false
    emits('cancel')
}
const onSubmit = () => {
    emits('submit')
}
</script>

<template>
<el-dialog v-model="dialogVisible" :title="props.title" :width="props.width">
        <slot></slot>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="onCancel">取消</el-button>
                <el-button type="primary" @click="onSubmit">
                    提交
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<style scoped>

</style>
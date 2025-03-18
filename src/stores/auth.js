import { ref, computed } from "vue";
import { defineStore } from "pinia";

const USER_KEY = "OA_USER_KEY"
const TOKEN_KEY = "OA_TOKEN_KEY"

export const PermissionChoices = {
    // 所有權限
    All: 0b111,
    // 普通員工權限
    Staff: 0b000,
    // 需要董事會權限
    Boarder: 0b001,
    // Leader權限
    Leader: 0b010,
}

export const useAuthStore = defineStore("auth", () => {
    let _user = ref({})
    let _token = ref("")

    function setUserToken(user, token){
        // 保存到對象上(內存)
        _user.value = user;
        _token.value = token;

        // 用於將資料存儲到瀏覽器的 Local Storage(即使頁面重新整理或關閉瀏覽器，數據仍然會保留。)
        localStorage.setItem(USER_KEY, JSON.stringify(user))
        localStorage.setItem(TOKEN_KEY, token)
    }

    function clearUserToken(){
        _user.value = {}
        _token.value = ""
        localStorage.removeItem(USER_KEY)
        localStorage.removeItem(TOKEN_KEY)
    }

    // 計算屬性
    let user = computed(() => {
        // 如果_user是空對象，那麼就從localStrage裡讀取
        // 在JS中
        // 1. 空集合{}(_user.value): 用if判斷，會返回true。 Object.keys(_user.value).length==0。Object.keys(obj) 會回傳一個陣列
        // 2. 空字符串"": 用if判斷，會返回false
        if(Object.keys(_user.value) == 0){
            let user_str = localStorage.getItem(USER_KEY)
            if(user_str){
                _user.value = JSON.parse(user_str)
            }
        }
        return _user.value
    })
    let token = computed(() => {
        // 如果_user是空對象，那麼就從localStrage裡讀取
        if(!_token.value){
            let token_str = localStorage.getItem(TOKEN_KEY)
            if(token_str){
                _token.value = token_str
            }
        }
        return _token.value
    })

    let is_logined = computed(() => {
        if(Object.keys(user.value).length>0 && token.value){
            return true;
        }
        return false;
    })

    let own_permissions = computed(() => {
        // 0b000
        let _permission = PermissionChoices.Staff
        if(is_logined.value){
            // 判斷是否為董事會成員
            if(user.value.department.name == '董事會'){
                // 0b000 | 0b001 = 0b001
                _permission |= PermissionChoices.Boarder
            }
            if(user.value.department.leader_id == user.value.uid){
                _permission |= PermissionChoices.Leader
            }
        }
        return _permission
    })

    function has_permission(permissions, opt='|'){
        // opt可選值:
        // 1. |: 或運算
        // 2. &: 且運算
        // own_permissions: 0b001 
        // permissions: [0b000, 0b001]
        let results = permissions.map((permission) => (permission & own_permissions.value) == permission)
        // results = [true, false, false, true]
        if(opt == "|"){
            if(results.indexOf(true) >= 0){
                return true
            }else{
                return false
            }
        }else{
            if(results.indexOf(false) >= 0){
                return false
            }else{
                return true
            }
        }
    }


    // 想要讓外面訪問到就必須要返回
	return { setUserToken, user, token, is_logined, clearUserToken, has_permission };
});

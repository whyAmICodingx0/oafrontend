import axios from "axios";
import { useAuthStore } from "@/stores/auth";

class Http {
	constructor() {
		this.instance = axios.create({
			baseURL: import.meta.env.VITE_BASE_URL,
			timeout: 6000,
		});

        this.instance.interceptors.request.use((config) => {
            const authStore = useAuthStore()
            const token = authStore.token
            if(token){
                config.headers.Authorization = 'JWT ' + token
            }
            return config
        })
	}

	post(path, data) {
		// path: /auth/login
		// url: http://127.0.0.1:8000/auth/login
		// return this.instance.post(path, data)
		return new Promise(async (resolve, reject) => {
			// await: 網路請求發送出去後，現成會掛起等待，等網路數據到達後，現成才會前往當前位置開始往後執行
			// 如果在某個函數中使用await，那麼這個函數就必須要定義成async
			// axios底層也是使用promise對象，在響應狀態碼不是200會調用reject
			// 調用reject的結果是外層函數會拋出異常
			try {
				let result = await this.instance.post(path, data);
				// 走到這狀態碼肯定是200
				resolve(result.data);
			} catch (err) {
				try{
					let detail = err.response.data.detail;
					reject(detail);
				}catch{
					reject('服務器錯誤')
				}
			}
		});
	}

	get(path, params) {
		return new Promise(async (resolve, reject) => {
			try{
				let result = await this.instance.get(path, {params})
				resolve(result.data)
			}catch(err){
				let detail = err.response.data.detail;
				reject(detail);
			}
		})
	}

	put(path, data){
		return new Promise(async (resolve, reject) => {
			try {
				let result = await this.instance.put(path, data);
				resolve(result.data);
			} catch (err) {
				let detail = err.response.data.detail;
				reject(detail);
			}
		});
	}

	delete(path){
		return new Promise(async (resolve, reject) => {
			try {
				let result = await this.instance.delete(path);
				resolve(result);
			} catch (err) {
				let detail = err.response.data.detail;
				reject(detail);
			}
		});
	}

	downloadFile(path, params){
		return new Promise(async (resolve, reject) => {
			try{
				let result = await this.instance.get(path, {
					params,
					responseType: "blob"
				})
				resolve(result)
			}catch(err){
				let detail = err.response.data.detail;
				reject(detail);
			}
		})
	}
}

export default new Http();

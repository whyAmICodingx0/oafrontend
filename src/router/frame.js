import frame from "@/views/main/frame.vue";
import myabsent from "@/views/absent/my.vue";
import subabsent from "@/views/absent/sub.vue";
import inform_public from "@/views/inform/public.vue";
import inform_detail from "@/views/inform/detail.vue";
import inform_list from "@/views/inform/list.vue";
import staffadd from "@/views/staff/add.vue";
import stafflist from "@/views/staff/list.vue";
import home from "@/views/home/home.vue";
import absent from "@/views/absent/index.vue";
import inform from "@/views/inform/index.vue";
import staff from "@/views/staff/index.vue";
import weather from "@/views/weather/weather.vue";
import { PermissionChoices } from "@/stores/auth";

const routes = [
	{
		path: "/",
		name: "frame",
		component: frame,
		children: [
			{
				path: "/",
				name: "home",
				component: home,
				meta: {
					icon: "HomeFilled",
					text: "首頁",
					permissions: [PermissionChoices.Staff],
					opt: "|",
				},
			},
			{
				path: "/weather",
				name: "weather",
				component: weather,
				meta: {
					hidden: true,
				},
			},
			{
				path: "/absent",
				name: "absent",
				component: absent,
				meta: {
					icon: "Checked",
					text: "出勤管理",
					permissions: [PermissionChoices.Staff],
					opt: "|",
				},
				children: [
					{
						path: "my",
						name: "myabsent",
						component: myabsent,
						meta: {
							icon: "UserFilled",
							text: "個人出勤",
							permissions: [PermissionChoices.Staff],
							opt: "|",
						},
					},
					{
						path: "sub",
						name: "subabsent",
						component: subabsent,
						meta: {
							icon: "User",
							text: "下屬出勤",
							permissions: [
								PermissionChoices.Boarder,
								PermissionChoices.Leader,
							],
							opt: "|",
						},
					},
				],
			},
			{
				path: "/inform",
				name: "inform",
				component: inform,
				meta: {
					icon: "BellFilled",
					text: "通知管理",
					permissions: [PermissionChoices.Staff],
					opt: "|",
				},
				children: [
					{
						path: "public",
						name: "inform_public",
						component: inform_public,
						meta: {
							icon: "CirclePlusFilled",
							text: "發布通知",
							permissions: [
								PermissionChoices.Boarder,
								PermissionChoices.Leader,
							],
							opt: "|",
						},
					},
					{
						path: "list",
						name: "inform_list",
						component: inform_list,
						meta: {
							icon: "List",
							text: "通知列表",
							permissions: [PermissionChoices.Staff],
							opt: "|",
						},
					},
					{
						path: "detail/:pk",
						name: "inform_detail",
						component: inform_detail,
						meta: {
							hidden: true,
							permissions: [PermissionChoices.Staff],
							opt: "|",
						},
					},
				],
			},
			{
				path: "/staff",
				name: "staff",
				component: staff,
				meta: {
					icon: "Avatar",
					text: "員工管理",
					permissions: [PermissionChoices.Boarder, PermissionChoices.Leader],
					opt: "|",
				},
				children: [
					{
						path: "add",
						name: "staff_add",
						component: staffadd,
						meta: {
							icon: "CirclePlusFilled",
							text: "新增員工",
							permissions: [
								PermissionChoices.Boarder,
								PermissionChoices.Leader,
							],
							opt: "|",
						},
					},
					{
						path: "list",
						name: "staff_list",
						component: stafflist,
						meta: {
							icon: "List",
							text: "員工列表",
							permissions: [
								PermissionChoices.Boarder,
								PermissionChoices.Leader,
							],
							opt: "|",
						},
					},
				],
			},
		],
	},
];

export default routes;

<template>
	<div
		class="fab-note-container"
		:class="[{ dark: theme === 'dark' }]"
		@mousewheel="onMouseWheel"
	>
		<div class="control-banner">
			<div class="control-left-block">
				<fv-button
					:theme="theme"
					:borderRadius="30"
					class="control-btn"
					@click="theme = theme === 'dark' ? 'light' : 'dark'"
					><i
						class="ms-Icon"
						:class="[
							`ms-Icon--${
								theme === 'dark' ? 'QuietHours' : 'Light'
							}`,
						]"
					></i
				></fv-button>
				<fv-button
					:theme="theme"
					:borderRadius="30"
					class="control-btn"
					@click="readonly = readonly == true ? false : true"
					><i
						class="ms-Icon"
						:class="[
							`ms-Icon--${
								readonly === true ? 'Edit' : 'ReadingMode'
							}`,
						]"
					></i
				></fv-button>
				<fv-button
					:theme="theme"
					:borderRadius="30"
					class="control-btn"
					@click="
						expandContent = expandContent == true ? false : true
					"
					><i
						class="ms-Icon"
						:class="[
							`ms-Icon--${
								expandContent === true
									? 'StaplingPortraitBookBinding'
									: 'StaplingLandscapeTwoTop'
							}`,
						]"
					></i
				></fv-button>
				<fv-button
					:theme="theme"
					:borderRadius="30"
					:background="
						editor_show_nav ? 'rgba(140, 148, 228, 1)' : ''
					"
					:foreground="editor_show_nav ? '#fff' : ''"
					class="control-btn"
					@click="editor_show_nav = editor_show_nav ? false : true"
				>
					<i class="ms-Icon ms-Icon--ButtonMenu"></i>
				</fv-button>
				<fv-button
					v-show="contentType !== 'fabulous_notebook'"
					theme="dark"
					:borderRadius="30"
					class="control-btn"
					background="linear-gradient(to right, #800080, #ffc0cb)"
					:title="local('Upgrade to Fabulous Notebook')"
					@click="upgrade"
				>
					<i class="ms-Icon ms-Icon--UpArrowShiftKey"></i>
				</fv-button>
				<fv-button
					v-show="unsave"
					:theme="theme"
					:borderRadius="30"
					class="control-btn"
					background="rgba(0, 204, 153, 1)"
				>
					{{ "" }}
				</fv-button>
			</div>
		</div>
		<power-editor
			:modelValue="fabulousNotebook.content"
			:editable="!readonly"
			:theme="theme"
			:language="language"
			class="power-editor-wrapper"
			:placeholder="local('Write something ...')"
			:editorBackground="
				theme == 'dark'
					? 'rgba(47, 52, 55, 0)'
					: 'rgba(250, 250, 250, 0)'
			"
			:editorOutSideBackground="
				theme == 'dark'
					? 'rgba(47, 52, 55, 0)'
					: 'rgba(250, 250, 250, 0)'
			"
			:toolbarHeight="130"
			:editablePaddingTop="150"
			:readOnlyPaddingTop="80"
			:contentMaxWidth="expandContent ? '99999px' : '900px'"
			:mobileDisplayWidth="0"
			ref="editor"
			:style="{ background: 'transparent', 'font-size': `${fontSize}px` }"
			style="position: relative; width: 100%; height: 100%; flex: 1"
			@save-json="saveContent"
			@change="editorContentChange"
			@content-change="editorSetContentChange"
		>
			<template v-slot:front-content>
				<fv-img
					v-show="fabulousNotebook.banner"
					:src="currentBanner"
					class="fabulous-notebook-banner-img"
					@click.native="$refs.input.click()"
				></fv-img>
				<div
					v-show="!readonly && contentType === 'fabulous_notebook'"
					class="fabulous-notebook-info-block"
				>
					<fv-button
						v-show="!fabulousNotebook.banner"
						:theme="theme"
						icon="Picture"
						background="rgba(255, 255, 255, 0.6)"
						:border-radius="6"
						foreground="rgba(120, 120, 120, 1)"
						style="min-width: 120px; width: 50%; max-width: 300px"
						@click="$refs.input.click()"
						>{{ local("Add Banner") }}</fv-button
					>
					<fv-button
						v-show="fabulousNotebook.banner"
						theme="dark"
						icon="Picture"
						background="rgba(220, 62, 72, 0.9)"
						:border-radius="6"
						style="min-width: 120px; width: 50%; max-width: 300px"
						@click="
							() => {
								fabulousNotebook.banner = '';
								toggleUnsave(true);
							}
						"
						>{{ local("Delete Banner") }}</fv-button
					>
					<input
						v-show="false"
						type="file"
						accept=".jpg,.jpeg,.png,.gif,.bmp,.webp"
						ref="input"
						@change="chooseBanner"
					/>
				</div>
				<div class="fabulous-notebook-title-block">
					<fv-text-box
						v-show="!readonly && contentType == 'fabulous_notebook'"
						:placeholder="local('Input title here ...')"
						v-model="fabulousNotebook.title"
						:theme="theme"
						:font-size="28"
						:font-weight="600"
						:background="`transparent`"
						:border-color="`rgba(217, 204, 237, 0.1)`"
						:focus-border-color="`rgba(217, 204, 237, 0.8)`"
						:border-width="3"
						:border-radius="0"
						underline
						:readonly="readonly != false"
						@keydown="
							toggleUnsave(true);
							titleBlockTab($event);
						"
						style="height: 60px"
						:style="{
							width: '100%',
							'max-width': expandContent ? '99999px' : '900px',
						}"
					></fv-text-box>
					<p
						v-show="readonly && fabulousNotebook.title"
						class="fabulous-notebook-title"
						:class="[{ dark: theme === 'dark' }]"
						:style="{
							width: '100%',
							'max-width': expandContent ? '99999px' : '900px',
						}"
					>
						{{ fabulousNotebook.title }}
					</p>
				</div>
				<editor-nav
					v-show="editor_show_nav"
					:el="() => editor"
					:editorExpandContent="editor_show_nav"
					:theme="theme"
					ref="editor_nav"
				></editor-nav>
			</template>
		</power-editor>
		<div
			class="bottom-control"
			:class="[{ dark: theme == 'dark' }, { close: !show.bottomControl }]"
		>
			<i
				class="ms-Icon trigger"
				:class="[
					`ms-Icon--${
						show.bottomControl
							? 'ChevronRightMed'
							: 'ChevronLeftMed'
					}`,
				]"
				style="flex: 1"
				@click="show.bottomControl ^= true"
			></i>
			<div v-show="show.bottomControl" class="right-block">
				<i
					class="ms-Icon ms-Icon--FontSize"
					style="margin: 0px 5px"
				></i>
				<fv-slider
					v-model="fontSize"
					:theme="theme"
					:mininum="12"
					:maxinum="72"
					color="rgba(145, 145, 235, 1)"
					:background="
						theme === 'dark'
							? 'rgba(20, 20, 20, 0.6)'
							: 'rgba(255, 255, 255, 1)'
					"
					:showLabel="true"
					style="width: 150px; margin-right: 15px"
				>
					<template v-slot="prop">
						<p style="margin: 5px">{{ prop.modelValue }}px</p>
					</template>
				</fv-slider>
			</div>
		</div>
	</div>
</template>

<script setup>
import * as Diff from "diff";
import i18n from "./js/i18n.js";

import { ref, onMounted, computed } from "vue";
import { storeToRefs } from "pinia";
import { useAppConfig } from "./store/appConfig";

import editorNav from "./components/editorNav.vue";

const appConfig = useAppConfig();
appConfig.reviseI18N(i18n);
const local = appConfig.local;
const { language } = storeToRefs(appConfig);

const vscode =
	typeof acquireVsCodeApi !== "undefined" ? acquireVsCodeApi() : null;
const editor = ref(null);
const input = ref(null);
const editor_nav = ref(null);

const theme = ref("light");
const show = ref({
	bottomControl: false,
});
const lock = ref({
	loading: true,
	diff: true,
});
const auto_save = ref(false);
const fontSize = ref(16);
const readonly = ref(false);
const expandContent = ref(false);
const unsave = ref(false);
const toggleUnsave = (status = true) => {
	if (status) {
		if (vscode) {
			let content = getSaveContent(editor.value.editor().getJSON());
			vscode.postMessage({
				type: "updateContent",
				text: content,
			});
		}
	}
	unsave.value = status;
};

const titleBlockTab = (event) => {
	if (event.keyCode === 9) {
		event.preventDefault();
		event.stopPropagation();
		editor.value.editor().commands.focus();
		editor.value.editor().commands.setTextSelection(0);
	}
};
const onMouseWheel = (event) => {
	if (event.ctrlKey) {
		event.preventDefault();
		if (event.deltaY > 0 && fontSize.value > 12) {
			fontSize.value -= 1;
		} else if (fontSize.value < 72) {
			fontSize.value = fontSize.value / 1 + 1;
		}
	}
};

const ShortCutInit = () => {
	window.addEventListener("keydown", shortCutEvent);
};
const shortCutEvent = (event) => {
	let ctrl = event.ctrlKey || event.metaKey;
	if (event.keyCode === 83 && ctrl && !event.shiftKey) {
		event.preventDefault();
		editor.value.save();
	} else if (event.keyCode === 83 && ctrl && event.shiftKey) {
		event.preventDefault();
		// this.saveAs();
	}

	if (event.keyCode === 9) {
		event.preventDefault();
		if (
			editor.value.editor().isActive("bulletList") ||
			editor.value.editor().isActive("orderedList")
		)
			return;
		if (readonly.value) return;
		editor.value.editor().commands.insertContent("    ");
	}
};

const languageInit = (lan) => {
	if (lan === "zh-cn") appConfig.reviseLanguage("cn");
	else appConfig.reviseLanguage("en");
};

const syncTheme = (themeKind) => {
	if (themeKind > 1) {
		theme.value = "dark";
	} else theme.value = "light";
};

const editor_show_nav = ref(true);

const content = ref("");
// const content = `{
//     "fabulous_notebook": true,
//     "title": "techXuexi",
//     "description": null,
//     "banner": null,
//     "content": {
//         "type": "doc",
//         "content": [
//             {
//                 "type": "codeBlock",
//                 "attrs": {
//                     "language": "bash"
//                 },
//                 "content": [
//                     {
//                         "type": "text",
//                         "text": "docker run"
//                     }
//                 ]
//             }
//         ]
//     },
//     "author": [],
//     "createDate": "2022-10-15T07:39:36.036Z",
//     "updateDate": "2025-07-12T13:29:35.663Z"
// }`;

onMounted(() => {
	ShortCutInit();
	window.addEventListener("message", (event) => {
		const message = event.data;
		if (message.type === "loadFbn") {
			content.value = message.text;
			languageInit(message.language);
			refreshContent(content.value);
		} else if (message.type === "themeChange") {
			syncTheme(message.themeKind);
		}
	});
});

const timer = ref({
	autoSave: null,
	diff: null,
});
const timerInit = () => {
	clearInterval(timer.value.autoSave);
	timer.value.autoSave = setInterval(() => {
		if (auto_save.value && unsave.value) {
			editor.value.save();
		}
	}, 3000);
};
const diffContent = () => {
	let nodeDirtyAttrRemove = (obj) => {
		let dirtyAttrs = ["theme", "headerForeground"];
		let arr = obj.content;
		for (let i = 0; i < arr.length; i++) {
			if (arr[i].content && arr[i].content.length > 0)
				arr = arr.concat(arr[i].content);
		}
		arr.forEach((el) => {
			if (el.attrs) {
				dirtyAttrs.forEach((attr) => {
					if (el.attrs[attr]) delete el.attrs[attr];
				});
			}
		});
	};
	clearTimeout(timer.value.diff);
	timer.value.diff = setTimeout(() => {
		if (!lock.value.diff) return;
		lock.value.diff = false;
		let status = false;
		let thisContent = JSON.parse(
			JSON.stringify(editor.value.editor().getJSON())
		);
		let storeContent_ = JSON.parse(JSON.stringify(storeContent.value));
		nodeDirtyAttrRemove(thisContent);
		nodeDirtyAttrRemove(storeContent_);
		let diff = Diff.diffJson(storeContent_, thisContent);
		if (diff.length > 1) status = true;
		else {
			if (diff[0].added || diff[0].removed) status = true;
		}
		toggleUnsave(status);
		lock.value.diff = true;
	}, 300);
};
const editorContentChange = () => {
	timerInit(); // 重新初始化自动保存定时器
	diffContent(); // 比较内容是否有变化
	editor_nav.value.getEditorNavList();
};

const editorSetContentChange = () => {
	// 外部修改绑定内容后, 内部设置完content触发content-change事件
	storeContent.value = editor.value.editor().getJSON();
	editor_nav.value.getEditorNavList();
};

const fabulousNotebook = ref({
	title: "",
	description: null,
	banner: null,
	content: null,
	author: [],
	createDate: null,
	updateDate: null,
});
const storeContent = ref({
	type: "doc",
	content: [],
});
const contentType = ref("fabulous_notebook");

const currentBanner = computed(() => {
	if (!fabulousNotebook.value.banner) return "";
	return fabulousNotebook.value.banner;
});

const chooseBanner = () => {
	if (input.value.files.length === 0) return;
	let file = input.value.files[0];
	let reader = new FileReader();
	reader.onload = (e) => {
		fabulousNotebook.value.banner = e.target.result;
		input.value.value = "";
	};
	reader.readAsDataURL(file);
	toggleUnsave(true);
};

const upgrade = () => {
	contentType.value = "fabulous_notebook";
	fabulousNotebook.value.title = "";
	toggleUnsave(true);
};

const refreshContent = async (fbnMsg) => {
	if (!lock.value.loading) return;
	lock.value.loading = false;
	fabulousNotebook.value.banner = null;

	try {
		let rawJson = JSON.parse(fbnMsg);
		if (rawJson.fabulous_notebook) {
			contentType.value = "fabulous_notebook";
			for (let key in fabulousNotebook.value)
				fabulousNotebook.value[key] = rawJson[key];
		} else {
			contentType.value = "json";
			fabulousNotebook.value.content = rawJson;
		}
		lock.value.loading = true;
	} catch (e) {
		console.log("save", editor.value.save);
		let ext = "md";
		if (ext === "md") {
			contentType.value = "md";
			fabulousNotebook.value.content =
				editor.value.insertMarkdown(fbnMsg);
		} else {
			contentType.value = "html";
			fabulousNotebook.value.content = fbnMsg;
		}
		lock.value.loading = true;
	}
	if (fabulousNotebook.value.content === "") editor.value.focus();
};

const getSaveContent = (json) => {
	let saveContent = null;
	if (contentType.value === "fabulous_notebook") {
		let _fabulous_notebook = JSON.parse(
			JSON.stringify(fabulousNotebook.value)
		);
		for (let key in fabulousNotebook.value) {
			_fabulous_notebook[key] = fabulousNotebook.value[key];
		}
		_fabulous_notebook.content = json;
		_fabulous_notebook.updateDate = new Date();
		_fabulous_notebook.fabulous_notebook = true;
		saveContent = JSON.stringify(_fabulous_notebook);
	} else if (contentType.value == "md") {
		saveContent = editor.value.saveMarkdown();
	} else {
		saveContent = JSON.stringify(json);
	}
	return saveContent;
};

const saveContent = () => {
	let json = editor.value.editor().getJSON();
	let content = getSaveContent(json);
	console.log(content);
	if (vscode) {
		vscode.postMessage({
			type: "saveFbn",
			text: content,
		});
		storeContent.value = json;
		toggleUnsave(false);
	}
};
</script>

<style lang="scss">
body {
	position: fixed;
	left: 0px;
	top: 0px;
	width: 100%;
	height: 100%;
	margin: 0px;
	padding: 0px;
	overflow: hidden;
}

#app {
	position: relative;
	width: 100%;
	height: 100%;

	scrollbar-color: rgba(191, 190, 189, 0.1) rgba(191, 190, 189, 0.1);

	::-webkit-scrollbar {
		width: 10px;
		height: 8px;

		&:hover {
			width: 16px;
		}
	}
	/*定义滚动条轨道
 内阴影+圆角*/
	::-webkit-scrollbar-track {
		border-radius: 10px;
	}
	/*定义滑块
 内阴影+圆角*/
	::-webkit-scrollbar-thumb {
		border-right: rgba(161, 160, 159, 0.2) solid 5px;
		background-color: rgba(191, 190, 189, 0);
		transition: background-color 0.3s;
		cursor: pointer;

		&:hover {
			border-radius: 10px;
			border-color: transparent;
			background-color: rgba(161, 160, 159, 0.25);
		}

		&:active {
			background-color: rgba(161, 160, 159, 0.35);
		}

		&:horizontal {
			border-right: none;
			border-bottom: rgba(161, 160, 159, 0.2) solid 5px;
		}
	}
}

.fab-note-container {
	position: relative;
	width: 100%;
	height: 100%;
	background: white;

	&.dark {
		background: rgba(47, 52, 55, 1);
	}

	.control-banner {
		@include Vcenter;

		position: absolute;
		min-height: 40px;
		height: 40px;
		padding-top: 20px;
		z-index: 9;

		.control-left-block {
			@include Vcenter;

			flex: 1;
			padding-left: 10px;
		}

		.control-right-block {
			@include Vcenter;

			.save-btn {
				margin-right: 15px;
			}

			.control-btn:last-child {
				margin-right: 10px;
			}
		}

		.control-btn {
			width: 30px;
			height: 30px;
			margin: 5px;
		}
	}

	.fabulous-notebook-info-block {
		@include HcenterVcenter;

		position: relative;
		width: 100%;
		height: 50px;
		padding: 0px 5px;
		box-sizing: border-box;
		overflow: hidden;
		z-index: 2;
	}

	.fabulous-notebook-banner-img {
		position: relative;
		width: calc(100% - 30px);
		height: auto;
		margin-left: 15px;
		margin-top: 25px;
		border-radius: 6px;
		transition: all 0.3s;
		z-index: 2;

		&:hover {
			opacity: 0.8;
		}

		&:active {
			opacity: 0.6;
		}
	}

	.fabulous-notebook-title-block {
		@include Hcenter;

		position: relative;
		width: 100%;
		padding: 15px;
		font-size: 24px;
		font-weight: 600;
		box-sizing: border-box;

		&.dark {
			color: whitesmoke;
		}

		.fabulous-notebook-title {
			&.dark {
				color: whitesmoke;
			}
		}
	}

	.power-editor-wrapper {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.bottom-control {
		@include HendVcenter;

		position: absolute;
		right: 0px;
		bottom: 0px;
		width: 100%;
		height: 35px;
		background: rgba(245, 245, 245, 0.6);
		font-size: 12px;
		transition: all 0.3s;
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		z-index: 2;

		&.dark {
			background: rgba(36, 36, 36, 0.6);
			color: whitesmoke;
		}

		&.close {
			width: 25px;
			border-top-left-radius: 3px;
			border-top-right-radius: 3px;
			overflow: hidden;
		}

		* {
			@include Vcenter;
		}

		.trigger {
			height: 100%;
			padding: 5px;
			box-sizing: border-box;

			&:hover {
				background: rgba(200, 200, 200, 0.1);
			}

			&:active {
				background: rgba(200, 200, 200, 0.3);
			}
		}

		.right-block {
			@include Vcenter;
		}
	}

	.ProseMirror {
		* {
			line-height: 2;
		}
	}
}
</style>

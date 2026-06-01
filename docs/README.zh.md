# FabNote

![FabNote Intro](assets/intro.png)

FabNote 是一个基于 VS Code Custom Editor 的 `.fbn` 文件编辑插件，核心编辑体验由 `@creatorsn/powereditor3` 驱动。项目结构上，它本质上是一个 VS Code 扩展宿主加一个 Vue 3 + Vite 的 Webview 前端：当你在 VS Code 中打开 `.fbn` 文件时，扩展会加载 `media/` 下构建好的前端页面，并用 Power Editor 提供可视化编辑能力。

## 文档入口

- 根目录英文说明：[../README.md](../README.md)
- 中文开发与发布说明：[开发与发布.md](开发与发布.md)

## 功能概览

- 支持将 `.fbn` 注册为 `FabNote` 文件类型
- 通过 VS Code Custom Editor 打开 `.fbn`
- Webview 前端基于 Vue 3 + Vite
- 编辑器能力由 `@creatorsn/powereditor3` 提供
- 已配置 `.fbn` 文件图标
- 可通过命令将当前文件切换到 FabNote 预览编辑器

## 项目结构

```text
fabnote/
|- extension.js           VS Code 扩展入口，注册命令与 Custom Editor
|- package.json           扩展清单、命令、语言与发布信息
|- media/                 Webview 构建产物目录，扩展运行时直接读取
|- webview-ui/            Vue 3 + Vite 前端工程
|- utils/file-icons/      .fbn 文件图标资源
|- docs/                  文档与截图
|- test/                  VS Code 扩展测试
```

## 环境要求

- Node.js 18+ 或 20+
- Yarn 1.x
- VS Code 1.102.0 或更高版本

## 安装依赖

根目录和 `webview-ui` 是两个独立的 Node 工程，需要分别安装依赖。

```bash
yarn
cd webview-ui
yarn
```

## 本地开发

### 推荐启动方式：F5 调试扩展

日常开发时，推荐直接用 VS Code 的 `F5` 启动调试，而不是用 `yarn test`。

注意：如果你改过 `webview-ui` 前端代码，必须先执行一次 `yarn build`，把最新产物写入根目录 `media/`，然后再按 `F5`。否则 `Extension Development Host` 里加载的仍然是旧页面。

操作方式：

1. 用 VS Code 打开项目根目录
2. 如果改过前端，先在 `webview-ui/` 执行 `yarn build`
3. 确认最新前端已经构建到 `media/`
4. 按 `F5`
5. 选择 `.vscode/launch.json` 中的 `Run Extension`
6. 等待新的 `Extension Development Host` 窗口打开

补充说明：

- `F5` 用来启动扩展调试，适合日常开发和手动验证
- `yarn test` 用来跑自动化测试，执行完成后本来就会退出

### 1. 构建 Webview 前端

FabNote 运行时读取的是根目录 `media/`，所以前端改动后需要先在 `webview-ui` 里构建一次：

```bash
cd webview-ui
yarn build
```

这条命令会根据 [../webview-ui/vite.config.js](../webview-ui/vite.config.js) 的配置，把产物直接输出到根目录 `media/`。

只有在这一步完成之后再按 `F5`，VS Code 扩展调试窗口里看到的才会是最新前端。

### 2. 启动扩展调试

在 VS Code 中打开项目后，按 `F5`，或者运行 `.vscode/launch.json` 里的 `Run Extension` 配置。VS Code 会启动一个新的 `Extension Development Host` 窗口，并加载当前扩展。

### 3. 验证 `.fbn` 编辑器

在调试窗口里：

1. 新建或打开一个 `.fbn` 文件
2. 如果没有自动进入自定义编辑器，可以执行命令 `Preview FabNote`
3. 扩展会调用 `vscode.openWith`，使用 `fbnPreview.customEditor` 打开该文件

如果文件内容为空，扩展会加载一份内置示例数据作为初始内容。

## 常用命令

### 根目录

```bash
yarn lint
yarn test
```

- `yarn lint`：检查扩展侧代码
- `yarn test`：运行 VS Code 扩展测试

### `webview-ui/`

```bash
yarn dev
yarn build
yarn preview
```

- `yarn dev`：单独启动 Vite 前端开发服务，适合只调前端界面
- `yarn build`：构建并覆盖根目录 `media/`
- `yarn preview`：预览构建结果

## 打包 VSIX

仓库里目前没有把打包命令写进 `package.json`，通常使用 `vsce`：

```bash
npx @vscode/vsce package
```

执行后会在根目录生成类似 `fabnote-0.0.3.vsix` 的安装包。

安装本地包可以用：

```bash
code --install-extension fabnote-0.0.3.vsix
```

## 发布到 VS Code Marketplace

如果你已经准备好了 Publisher 和 Personal Access Token，通常发布命令是：

```bash
npx @vscode/vsce publish
```

常见发布前检查：

1. 先更新 `package.json` 中的 `version`
2. 重新构建前端：`cd webview-ui && yarn build`
3. 根目录执行 `yarn lint`
4. 可选执行 `yarn test`
5. 再执行 `npx @vscode/vsce package` 或 `npx @vscode/vsce publish`

如果需要先登录 publisher：

```bash
npx @vscode/vsce login CreatorSN
```

## 工作原理

- 扩展入口在 [../extension.js](../extension.js)
- 扩展通过 `registerCustomEditorProvider` 注册 `fbnPreview.customEditor`
- 打开文件时，扩展读取文件内容并发送给 Webview
- Webview 编辑完成后，通过消息把内容回传给扩展
- 扩展再把内容保存回 `.fbn` 文件

## 当前仓库状态说明

- `media/` 目录属于构建产物，不建议手工修改
- 仓库当前已有一个打包产物 `fabnote-0.0.3.vsix`
- [../webview-ui/README.md](../webview-ui/README.md) 仍是前端模板 README，后续可按需清理

## License

[../LICENSE](../LICENSE)

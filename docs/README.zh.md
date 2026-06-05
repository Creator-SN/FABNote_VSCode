# FabNote

![FabNote Intro](assets/intro.png)

FabNote 是一个基于 VS Code Custom Editor 的 `.fbn` 文件编辑扩展，核心编辑体验由 `@creatorsn/powereditor3` 提供。项目结构上，它本质上由两部分组成：

- VS Code 扩展宿主
- Vue 3 + Vite 的 Webview 前端

当你在 VS Code 中打开 `.fbn` 文件时，扩展会加载根目录 `media/` 下已经构建好的前端资源，并在编辑器区域渲染可视化编辑界面。

## 文档入口

- 英文主文档：[../README.md](../README.md)
- 中文开发与发布说明：[开发与发布.md](开发与发布.md)

## 功能概览

- 将 `.fbn` 注册为 `FabNote` 文件类型
- 通过 VS Code Custom Editor 打开 `.fbn`
- Webview 前端基于 Vue 3 + Vite
- 编辑器能力由 `@creatorsn/powereditor3` 提供
- 提供 `.fbn` 文件图标
- 提供 `Preview FabNote` 命令，用当前自定义编辑器打开文件

## 项目结构

```text
fabnote/
|- extension.js           VS Code 扩展入口
|- package.json           扩展清单与发布元信息
|- scripts/               打包与版本处理脚本
|- media/                 Webview 构建产物目录
|- webview-ui/            Vue 3 + Vite 前端工程
|- utils/file-icons/      .fbn 文件图标资源
|- docs/                  项目文档与截图
|- test/                  VS Code 扩展测试
```

## 环境要求

- Node.js 18+ 或 20+
- Yarn 1.x
- VS Code 1.102.0+

## 安装依赖

根目录和 `webview-ui/` 是两个独立的 Node 工程，需要分别安装：

```bash
yarn
cd webview-ui
yarn
```

## 本地开发

### 推荐流程

日常开发时，推荐直接在 VS Code 中按 `F5` 调试扩展，而不是优先执行 `yarn test`。

注意：如果你修改了 `webview-ui/` 下的前端代码，必须先运行一次 `yarn build`，把最新前端资源输出到根目录 `media/`，然后再按 `F5`。否则 `Extension Development Host` 里加载的还是旧页面。

操作步骤：

1. 用 VS Code 打开仓库根目录
2. 如果前端有改动，先执行 `cd webview-ui && yarn build`
3. 按 `F5`
4. 选择 `.vscode/launch.json` 中的 `Run Extension`
5. 等待新的 `Extension Development Host` 窗口打开

### 构建 Webview 前端

FabNote 运行时读取的是根目录 `media/`，因此前端改动后需要先构建：

```bash
cd webview-ui
yarn build
```

这条命令会根据 [../webview-ui/vite.config.js](../webview-ui/vite.config.js) 的配置，把构建产物直接输出到根目录 `media/`。

### 验证 `.fbn` 编辑器

在 `Extension Development Host` 里：

1. 打开或创建一个 `.fbn` 文件
2. 如果没有自动进入自定义编辑器，执行命令 `Preview FabNote`
3. 检查编辑、保存和预览是否正常

如果文件内容为空，扩展会加载内置示例内容作为初始数据。

## 常用命令

### 根目录

```bash
yarn lint
yarn test
npm run package:vsix
```

- `yarn lint`：检查扩展侧代码
- `yarn test`：运行 VS Code 扩展测试
- `npm run package:vsix`：自动更新版本号并打包 VSIX

### `webview-ui/`

```bash
yarn dev
yarn build
yarn preview
```

- `yarn dev`：启动独立的 Vite 开发服务
- `yarn build`：构建并覆盖根目录 `media/`
- `yarn preview`：预览生产构建结果

## 打包 VSIX

仓库现在已经提供了一键脚本，用于自动更新根目录 `package.json` 的扩展版本号，然后执行 `vsce package`。

默认用法：

```bash
npm run package:vsix
```

默认会把当前版本按 `patch` 递增一次，然后执行：

```bash
npx @vscode/vsce package
```

如果你想指定明确版本号：

```bash
npm run package:vsix -- 0.0.7
```

如果你想直接调用脚本：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\package-extension.ps1 -Bump minor
powershell -ExecutionPolicy Bypass -File .\scripts\package-extension.ps1 -Version 0.1.0
```

如果只想验证版本更新逻辑，而不真正生成 `.vsix`：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\package-extension.ps1 -Version 0.0.7 -SkipPackage
```

生成的文件通常类似：

```text
fabnote-0.0.7.vsix
```

安装本地包：

```bash
code --install-extension fabnote-0.0.7.vsix
```

更完整的中文发布说明见：[开发与发布.md](开发与发布.md)

## 发布到 VS Code Marketplace

如果你的 Publisher 和 PAT 已经配置好：

```bash
npx @vscode/vsce publish
```

如果需要先登录：

```bash
npx @vscode/vsce login CreatorSN
```

## 工作原理

- 入口文件是 [../extension.js](../extension.js)
- 扩展通过 `registerCustomEditorProvider` 注册 `fbnPreview.customEditor`
- 打开文件时，扩展读取内容并发送给 Webview
- Webview 编辑后再通过消息把内容回传给扩展
- 扩展将内容保存回 `.fbn` 文件

## 备注

- `media/` 是构建产物，不建议手工修改
- [../webview-ui/README.md](../webview-ui/README.md) 仍是前端模板 README，后续可以按需清理

## License

[../LICENSE](../LICENSE)

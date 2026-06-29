# 初升高规划工具正式版

这是一个可部署到公网的网站版本，包含：

- 学生信息填写
- 家长规划图下载
- 销售沟通建议图下载
- 销售登录
- 咨询记录保存
- 后台记录列表
- 跟进状态修改
- CSV 记录导出

## 本地运行

```bash
npm start
```

打开：

```text
http://127.0.0.1:4173/index.html
```

主讲外呼看板独立页面：

```text
http://127.0.0.1:4173/teacher-call-panel
```

本地默认测试账号：

```text
销售：sales / sales123
管理员：admin / admin123
```

## 正式上线前必须修改

正式上线时不要使用默认密码。可以参考 `.env.example` 配置：

```text
ADMIN_USERNAME=admin
ADMIN_PASSWORD=你的管理员强密码
ADMIN_NAME=管理员
SALES_USERS=[{"username":"sales01","password":"销售强密码1","name":"张老师"},{"username":"sales02","password":"销售强密码2","name":"李老师"}]
DATA_DIR=/data
RECORDS_FILE=/data/records.json
NODE_ENV=production
```

系统会默认补齐 `sales01` 到 `sales05` 五个销售账号。默认密码优先使用 `SALES_PASSWORD`；如果没有配置 `SALES_PASSWORD`，会沿用 `SALES_USERS` 里第一个销售账号的密码。若 `SALES_USERS` 中已经配置了同名账号，以 `SALES_USERS` 为准。

## 推荐部署方式

推荐使用 Render、Railway、Fly.io 或任意 Node.js 云服务器。

如果使用 Render：

1. 把本项目上传到 GitHub。
2. 在 Render 新建 Web Service。
3. 选择这个仓库。
4. Start Command 使用 `npm start`。
5. 添加环境变量：
   - `NODE_ENV=production`
   - `ADMIN_USERNAME=admin`
   - `ADMIN_PASSWORD=你的强密码`
   - `ADMIN_NAME=管理员`
   - `SALES_USERS=[{"username":"sales01","password":"pass01","name":"张老师"}]`
   - `DATA_DIR=/data`
   - `RECORDS_FILE=/data/records.json`
6. 添加持久化磁盘，挂载路径 `/data`。

部署成功后，Render 会给你一个公网网址，别人电脑和手机都可以打开。

## 后台权限

- 管理员账号可以查看所有销售保存的记录。
- 销售账号只能查看自己保存的记录。
- 记录可以修改跟进状态。
- 管理员和销售都可以导出自己有权限看到的记录。

## 数据位置

默认本地数据保存在：

```text
data/records.json
```

线上建议使用持久化磁盘，并配置：

```text
DATA_DIR=/data
RECORDS_FILE=/data/records.json
```

## 后续更新内容

后续如果要更新报告话术、地区规则、销售话术、页面样式，只需要改对应前端文件。已经保存的咨询记录不会受影响。

- 主站入口：`index.html`
- 主讲外呼看板：`主讲外呼看板.html`
- 主讲外呼看板样式：`teacher-panel.css`
- 主讲外呼看板逻辑：`teacher-panel.js`

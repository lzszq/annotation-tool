# 标注工具操作文档

支持本地标注，无需使用youtube

基于 [annotation-tool](https://github.com/coin-dataset/annotation-tool)

## 文件结构

```
.
├── input 标注所需文件（可参考示例文件进行自定义）
├──── label.txt (tagId,tag)
├──── video.txt (urlId,url)
├──── instruction-*.txt (URLID,URL,TagID,Tag,Start,End,Time,State)
├── lib 源码
└── annotation_tool.html  软件入口
```

## 使用环境

使用 make_file.py 将 url 写入文件中

本地使用，将本地对应文件路径写入 video.txt 中(注意，应使用相对路径)

推荐使用 docker-compose 部署一个 nginx 容器，方遍访问服务器远程数据(good choice)

```docker-compose up -d```

或者使用 python 自带的 http.server (bad choice)

```python3 -m http.server```

## 操作

### 一、准备标注文件

> 1、video.txt

```
urlId,url
自定义且唯一,*.mp4
```

> 2、label.txt

```
tagId,tag
自定义且唯一,标签名
```


### 二、导入标注文件

![](./images/upload.png)

> 1、打开 `annotation_tool.html`

> 2、依次点击 `导入视频文件`、`导入标签文件`上传 对应的`video.txt` ，`label.txt`文件

> 3、点击 `导入` 导入文件（若文件格式错误，将会报错，上传失败）

### 三、开始标注

#### 1）状态列表

| 视频ID | 文件名 | 标注次数     | 操作 |
| ------- | --------- | -------- | --------- |
| urldId  | url       | 标注次数 | 操作按钮  |

> 1、 未标注

点击 `标注` 打开标注页面

点击 `删除` 删除该视频

> 2、 已标注

点击 `检查` 打开标注页面，进行检查

点击 `删除` 删除该视频

> 3、 检查

点击 `取消` 取消 检查 状态，视频恢复 `已标注` 状态

> 4、 删除

点击 `还原` 取消 `删除` 状态，若 `标注次数=0` 视频恢复 `未标注` 状态，若 `time>0` 视频恢复 `已标注` 状态

#### 2）标注页面


##### 视频标注

> 操作按钮

1、`save` 按钮

可保存当前标注信息

2、`delete` 按钮

删除当前视频

> 标注方法

1、鼠标点击标注条，选中 `开始时间` 与 `结束时间`（对应视频进度条），或通过键盘，按压 c 进行划分，按压空格继续播放，方向键左右进行前进和后退，方向键上下加减速

3、选择并点击 `标签` 部分的标签

4、删除已标注信息：选中已标注的某段标注条 或 标注 部分的对应信息，点击 `清除` 按钮，进行删除

5、结果展示：

    1) 当鼠标放在标注条已标注的某段上时，将展示其选中的标签
    2) 标注结果统一展示在 `标注` 部分

### 四、导出标注文件

点击 `下载` 可导出文件（导出文件可作为导入文件进行标注检查）

### 五、导入未标注完的历史文件

参考 [Video Labeling](https://github.com/425776024/VideoLabeling)

导入历史文件
---
title: 'Linux 压缩与解压命令'
date: 2018-12-03 21:31:57
tags:
  - Linux压缩命令
categories:
  - Linux
copyright: true
---

Linux 里的“压缩包”通常由两步组成：先用 `tar` 把多个文件**打包**，再用 `gzip`、`bzip2` 或 `xz` **压缩**；`zip`、`7z`、`rar` 则把打包和压缩合成了一条命令。

本文整理日常最常用的压缩/解压命令、格式对照表和常见坑，命令均在 GNU/Linux 下测试。

<!--more-->

## 1. 先分清：打包与压缩

- `tar`：只打包，不压缩；加上 `-z`/`-j`/`-J` 后会调用对应的压缩器，常见后缀 `.tar`、`.tar.gz`、`.tar.xz`。
- `gzip` / `bzip2` / `xz`：压缩单个文件，通常配合 tar 使用，后缀 `.gz`、`.bz2`、`.xz`。
- `zip`：打包 + 压缩，跨平台常用，后缀 `.zip`。
- `7z`：压缩率高，支持多种格式，后缀 `.7z`。
- `rar`：商业格式，Linux 需额外安装，后缀 `.rar`。

> 已经压缩过的图片、音频、视频（jpg/png/mp3/mp4）再用 gzip 压缩，体积通常不会明显变小。

## 2. tar：最常用的打包工具

### 2.1 五个互斥操作

```bash
tar -cf archive.tar dir/    # -c 创建归档
tar -xf archive.tar         # -x 解开归档
tar -tf archive.tar         # -t 查看内容，不解压
tar -rf archive.tar file    # -r 向未压缩的 tar 包追加文件
tar -uf archive.tar file    # -u 更新包内已有文件
```

`-c`、`-x`、`-t`、`-r`、`-u` 一次只能用其中一个。

### 2.2 常用选项

```bash
-z    # 用 gzip 压缩/解压（.tar.gz / .tgz）
-j    # 用 bzip2 压缩/解压（.tar.bz2）
-J    # 用 xz 压缩/解压（.tar.xz）
-v    # 显示处理过程
-f    # 指定归档文件名，后面必须紧跟文件名
-C    # 指定工作目录（创建或解压时切换目录）
-p    # 解压时保留权限
--exclude=PATTERN   # 排除匹配的文件
```

组合写法：

```bash
tar -czvf project.tar.gz project/       # 创建 gzip 压缩包
tar -xzvf project.tar.gz                # 解压 gzip 压缩包
tar -tzvf project.tar.gz                # 查看 gzip 压缩包内容
```

> `-f` 后面一定接归档文件名，所以通常把它放在选项最后：`tar -czf backup.tar.gz dir/`。写成 `tar -czf dir/ backup.tar.gz` 会把目录当成包名。

### 2.3 常用示例

```bash
# 打包并压缩整个目录
tar -czf project-2026-11-13.tar.gz project/

# 排除 .git、node_modules、缓存目录
tar -czf project.tar.gz \
  --exclude='project/.git' \
  --exclude='project/node_modules' \
  --exclude='project/.cache' \
  project/

# 解压到指定目录（目录需已存在）
sudo mkdir -p /opt/app
sudo tar -xzf project.tar.gz -C /opt/app

# 只查看包内文件，不解压
tar -tzf project.tar.gz | less

# 只解压其中一个文件
tar -xzf project.tar.gz project/config/app.conf

# 去掉最外层目录再解压
tar -xzf project.tar.gz --strip-components=1 -C /opt/app

# 解压前先测试归档是否完整
tar -tzf project.tar.gz > /dev/null && echo "archive OK"
```

GNU tar 解压时通常能自动识别压缩格式，`tar -xf archive.tar.gz` 也能用；但创建时仍需显式写 `-z`/`-j`/`-J`。

### 2.4 关于绝对路径

```bash
tar -czf etc-backup.tar.gz /etc   # 会提示 Removing leading '/'，包内是 etc/...
```

建议先 `cd` 到目标目录的父目录，或用 `-C`：

```bash
tar -czf etc-backup.tar.gz -C / etc
```

这样包内路径是 `etc/...`，解压时不会覆盖系统的 `/etc`，除非你明确用 `-C /`。

## 3. 单文件压缩：gzip、bzip2、xz

### 3.1 gzip

```bash
gzip access.log              # 生成 access.log.gz，并删除原文件
gzip -k access.log           # 保留原文件
gzip -9 access.log           # 最高压缩级别（1 最快，9 最小）
gzip -d access.log.gz        # 解压，等价于 gunzip access.log.gz
gzip -l access.log.gz        # 查看压缩前后大小
gzip -t access.log.gz        # 测试压缩包完整性
zcat access.log.gz           # 不解压直接查看内容
```

### 3.2 bzip2

```bash
bzip2 data.txt               # 生成 data.txt.bz2
bzip2 -k data.txt            # 保留原文件
bzip2 -9 -k data.txt         # 最高压缩级别
bzip2 -d data.txt.bz2        # 解压，等价于 bunzip2
bzcat data.txt.bz2           # 直接查看内容
```

### 3.3 xz

```bash
xz data.txt                  # 生成 data.txt.xz
xz -k data.txt               # 保留原文件
xz -9 -T0 data.txt           # 最高级别，使用全部 CPU 核心
xz -d data.txt.xz            # 解压，等价于 unxz
xzcat data.txt.xz            # 直接查看内容
```

压缩率通常是 `xz > bzip2 > gzip`，速度则相反。日常备份用 `gzip` 最省事，追求体积用 `xz`。

## 4. zip / unzip：和 Windows 交换文件

```bash
# 递归压缩目录
zip -r project.zip project/

# 压缩多个文件
zip docs.zip a.txt b.txt

# 排除文件
zip -r project.zip project/ -x 'project/.git/*' 'project/node_modules/*'

# 最高压缩级别
zip -9 -r project.zip project/

# 列出内容
unzip -l project.zip

# 测试完整性
unzip -t project.zip

# 解压到指定目录
unzip project.zip -d /tmp/project

# 覆盖已有文件 / 从不覆盖
unzip -o project.zip
unzip -n project.zip

# 加密（会交互式输入密码）
zip -e -r secret.zip secret/
```

> Windows 上创建的 zip 若中文文件名乱码，可尝试 `unzip -O GBK file.zip`；如果当前 `unzip` 不支持 `-O`，用 `7z x file.zip` 或 `bsdtar -xf file.zip` 解压。

## 5. 7z 与 rar（可选）

```bash
# 7z：压缩率通常优于 zip
7z a backup.7z project/
7z a -mx=9 backup.7z project/       # 最高压缩级别
7z x backup.7z -o/tmp/backup        # 解压到指定目录，-o 后不要加空格
7z l backup.7z                      # 查看内容
7z t backup.7z                      # 测试完整性

# rar：需要安装 rar / unrar
rar a backup.rar project/
unrar x backup.rar                  # 保留目录结构
unrar e backup.rar                  # 所有文件解压到当前目录
unrar l backup.rar                  # 查看内容
```

安装命令（Debian/Ubuntu）：

```bash
sudo apt install p7zip-full unzip zip
# rar 为非自由软件，需要从官方源或 multiverse 仓库安装
```

## 6. 格式对照表

> 手机屏幕较窄时，表格可以左右滑动查看。

| 格式 | 压缩 | 解压 | 查看内容 |
| --- | --- | --- | --- |
| `.tar` | `tar -cvf a.tar dir/` | `tar -xvf a.tar` | `tar -tvf a.tar` |
| `.tar.gz` / `.tgz` | `tar -czvf a.tar.gz dir/` | `tar -xzvf a.tar.gz` | `tar -tzvf a.tar.gz` |
| `.tar.bz2` / `.tbz2` | `tar -cjvf a.tar.bz2 dir/` | `tar -xjvf a.tar.bz2` | `tar -tjvf a.tar.bz2` |
| `.tar.xz` / `.txz` | `tar -cJvf a.tar.xz dir/` | `tar -xJvf a.tar.xz` | `tar -tJvf a.tar.xz` |
| `.gz` | `gzip file` | `gzip -d file.gz` | `zcat file.gz` |
| `.bz2` | `bzip2 file` | `bzip2 -d file.bz2` | `bzcat file.bz2` |
| `.xz` | `xz file` | `xz -d file.xz` | `xzcat file.xz` |
| `.zip` | `zip -r a.zip dir/` | `unzip a.zip` | `unzip -l a.zip` |
| `.7z` | `7z a a.7z dir/` | `7z x a.7z` | `7z l a.7z` |
| `.rar` | `rar a a.rar dir/` | `unrar x a.rar` | `unrar l a.rar` |

## 7. 常见坑

1. **`-f` 的位置**：`tar -czf backup.tar.gz dir/` 正确；`tar -czf dir/ backup.tar.gz` 会把 `dir/` 当成归档名。
2. **复制网页命令时把 `-` 变成了 `–`**：中文网页里常见 en dash，终端会报错，重新手打一次即可。
3. **`gzip` 默认删除原文件**：需要保留就加 `-k`，或先备份。
4. **压缩已压缩文件**：对 jpg、mp4、zip 等再压缩收益很低，直接 `tar` 打包即可。
5. **解压前先看内容**：`tar -tzf` / `unzip -l` / `7z l` 可以避免解压出一堆不需要的文件；陌生压缩包不要直接用 root 解压。
6. **中文文件名乱码**：zip 在 Windows 与 Linux 间传递时最常见，优先用 `7z`，或尝试 `unzip -O GBK`。
7. **`-r` / `-u` 只适用于未压缩的 `.tar`**：对 `.tar.gz` 追加文件，需要先解压再重新压缩。
8. **磁盘空间**：压缩和解压都需要额外空间，操作大文件前先 `df -h` 看一眼。
9. **权限与属主**：解压系统备份时用 `tar -p` 保留权限；解压到系统目录时确认 `-C` 指向正确位置。

## 8. 一页速查

```bash
# 打包压缩
tar -czf backup.tar.gz dir/
# 解压
tar -xzf backup.tar.gz
# 查看
tar -tzf backup.tar.gz
# 解压到指定目录
tar -xzf backup.tar.gz -C /target
# zip 压缩目录
zip -r backup.zip dir/
# zip 解压
unzip backup.zip -d /target
# 测试压缩包
gzip -t backup.tar.gz
```

> 记住一句话：**tar 负责打包，gzip/bzip2/xz 负责压缩，zip/7z 一条命令全包**。

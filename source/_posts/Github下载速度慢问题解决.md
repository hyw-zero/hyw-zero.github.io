---
title: Github下载速度慢问题解决
date: 2019-04-05 18:45:15
tags: github
copyright: true
---


对于码农来说github毫不陌生，由于经常在github克隆代码，国内clone代码慢的要死，常常下载终止，对此苦不堪言。今天在网上找到一个解决办法，亲测有效。废话不说直接就是干。

###  1.找到Hosts文件

哔哔一句什么是hosts文件


> 在互联网协议中，host表示能够同其他机器互相访问的本地计算机。一台本地机有唯一标志代码，同网络掩码一起组成IP地址，如果通过点到点协议通过ISP访问互联网，那么在连接期间将会拥有唯一的IP地址，这段时间内，你的主机就是一个host。
在这种情况下，host表示一个网络节点。host是根据TCP/IP for Windows 的标准来工作的，它的作用是包含IP地址和Host name(主机名)的映射关系，是一个映射IP地址和Host name(主机名)的规定，规定要求每段只能包括一个映射关系，IP地址要放在每段的最前面，空格后再写上映射的Host name主机名　。对于这段的映射说明用“#”分割后用文字说明。

windows系统下一般位于

> C:\Windows\System32\drivers\etc

如图所示

![](./github1.png)

### 2.查询Github的两个ip地址

	github.com
	
	github.global.ssl.fastly.net

使用网站**ipaddress**进行查询。

如下图

![](./github3.png)

1.查询github.com的IP地址

![](./github4.png)

2.查询github.global.ssl.fastly.net的IP地址

![](./github5.png)

### 3.打开hosts文件

用我丑陋的notepad++打开进行修改，分别将上述ip添加进去。

如图

![](./github2.png)

### 4.刷新DNS缓存

执行cmd命令，如下图

![](./github6.png)

输入以下命令

> ipconfig /flushdns


如图
![](./github.png)

现在再来试一下 git clone 命令，比以前快多了。









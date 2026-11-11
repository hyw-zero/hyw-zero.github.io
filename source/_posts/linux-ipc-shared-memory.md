---
title: 'Linux c/c++ 进程通信(共享内存)'
date: 2019-05-01 15:26:46
tags:
  - 进程通信
categories:
  - Linux
copyright: true
---

## 1.进程通信

进程通信一般分为以下6类

<!--more-->

1. <strong>共享内存（shared memory）：</strong>多个进程可以访问同一块内存空间。
2. <strong>套接字（socket）：</strong>可用于不同计算机之间的进程间通信。
3. <strong>信号量（semaphore）：</strong>用于进程之间对共享资源进行加锁。
4. <strong>信号（signal）：</strong>信号用于通知其它进程有某种事件发生。
5. <strong>消息队列（message）：</strong>进程可以向队列中添加消息，其它的进程则可以读取队列中的消息。
6. <strong>管道（pipe）：</strong>包括无名管道，命名管道，无名管道可用于具有父进程和子进程之间的通信。命名管道克服了管道没有名字的限制，因此，除具有管道所具有的功能外，它还允许无亲缘关系进程间的通信。

## 2.共享内存

 <strong>共享内存（Shared Memory）：</strong>允许多个进程访问同一个内存空间，是在多个进程之间共享和传递数据最高效的方式。操作系统将不同进程之间共享内存安排为同一段物理内存，进程可以将共享内存连接到它们自己的地址空间中，如果某个进程修改了共享内存中的数据，其它的进程读到的数据也将会改变。

> 弊端：共享内存没提供同步机制，通常需要与信号量搭配使用。

## 3.共享内存api函数

在Linux操作系统中，提供了一组函数用于操作共享内存。但是需要包含以下库函数

```c
#include <sys/ipc.h>
#include <sys/shm.h>
```

### 1.shmget函数：创建共享内存
<strong>用于获取或者创建共享内存</strong>

```c
int shmget(key_t key, size_t size, int shmflg);

/*
* 1. key_t key 参数key是共享内存的键值，是一个无符号整数，是共享内存在系统中的编号，不 *    同共享内存的编号不能相同，这一点由程序员保证。key最好使用16进制。

* 2. size_t size 参数size是待创建的共享内存的大小，以字节为单位。
*
* 3. shmflg 是共享内存的访问权限，与文件的权限一样，0666|IPC_CREAT 表示全部用户对它可	读写，如果共享内存不存在，就创建一个共享内存。
*/
```

### 2.shmat函数：挂接共享内存

<strong>用于把共享内存连接到当前进程的地址空间</strong>

```c
void *shmat(int shm_id, const void *shm_addr, int shmflg);
/*
* 1. shm_id是由shmget函数返回的共享内存标识。
*
* 2. shm_addr指定共享内存连接到当前进程中的地址位置，通常为空，表示让系统来选择共享内存 *    的地址。
*
* 3. shm_flg是一组标志位，通常为0。调用成功时返回一个指向共享内存第一个字节的指针，如果 *    调用失败返回-1.
*/
```

### 3.shmdt函数：去关联共享内存

<strong>用于将共享内存从当前进程中分离，相当于shmat函数的反操作。</strong>

```c
int shmdt(const void *shmaddr);

/*
* 1. shmaddr是shmat函数返回的地址。
* 调用成功时返回0，失败时返回-1.
*/
```

### 4.shmctl函数：销毁共享内存

<strong>用于删除共享内存</strong>

```c
int shmctl(int shm_id, int command, struct shmid_ds *buf);
/*
* 1. shm_id是shmget函数返回的共享内存标识符。
* 2. command填IPC_RMID。。
* 3. buf填0。
*
*  shmctl是控制共享内存的函数，其功能不只是删除共享内容，但其它的功能没什么用。
*/
```

## 4.共享内存使用Demo

### 1.serve.c

```c
/*
* author:hyw
*/
#include <stdio.h>
#include <sys/ipc.h>
#include <sys/shm.h>
#include <errno.h>
#include <unistd.h>
#include <string.h>

#define SHM_SERIAL_NUM 0x2020
#define SHM_SIZE       2048
void free_shm_from_driver(void * share_memory,int shm_id)
{
    if(-1 == shmdt(share_memory)){
        printf("shmdt(share_memory) fail! error= %d",errno);
    }
    if(-1 == shmctl(shm_id,IPC_RMID,0)){
        printf("shmdt(share_memory) fail! error= %d",errno);
    }
}
int main()
{
    int i=0;
    int shm_id = shmget((key_t)SHM_SERIAL_NUM,SHM_SIZE,0660|IPC_CREAT);
    if(shm_id == -1){
        printf("Share memory create　fail! errno=%d",errno);
        return -1;
    }
    char* p_str=shmat(shm_id,NULL,0);
    if((void *)-1 == p_str){
        printf("shmat(shm_id) fail! errno=%d",errno);
    }
    while(i<25){
        snprintf(p_str,500,"This is in serve process pid= %d,i=%d\n",getpid(),++i);         //write to share memory
        printf("%s\n",p_str);
        sleep(2);
    }
    //free_shm_from_driver(p_str,shm_id);
    return 0;
}

```

### 2.client.c

```c
/*
* author:hyw
*/
#include <stdio.h>
#include <sys/ipc.h>
#include <sys/shm.h>
#include <errno.h>
#include <string.h>
#include <unistd.h>

#define SHM_SERIAL_NUM 0x2020
#define SHM_SIZE       2048

void free_shm_from_driver(void * share_memory,int shm_id)
{
    if(-1 == shmdt(share_memory)){
        printf("shmdt(share_memory) fail! error= %d\n",errno);
    }
    if(-1 == shmctl(shm_id,IPC_RMID,0)){
        printf("shmdt(share_memory) fail! error= %d\n",errno);
    }
}

int main()
{
    int i=0;
    int shm_id = shmget((key_t)SHM_SERIAL_NUM,SHM_SIZE,0660|IPC_CREAT);
    if(shm_id == -1){
        printf("Share memory create　fail! errno=%d",errno);
        return -1;
    }
    char* p_str=shmat(shm_id,NULL,0);
    if((void *)-1 == p_str){
        printf("shmat(shm_id) fail! errno=%d",errno);
    }
    while(i<100){
        printf("%s\n",p_str); //read from share memory
        printf("%s%d\n","This is in client process pid=",getpid());
        sleep(1);
        ++i;
    }
    return 0;
}
```

## 5.附录

linux 下查看共享内存命令 ipcs -m

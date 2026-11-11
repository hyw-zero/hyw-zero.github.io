---
title: '剑指offer算法练习'
date: 2020-10-04 21:02:30
tags:
  - C++
categories:
  - 剑指offer
copyright: true
---

## 1.丑数
### 1.1 题目描述
把只包含质因子2、3和5的数称作丑数（Ugly Number）。 <!-- more --> 例如6、8都是丑数，但14不是，因为它包含质因子7。 习惯上我们把1当做是第一个丑数。求按从小到大的顺序的第N个丑数。

### 1.2 题目翻译
按顺序添加丑数
### 1.3 解题思路
丑数能够分解成
$$
2^x*3^y*5^z,
$$
所以只需要把得到的丑数不断地乘以2、3、5之后并放入他们应该放置的位置即可，
而此题的难点就在于如何有序的放在合适的位置。
1乘以 （2、3、5）=2、3、5；
2乘以（2、3、5）=4、6、10；
3乘以（2、3、5）=6,9,15；
5乘以（2、3、5）=10、15、25；
从这里我们可以看到如果不加策略地添加丑数是会有重复并且无序，
而在2x， 3y， 5z中，如果x=y=z那么最小的数一定是乘以2的，但关键是有可能存在x》y》z的情况，所以我们要维持三个指针来记录当前乘以2、乘以3、乘以5的最小值，然后当其被选为新的最小值后，要把相应的指针+1；因为这个指针会逐渐遍历整个数组，因此最终数组中的每一个值都会被乘以2、乘以3、乘以5，也就是实现了我们最开始的想法，只不过不是同时成乘以2、3、5，而是在需要的时候乘以2、3、5.
### 1.4 C++ 代码实现
```c++
class Solution {
public:
	int GetUglyNumber_Solution(int index) {
		if (index < 7)return index;
		int p2 = 0, p3 = 0, p5 = 0;//初始化三个指向三个潜在成为最小丑数的位置
		int* ret = new int[index];
		ret[0] = 1;
		int temp;
		for (int i = 1; i < index; ++i) {
			temp = min(ret[p2] * 2, ret[p3] * 3);
			ret[i] = min(temp, ret[p5] * 5);
			if (ret[i] == ret[p2] * 2)p2++;//为了防止重复需要三个if都能够走到
			if (ret[i] == ret[p3] * 3)p3++;//为了防止重复需要三个if都能够走到
			if (ret[i] == ret[p5] * 5)p5++;//为了防止重复需要三个if都能够走到
		}
		return ret[index - 1];
	}
};
```
## 2.左移旋转字符串
### 2.1 题目描述
用两个栈来实现一个队列，完成队列的Push和Pop操作。 队列中的元素为int类型。
### 2.2 题目翻译
栈：先进后出     队列：先进先出
### 2.3 解题思路
一个栈进行入队操作，一个进行出队操作。
### 2.4 C++ 代码实现
```c++
class Solution
{
public:
    void push(int node) {
        this->stack1.push(node);
    }

    int pop() {
        int ret ;
        if(this->stack2.empty()){
            while(!this->stack1.empty()){
                this->stack2.push(this->stack1.top());
                this->stack1.pop();
            }
        }
        ret = this->stack2.top();
        this->stack2.pop();
        return ret;
    }
private:
    stack<int> stack1;
    stack<int> stack2;
};
```
## 3.两个链表的第一个公共结点
### 3.1 题目描述
输入两个链表，找出它们的第一个公共结点。（注意因为传入数据是链表，所以错误测试数据的提示是用其他方式显示的，保证传入数据是正确的）
### 3.2 解题思路
给定两个单链表`A，B`，假设一定含有公共结点，返回第一个公共结点的指针。
但A，B公共节点前的长度不一定相等。
需要使得AB长度一致，双指针加 AB相加链表
### 3.3 C++ 代码实现
```c++
/*
struct ListNode {
	int val;
	struct ListNode *next;
	ListNode(int x) :
			val(x), next(NULL) {
	}
};*/
class Solution {
public:
    ListNode* FindFirstCommonNode( ListNode* pHead1, ListNode* pHead2) {
      ListNode* p1=pHead1;
      ListNode* p2=pHead2;
        while(p1 != p2){
           p1=p1?p1->next:pHead2;
           p2=p2?p2->next:pHead1;
        }
        return p1;
    }
};
```
```c++

class Solution {
public:
    int GetNumberOfK(vector<int> nums ,int target) {
        return upper_bound(nums.begin(), nums.end(), target) - lower_bound(nums.begin(), nums.end(), target);
    }
};
```
## 4.二叉树的镜像
### 4.1 题目描述
操作给定的二叉树，将其变换为源二叉树的镜像。
### 4.2 输入描述:
```sh
二叉树的镜像定义：源二叉树 
    	    8
    	   /  \
    	  6   10
    	 / \  / \
    	5  7 9 11
    	镜像二叉树
    	    8
    	   /  \
    	  10   6
    	 / \  / \
    	11 9 7  5
```
### 4.3 题目翻译
二叉树左右节点翻转
二叉树一般用递归处理
翻转也可以用栈进行处理，先进后出然后就进行了翻转

### 4.4 解题思路
二叉树递归实现左右子树交换
### 4.5 C++ 代码实现
```c++
/*
struct TreeNode {
	int val;
	struct TreeNode *left;
	struct TreeNode *right;
	TreeNode(int x) :
			val(x), left(NULL), right(NULL) {
	}
};*/
class Solution {
public:
    void Mirror(TreeNode *pRoot) {
        if(nullptr == pRoot )return;
        if(nullptr == pRoot->left && nullptr == pRoot->right)return;//注释掉也行
        TreeNode * temp= pRoot->left;//节点交换
        pRoot->left=pRoot->right;
        pRoot->right=temp;
        if(pRoot->left){
            Mirror(pRoot->left);
        }
        if(pRoot->right){
            Mirror(pRoot->right);
        }
    }
};
```
## 5.二维数组中的查找
### 5.1 题目描述
在一个二维数组中（每个一维数组的长度相同），每一行都按照从左到右递增的顺序排序，每一列都按照从上到下递增的顺序排序。请完成一个函数，输入这样的一个二维数组和一个整数，判断数组中是否含有该整数。
### 5.2 题目翻译
每一行都按照从左到右递增的顺序排序，每一列都按照从上到下递增的顺序排序。
即，每一行最后一个数为该行最大。每一列第一个数为该行最小。
### 5.3 解题思路
<strong>思路一</strong>
​	遍历二维数组，进行查找。时间复杂度为O(n^2) （leetcode无法通过）
<strong>思路二</strong>
​	右上角比较法。
​	target > 右上角   行加1.继续比较
​	target< 右上角  列减1，继续比较
​	target = 该值 return1；

### 5.4 C++ 代码实现


```c++
class Solution {
public:
    bool Find(int target, vector<vector<int> > array) {
        if(array.empty())return 0;
        int x= array[0].size(); //列
        int y= array.size();    //行
        for(int i=0;i<y;i++){
            for(int j=x-1;j>=0;j--){
                if(target>array[i][j]){
                    break;
                }else if(target == array[i][j]){
                    return 1;
                }else{
                    continue;
                }
            }
        }
        return 0;
    }
};
```
## 6.左移旋转字符串

### 6.1 题目描述

输入一个链表，按链表从尾到头的顺序返回一个ArrayList；

### 6.2 题目翻译
取链表元素，并生成翻转数组。

### 6.3 解题思路

思路一

1.递归链表，直到链表next == NULL；插入val;

思路二

1.建立一个栈，遍历链表压栈

2.遍历栈，进行出栈。栈元素插入数组。


### 6.4 C++ 代码实现


```c++
/**
*  struct ListNode {
*        int val;
*        struct ListNode *next;
*        ListNode(int x) :
*              val(x), next(NULL) {
*        }
*  };
*/
class Solution {
public:
    vector<int> printListFromTailToHead(ListNode* head) {
        vector<int>arr;
        if(NULL == head )return arr;
        stack<int>stk;
        ListNode * p = head;
        while(NULL != p){
            stk.push(p->val);
            p=p->next;
        }
        while(!stk.empty()){
            arr.push_back(stk.top());
            stk.pop();
        }
        return arr;
        
    }
};
```
<strong>递归</strong>
```c++
/**
*  struct ListNode {
*        int val;
*        struct ListNode *next;
*        ListNode(int x) :
*              val(x), next(NULL) {
*        }
*  };
*/
class Solution {
public:
    vector<int> arr;//全局变量
    vector<int> printListFromTailToHead(ListNode* head) {
        ListNode * p = NULL;
        p=head;
        if(NULL != p){
            if(NULL != p->next){
                printListFromTailToHead(p->next);
            }
            arr.push_back(p->val);
        }
        return arr;
    }
};
```
## 7.包含min函数的栈
### 7.1 题目描述
定义栈的数据结构，请在该类型中实现一个能够得到栈中所含最小元素的min函数（时间复杂度应为O（1））。
<strong>题目翻译</strong>
栈加个求最小值的功能
### 7.2 解题思路
两个栈，一个放数据，一个放当前最小值。
### 7.3 C++ 代码实现
```c++
class Solution {
public:
    void push(int value) {
        stk.push(value);
        if(stkm.empty()){
            stkm.push(value);
        }else{
            if(value < stkm.top()){
                stkm.push(value);
            }else{
                stkm.push(stkm.top());
            }
        }
    }
    void pop() {
        stk.pop();
        stkm.pop();
    }
    int top() {
        return stk.top();
    }
    int min() {
        return stkm.top();
        
    }
private:
    stack<int> stk;
    stack<int> stkm;
};
```
## 8.斐波那契数列

### 8.1 题目描述

大家都知道斐波那契数列，现在要求输入一个整数n，请你输出斐波那契数列的第n项（从0开始，第0项为0，第1项是1）。

### 8.2 题目翻译

f(n)=f(n-1)+f(n-2)

f(1)=1;

f(0)=0

### 8.3 解题思路

一，递归调用  O(2^n)  会超时

二，动态规划  用数组模拟 时间复杂度O(n)  不会超时


### 8.4 C++ 代码实现


```c++
class Solution {
public:
    
    int Fibonacci(int n) { //递归思路
        if(n<=1){
            return n;
        }else{
            return Fibonacci(n-1)+Fibonacci(n-2);
        }
    }
    int Fibonacci(int n)//数组模拟
    {
        int* arr = new int[n];
        arr[0]=1;arr[1]=1;
        for(int i =2;i<n;i++){
            arr[i]=arr[i-1]+arr[i-2];
        }
        return arr[n-1];
    }
};
```

## 9.跳台阶

### 9.1 题目描述
一只青蛙一次可以跳上1级台阶，也可以跳上2级。求该青蛙跳上一个n级的台阶总共有多少种跳法（先后次序不同算不同的结果）。
### 9.2 题目翻译
斐波拉契数列：斐波那契数列：0，1，1，2，3，5，8，13，21，
f(n)=f(n-1)+f(n-2)   
此题  f(1)=1,f(2)=2

### 9.3 解题思路
因为青蛙每次只能跳两级，或者一级。青蛙在n级台阶时，一定是从n-1 或者 n-2 上来的。在1级台阶只有一种，二级台阶有两种。3级台阶时，可能是从2级台阶上来的，或者从一级台阶上来的，为f(3)=f(2)+f(1);
### 9.4 C++ 代码实现
```c++
class Solution {
public:
    int jumpFloor(int number) {
        if(number == 1 || number == 0)return 1;
        return jumpFloor(number-1)+jumpFloor(number-2);
    }
};
```
## 10.变态跳台阶

### 10.1 题目描述

一只青蛙一次可以跳上1级台阶，也可以跳上2级……它也可以跳上n级。求该青蛙跳上一个n级的台阶总共有多少种跳法。

### 10.2 题目翻译

第n级为

f(n)=f(n-1)+f(n-2)....f(1)+1

f(1)=1;

### 10.3 解题思路

f(n)=f(n-1)+f(n-2)....f(1)+1

.

.

f(3)=f(2)+f(1)+1

f(2)=f(1)+1

f(1)=1;


### 10.4 C++ 代码实现


```c++
class Solution {
public:
    int jumpFloorII(int n) {
       int res =0;
       if(n<=1)return 1;
        while(n>1){
            res +=jumpFloorII(n-1);
            n--;
        }
        return res+1;
    }
};
```
## 11.合并两个排序链表

### 11.1 题目描述

输入两个单调递增的链表，输出两个链表合成后的链表，当然我们需要合成后的链表满足单调不减规则。

### 11.2 题目翻译
两个链表继续按照从小到大归并排序

### 11.3 解题思路

归并排序的链表形式


### 11.4 C++ 代码实现


```c++
/*
struct ListNode {
	int val;
	struct ListNode *next;
	ListNode(int x) :
			val(x), next(NULL) {
	}
};*/
class Solution {
public:
    ListNode* Merge(ListNode* pHead1, ListNode* pHead2)
    {
        if(NULL == pHead1)return pHead2;
        if(NULL == pHead2)return pHead1;
        ListNode * head = nullptr;
         if(pHead1->val <= pHead2->val){
            head=pHead1;
            pHead1=pHead1->next;
        }else{
            head=pHead2;
            pHead2=pHead2->next;
        }
        ListNode * temp = head;
        while(NULL != pHead1 && NULL != pHead2 ){
            if(pHead1->val <= pHead2->val){
                temp->next=pHead1;
                pHead1=pHead1->next;
            }else{
                temp->next=pHead2;
                pHead2=pHead2->next;
            }
            temp=temp->next;
        }
        temp->next = (NULL == pHead1)?pHead2:pHead1;
        return head;
    }
};
```
## 12.和为S的两个数字

### 12.1 题目描述

输入一个递增排序的数组和一个数字S，在数组中查找两个数，使得他们的和正好是S，如果有多对数字的和等于S，输出两个数的乘积最小的。

### 12.2 输出描述:

```
对应每个测试案例，输出两个数，小的先输出。
```


### 12.3 C++ 代码实现


```c++
class Solution {
public:
    vector<int> FindNumbersWithSum(vector<int> array,int sum) {
        if(array.empty())return array;
        int temp,flag=0;
        vector<int> target;
        for(int i =0;i<array.size()-1;i++){
            temp = sum-array[i];
            for(int j=i+1;j<array.size();j++){
                if(temp == array[j]){
                    target.push_back(array[i]);
                    target.push_back(array[j]);
                    //return target;
                    flag =1;
                    break;
                }
            }
            if(flag == 1)
            {
                break;
            }
        }
        return target;
    }
};
```



## 13.和为S的连续正数序列

### 13.1 题目描述

小明很喜欢数学,有一天他在做数学作业时,要求计算出9~16的和,他马上就写出了正确答案是100。但是他并不满足于此,他在想究竟有多少种连续的正数序列的和为100(至少包括两个数)。没多久,他就得到另一组连续正数和为100的序列:18,19,20,21,22。现在把问题交给你,你能不能也很快的找出所有和为S的连续正数序列? Good Luck!

### 13.2 输出描述:


输出所有和为S的连续正数序列。序列内按照从小至大的顺序，序列间按照开始数字从小到大的顺序


### 13.3 解题思路

双指针移动，
当总和小于等于sum，大指针继续+
否则小指针+


### 13.4 C++ 代码实现


```c++
class Solution {
public:
    vector<vector<int> > FindContinuousSequence(int sum) {
        vector<vector<int>> target;
        int start=1,end =2;
        int temp_sum =0;
        while(start<end){
            temp_sum = (end-start+1)*(start+end)/2;
            if(temp_sum<sum)end++;
            if(temp_sum==sum){   
                vector<int>temp;
                for(int i=start;i<=end;i++){
                    temp.push_back(i);
                }
                target.push_back(temp);
                start++;
            }
            if(temp_sum>sum)start++;
            
        }
        return target;
    }
};
```

## 14.把字符串转成整数

### 14.1 题目描述

将一个字符串转换成一个整数，要求不能使用字符串转换整数的库函数。 数值为0或者字符串不是一个合法的数值则返回0

 <strong>输入描述:</strong>

```
输入一个字符串,包括数字字母符号,可以为空
```

 <strong>输出描述:</strong>

```
如果是合法的数值表达则返回该数字，否则返回0
```

示例1

 <strong>输入</strong>

```
+2147483647
1a33
```

 <strong>输出</strong>

```
2147483647
0
```
### 14.2 解题思路

1.判断输入字符串长度，为0则，return 0；

2.去除字符串 符号前字符， while(str[i] ==' ')i++;

3.判断是否有 +-号；

4.判断 数字是否 在0-9范围内

5.计算数字字符串转化为整数 number = number-str[i] -'0';

### 14.3 C++ 代码实现


```c++

class Solution {
public:
    int StrToInt(string str) {
        int i=0;
        int sign =1;
        long long number =0;
        if(str.length() < 1)return 0;
        while(str[i] ==' ')i++;
        if(str[i] == '-'){
            i++;
            sign = -1;
        }else if(str[i] == '+'){
            i++;
        }
        while(str[i] != '\0'){
            if(str[i] >= '0' && str[i]<= '9')
            {
               number = number*10+str[i]-'0';
               i++;
            }else{
                return 0;
            }
             
        }
        number *= sign;
        return number;
    }
};
```


## 15.数组中出现超过一半的数字

### 15.1 题目描述

请实现一个函数用来找出字符流中第一个只出现一次的字符。例如，当从字符流中只读出前两个字符"go"时，第一个只出现一次的字符是"g"。当从该字符流中读出前六个字符“google"时，第一个只出现一次的字符是"l"。

### 15.2 输出描述:

```
如果当前字符流没有存在出现一次的字符，返回##字符。
```

### 15.3 题目翻译

计算第一个未重复的字符，

### 15.4 解题思路

用 map 进行匹配，vector进行遍历，。因map会自动排序，则不能单独使用map

map排序是按key值排序

unordered_map:排序 最后插入在最前面，先进后出。


### 15.5 C++ 代码实现


```c++
class Solution
{
public:
  //Insert one char from stringstream
    void Insert(char ch)
    {
        if(0 == mp[ch])temp.push_back(ch);
        mp[ch]++;
    }
  //return the first appearence once char in current stringstream
    char FirstAppearingOnce()
    {
       for(auto val:temp){
           if(1==mp[val]){
               return val;
           }
       }
        return '#';
    }
private:
     map<char,int> mp;
    vector<char> temp;
};
```
## 16.左移旋转字符串

### 16.1 题目描述

汇编语言中有一种移位指令叫做循环左移（ROL），现在有个简单的任务，就是用字符串模拟这个指令的运算结果。对于一个给定的字符序列S，请你把其循环左移K位后的序列输出。例如，字符序列S=”abcXYZdef”,要求输出循环左移3位后的结果，即“XYZdefabc”。是不是很简单？OK，搞定它

### 16.2 题目翻译
环形字符串按位左移，

### 16.3 解题思路

1.截取字符串 左移的前几位

2.字符串左移

3.字符串添加


### 16.4 C++ 代码实现


```c++
class Solution {
public:
    string LeftRotateString(string str, int n) {
        int i;
        int start =0;
        string temp = str.substr(0,n); //字符串截取前n个
        for(i=n;i<str.size();i++){     //字符串左移
            str[start++]=str[i];  
        }
         for(i=0;i<n;i++){             //字符串添加
             str[start++]=temp[i];   
         }  
        return str;
        
    }
};
```



## 17.平衡二叉树

### 17.1 题目描述

输入一棵二叉树，判断该二叉树是否是平衡二叉树。

在这里，我们只需要考虑其平衡性，不需要考虑其是不是排序二叉树

### 17.2 解题思路

1.二叉树任意一节点左子节点的深度与左子节点的深度差小于等于1，为平衡二叉树

2.遍历数的深度，并判断任意子节点左右深度之差


### 17.3 C++ 代码实现


```c++
class Solution {
public:
    int depth(TreeNode* pRoot) //数的深度
    {
        if(pRoot == NULL)return 0;
        int left = depth(pRoot->left);
        if(left == -1)return -1;
        int right = depth(pRoot->right);
        if(right == -1)return -1;
        if(abs(right-left)>1)return -1;
        return 1+(left>right?left:right);
    }
    
    bool IsBalanced_Solution(TreeNode* pRoot) {
       return depth(pRoot) != -1;
    }
};
```



```c++
class Solution {
public:
    struct ret{
         bool judge;
         int value;
    };
    void maxdepth(TreeNode* pRoot,ret& root)
    {
        ret left,right;
        if(pRoot == NULL) {
           root.value=0;
           root.judge = true; 
        }
        left.value = IsBalanced_Solution(pRoot->left);
        right.value = IsBalanced_Solution(pRoot->right);
        root.value =  1+(left.value>right.value?left.value:right.value);
        root.judge = root.judge && right.judge && left.judge && (abs(left.value - right.value)>1?0:1);
    }
    bool IsBalanced_Solution(TreeNode* pRoot) {
       ret result;
       maxdepth(pRoot,result);
       return result.judge;
    }
};
```

## 18.循环链表的入口节点

### 18.1 题目描述

给一个链表，若其中包含环，请找出该链表的环的入口结点，否则，输出null。

### 18.2 题目翻译

一个尾部带环的链表，找到链表的结点

### 18.3 解题思路

使用 STL中的 set；

set的特点：set里面每个元素只存有一个key值，set容器自动对以上数据进行了排序，并且实现了去重。但是不能对set里的值进行修改。

<strong>begin()   　　 返回set容器的第一个元素</strong>
<strong>end() 　　　 返回set容器的最后一个元素</strong>
<strong>clear()  　　   ,删除set容器中的所有的元素</strong>
<strong>empty() 　　　,判断set容器是否为空</strong>
<strong>max_size() 　 ,返回set容器可能包含的元素最大个数</strong>
<strong>size() 　　　　 ,返回当前set容器中的元素个数</strong>
<strong>rbegin　　　　 ,返回的值和end()相同</strong>
<strong>rend()　　　　 ,返回的值和rbegin()相同</strong>
<strong>count()         用来查找set中某个某个键值出现的次数</strong>
<strong>find() ，返回给定值的定位器，如果没找到则返回end()。</strong>


### 18.4 C++ 代码实现


```c++
/*
struct ListNode {
    int val;
    struct ListNode *next;
    ListNode(int x) :
        val(x), next(NULL) {
    }
};
*/
class Solution {
public:
    ListNode* EntryNodeOfLoop(ListNode* pHead)
    {
        if(nullptr == pHead)return nullptr;
        set<ListNode *> st;
        ListNode* temp = pHead;
        while(temp != nullptr){
            if(!st.count(temp)){//如果 temp次数不为1； 
                st.insert(temp);
                temp=temp->next;
            }else{
                return temp;
            }
        }
        return nullptr;
    }
};
```



```c++
/*
struct ListNode {
    int val;
    struct ListNode *next;
    ListNode(int x) :
        val(x), next(NULL) {
    }
};
*/
class Solution {
public:
    ListNode* EntryNodeOfLoop(ListNode* pHead)
    {
        if(nullptr == pHead)return nullptr;
        set<ListNode *> st;
        ListNode* temp = pHead;
        while(temp != nullptr){
            if(st.find(temp) == st.end()){
                st.insert(temp);
                temp=temp->next;
            }else{
                return temp;
            }
        }
        return nullptr;
    }
};
```

## 19.扑克牌顺子



### 19.1 题目描述

LL今天心情特别好,因为他去买了一副扑克牌,发现里面居然有2个大王,2个小王(一副牌原本是54张^_^)...他随机从中抽出了5张牌,想测测自己的手气,看看能不能抽到顺子,如果抽到的话,他决定去买体育彩票,嘿嘿！！“红心A,黑桃3,小王,大王,方片5”,“Oh My God!”不是顺子.....LL不高兴了,他想了想,决定大\小 王可以看成任何数字,并且A看作1,J为11,Q为12,K为13。上面的5张牌就可以变成“1,2,3,4,5”(大小王分别看作2和4),“So Lucky!”。LL决定去买体育彩票啦。 现在,要求你使用这幅牌模拟上面的过程,然后告诉我们LL的运气如何， 如果牌能组成顺子就输出true，否则就输出false。为了方便起见,你可以认为大小王是0。

### 19.2 题目翻译
从输入的一个数组中判断能否构成5个一连的顺子，输入的数范围为0-13的整数，其中0可以表示1~13的任意整数。若能构成顺子，返回true，否则返回false

### 19.3 解题思路

1.判断数组长度，为空则，return false；

2.数组排序

3.计算大小王个数，并找到初值；

4.数组判断 

- 无大小王，计算首尾差  
- 有大小王，判断大小王个数与首尾差


### 19.4 C++ 代码实现


```c++

class Solution {
public:
    bool IsContinuous( vector<int> numbers ) {
        int i =0,num=0;
        if(numbers.empty())return false;
        sort(numbers.begin(),numbers.end());
        for(i;i<numbers.size();i++){
            if(0 == numbers[i]){
                num++;
            }
        }
        if(0 == num){
            if(numbers.size() == numbers.back()-numbers[num]+1){      //无大小王，5连续
                return true;
            }else{
                return false;
            }                                                          // numbers.size()-num 非0数字的个数
        }                                                              // numbers.back()-numbers[num]+1 首尾差
        if( numbers.back()-numbers[num]+1-(numbers.size()-num)<=num){  // 有大小王，判断大小王个数，与首尾差之间的间隔
            
             return true;
        }else{
            return false;
        }
    }
};
```


## 20.数值的整数次方

### 20.1 题目描述

给定一个double类型的浮点数base和int类型的整数exponent。求base的exponent次方。

保证base和exponent不同时为0

### 20.2 题目翻译

求数的整数次方

### 20.3 解题思路

连乘


### 20.4 C++ 代码实现


```c++
class Solution {
public:
    double Power(double base, int exponent) {
        double res=1;
        int n =abs(exponent);
        if(n == 0)return res;
        for(int i =1;i<=n;i++){
            res*=base;
        }
        return (exponent < 0)?1/res:res;
    }
};
```
## 21.数字在排序数组中出现的次数

### 21.1 题目描述

统计一个数字在排序数组中出现的次数。

### 21.2 解题思路

数组中查找目标数组


### 21.3 C++ 代码实现


```c++
class Solution {
public:
    int GetNumberOfK(vector<int> data ,int k) {
        int n=0;
        for(int i=0;i<data.size();i++)
        {
            if(data[i] == k)n++;
            if(data[i]>k)break;
        }
        return n;
    }
};
```

```c++
#include<algorithm>

class Solution {
public:
    int GetNumberOfK(vector<int> nums ,int target) {
        return upper_bound(nums.begin(), nums.end(), target) - lower_bound(nums.begin(), nums.end(), target);
    }
};
```

## 22.数组中出现超过一半的数字

### 22.1 题目描述

如何得到一个数据流中的中位数？如果从数据流中读出奇数个数值，那么中位数就是所有数值排序之后位于中间的数值。如果从数据流中读出偶数个数值，那么中位数就是所有数值排序之后中间两个数的平均值。我们使用Insert()方法读取数据流，使用GetMedian()方法获取当前读取数据的中位数。

### 22.2 题目翻译

计算当前插入数的中位数

### 22.3 解题思路

用 数组接受，然后用sort算法排序


### 22.4 C++ 代码实现


```c++
class Solution {
public:
    void Insert(int num)
    {
        temp.push_back(num);
        sort(temp.begin(),temp.end());
    }
    double GetMedian()
    {
        return (temp.size()&1)?temp[temp.size()>>1]:(temp[temp.size()>>1]+temp[(temp.size()>>1)-1])/2;
    }
private:
    vector<double>temp;
};
```
## 23.数组中出现超过一半的数字

### 23.1 题目描述

数组中有一个数字出现的次数超过数组长度的一半，请找出这个数字。例如输入一个长度为9的数组{1,2,3,2,2,2,5,4,2}。由于数字2在数组中出现了5次，超过数组长度的一半，因此输出2。如果不存在则输出0。

### 23.2 题目翻译

哈希 用map

### 23.3 解题思路

map 对应项自加


### 23.4 C++ 代码实现


```c++
class Solution {
public:
    int MoreThanHalfNum_Solution(vector<int> numbers) {
        map<int, int> mp;
        for(auto value:numbers) ++mp[value];
        for(auto val:numbers){
            if(mp[val]>(numbers.size()/2)){
                return val;
            }
        }
        return 0;
    }
};
```
## 24.和为S的连续正数序列

### 24.1 题目描述

一个整型数组里除了两个数字之外，其他的数字都出现了两次。请写程序找出这两个只出现一次的数字。

### 24.2 解题思路

1.从大到小排序

2.遍历一遍查找前后是否相同


### 24.3 C++ 代码实现


```c++
class Solution {
public:
    void FindNumsAppearOnce(vector<int> data,int* num1,int *num2) {
        int flag =0;
        sort(data.begin(),data.end());
        for(int i =1;i<data.size()-1;i++){
            if(data[i] != data[i-1]&& data[i]!= data[i+1]){
                if(flag ==1){
                    *num2 =data[i];
                    break;
                }else{
                    *num1 =data[i];
                    flag =1 ;  
                }
            }
        }
        if(data[data.size()-1] != data[data.size()-2]) *num2 =data[data.size()-1];
    }
};
```

## 25.数组中的逆序对

### 25.1 题目描述

在数组中的两个数字，如果前面一个数字大于后面的数字，则这两个数字组成一个逆序对。输入一个数组,求出这个数组中的逆序对的总数P。并将P对1000000007取模的结果输出。 即输出P%1000000007

### 25.2 输入描述:

```
题目保证输入的数组中没有的相同的数字数据范围：	对于%50的数据,size<=10^4	对于%75的数据,size<=10^5	对于%100的数据,size<=2*10^5
```

示例1

<strong>输入</strong>

```
1,2,3,4,5,6,7,0
```

<strong>输出</strong>

```
7
```


### 25.3 C++ 代码实现


```c++
//插入排序法，算法复杂度过高，通过率为50%

class Solution {
private:
    const int kmod = 1000000007;
public:
    int InversePairs(vector<int> data) {
       int num =0;
       if(data.size() == 0)return 0;
        for(int i=0;i<data.size()-1;i++){
            for(int j=i+1;j<data.size();j++){
                if(data[i]>data[j]){
                    num++;
                    num%=kmod;
                }
            }
        }
        return num;
    }
};
```

## 26.数组中的重复数字

### 26.1 题目描述

在一个长度为n的数组里的所有数字都在0到n-1的范围内。 数组中某些数字是重复的，但不知道有几个数字是重复的。也不知道每个数字重复几次。请找出数组中任意一个重复的数字。 例如，如果输入长度为7的数组{2,3,1,0,2,5,3}，那么对应的输出是第一个重复的数字2。

### 26.2 解题思路及代码实现

1. <strong>遍历比较（时间复杂度：n²）</strong>
   因为要输出任意一个重复的数字，只要一个数字出现次数等于两次，就可以输出这个数了。可以选取第一个数作为基准，依次遍历这个数之后的所有数，如果有相等的数，就直接返回；如果没有，就选取第二个数作为基准，依次遍历第二个数后面的所有数，如果有相等的，就返回。

```c++
class Solution {
public:
    // Parameters:
    //        numbers:     an array of integers
    //        length:      the length of array numbers
    //        duplication: (Output) the duplicated number in the array number
    // Return value:       true if the input is valid, and there are some duplications in the array number
    //                     otherwise false
    bool duplicate(int numbers[], int length, int* duplication) {
        for(int i =0;i<length;i++)
        {
            for(int j =i+1;j<length;j++)
            {
                if(numbers[i] == numbers[j])
                {
                    duplication[0] = numbers[i];
                    return true;
                }
            }
        }
        return false;
        
    }
};
```
2. <strong>hash思想 (空间复杂度高 )</strong>

开辟一个大小为n的数组Hash，遍历一遍用户输入的数组，将数组中的元素映射到HashTable数组中，比如：用户数组中有5，7，5，就分别将Hash中下标为5的位置+1，下标为7的位置+1，下标为5的位置再+1，直到遍历完成。那么每个数的出现次数都有了。

```c++
class Solution {
public:
    // Parameters:
    //        numbers:     an array of integers
    //        length:      the length of array numbers
    //        duplication: (Output) the duplicated number in the array number
    // Return value:       true if the input is valid, and there are some duplications in the array number
    //                     otherwise false
    bool duplicate(int numbers[], int length, int* duplication) {
        int hash[1024]={0};
        for(int i=0;i<length;i++)
        {
            ++hash[numbers[i]];
            if(hash[numbers[i]]>1){
                duplication[0] = numbers[i];
                return true;
            }
        }
        return false;
    }
};

```

3. <strong>数组排序（时间复杂度: n）</strong>
   首先给定数组arr[] = {2, 3, 0, 1, 3}。
   因为数组中最大的数是n-1，那就一个萝卜一颗坑。
   从0号下标位置开始，0号元素为2，不等于0，交换0号和2号位置，
   数组变为：{0, 3, 2, 1, 3}。
   再比较0号位置，下标和值相等，往后走到1号下标元素为3，不等于1，交换1号和3号，
   变成：{0, 1, 2, 3, 3}。
   再继续，下标来到4号位置，发现元素下标与值不相等，比较4号和3号下标位置，发现元素相等，返回3即可。

```c++
class Solution {
public:
    // Parameters:
    //        numbers:     an array of integers
    //        length:      the length of array numbers
    //        duplication: (Output) the duplicated number in the array number
    // Return value:       true if the input is valid, and there are some duplications in the array number
    //                     otherwise false
    bool duplicate(int numbers[], int length, int* duplication) {
        for(int i=0;i<length;i++){
            while(numbers[i] != i){
                if(numbers[i] == numbers[numbers[i]]){
                    duplication[0] = numbers[i];
                    return true;
                }else{
                    swap(numbers[i],numbers[numbers[i]]);
                }
            }
        }
        return false;
    }
};

```


## 27.整数中1出现的次数

### 27.1 题目描述

求出1~13的整数中1出现的次数,并算出100~1300的整数中1出现的次数？为此他特别数了一下1~13中包含1的数字有1、10、11、12、13因此共出现6次,但是对于后面问题他就没辙了。ACMer希望你们帮帮他,并把问题更加普遍化,可以很快的求出任意非负整数区间中1出现的次数（从1 到 n 中1出现的次数）。

### 27.2 题目翻译

计算从1到n的数字中1出现的次数和

### 27.3 解题思路

从1到n进行遍历，每一个数计算从个位到最高位1的个数，因为是10进制，可以先从各位判断。再除以10

while(0!=n){

​	if(1 == n%10)count++;

​	n/=10;

}


### 27.4 C++ 代码实现


```c++
class Solution {
public:
    int NumberOf1Between1AndN_Solution(int n)
    {
        int count =0;
        for(int i=0;i<=n;i++){
            int temp =i;
            while(0 != temp){
                if(temp%10 == 1)count++;
                temp /=10;
            }
        };
        return count;
    }
};
```
## 28.旋转数组的最小值

### 28.1 题目描述

把一个数组最开始的若干个元素搬到数组的末尾，我们称之为数组的旋转。输入一个非递减排序的数组的一个旋转，输出旋转数组的最小元素。例如数组[3,4,5,1,2]为[1,2,3,4,5]的一个旋转，该数组的最小值为1。
NOTE：给出的所有元素都大于0，若数组大小为0，请返回0。

### 28.2 题目翻译

递增数组旋转，查找最小

### 28.3 解题思路

两端同时查找，知道头和尾相同；


### 28.4 C++ 代码实现


```c++
class Solution {
public:
    int minNumberInRotateArray(vector<int> rotateArray) {
        if (rotateArray.empty())return 0;
        int i =0,j=rotateArray.size()-1;
        for(i,j;i<j;j--,i++){
            if(rotateArray[i] > rotateArray[i+1])return rotateArray[i+1];
            if(rotateArray[j-1] > rotateArray[j])return rotateArray[j];
        }
        return 0;
    }
};
```
## 29.最小的K个数

### 29.1 题目描述

输入n个整数，找出其中最小的K个数。例如输入4,5,1,6,2,7,3,8这8个数字，则最小的4个数字是1,2,3,4。

### 29.2 题目翻译

排序，提取前K个数

### 29.3 解题思路

排序，提取前K个数


### 29.4 C++ 代码实现


```c++
class Solution {
public:
    vector<int> GetLeastNumbers_Solution(vector<int> input, int k) {
        vector<int> res;
        if(k==0||k>input.size()) return res;
        sort(input.begin(),input.end());
        return vector<int>({input.begin(),input.begin()+k});
    }
};
```
## 30.栈的压入，弹出序列

### 30.1 题目描述

输入两个整数序列，第一个序列表示栈的压入顺序，请判断第二个序列是否可能为该栈的弹出顺序。假设压入栈的所有数字均不相等。例如序列1,2,3,4,5是某栈的压入顺序，序列4,5,3,2,1是该压栈序列对应的一个弹出序列，但4,3,5,1,2就不可能是该压栈序列的弹出序列。（注意：这两个序列的长度是相等的）

### 30.2 题目翻译

看看弹出序列是不是栈的弹出序列

### 30.3 解题思路

模仿栈的压入与弹出，看看最后栈是否为空


### 30.4 C++ 代码实现


```c++
class Solution {
public:
    bool IsPopOrder(vector<int> pushV,vector<int> popV) {
        stack<int> st;
        int i = 0, j = 0;
        while (i < pushV.size()) {
            if (pushV[i] != popV[j]) {
                st.push(pushV[i++]);
            }//将压栈与出栈不相等的放入栈中。
            else {//相等了开始出栈
                ++i, ++j;//出栈下一个与栈顶比较
                while (!st.empty() && st.top() == popV[j]) {//如果相等，出栈，直到不相等，及栈为空
                    st.pop();
                    ++j;
                }
            }
        } // end outer while
        return st.empty();
    }
};
```
## 31.求1+2+3+...+n

### 31.1 题目描述

求1+2+3+...+n，要求不能使用乘除法、for、while、if、else、switch、case等关键字及条件判断语句（A?B:C）。

### 31.2解题思路：

求和公式 
$$
sum= \frac{(1+n)*n}2
$$

### 31.3 C++代码实现



```c++
class Solution {
public:
    int Sum_Solution(int n) {
        return (n+1)*n/2;
    }
};
```

## 32.二叉树的深度

### 32. 1题目描述

输入一棵二叉树，求该树的深度。从根结点到叶结点依次经过的结点（含根、叶结点）形成树的一条路径，最长路径的长度为树的深度。

### 32.2 解题思路

依次递归遍历数的最大深度


### 32.3 C++ 代码实现


```c++
/*
struct TreeNode {
	int val;
	struct TreeNode *left;
	struct TreeNode *right;
	TreeNode(int x) :
			val(x), left(NULL), right(NULL) {
	}
};*/
class Solution {
public:
    int TreeDepth(TreeNode* pRoot)
    {
       if(pRoot == NULL)return 0;
       int left = TreeDepth(pRoot->left);
       int right = TreeDepth(pRoot->right);
       return max(right,left)+1;
    }
};
```

## 33.把字符串转成整数

### 33.1 题目描述

写一个函数，求两个整数之和，要求在函数体内不得使用+、-、*、/四则运算符号。
### 33.2 解题思路

数字电路中的全加器

| num1 | num2 | sum  | flag |
| :--: | :--: | :--: | :--: |
|  0   |  0   |  0   |  0   |
|  0   |  1   |  1   |  0   |
|  1   |  0   |  1   |  0   |
|  1   |  1   |  0   |  1   |

sum=num1^num2

flag = (num1&num2)<<1

### 33.3 C++ 代码实现


```c++

class Solution {
public:
    int Add(int num1, int num2)
    { //全加器 画个真值表
      //进位 flag = (num1&num2)<1; 
      //和 sum = num1^num2;
      //return num1 是为了防止 num2输入为0
 ##if 1
      int flag=0;
      int sum =0;
      while(num2!=0)
        {
          sum = num1^num2;
          flag =(num1&num2)<<1;
          num1 = sum;
          num2 = flag;
         }
         return num1;
##else
      //第二种方法 
      return num2? Add(num1^num2,(num1&num2)<<1):num1;
##endif
    }
};
```


## 34.滑动窗口最大值

### 题目描述

给定一个数组和滑动窗口的大小，找出所有滑动窗口里数值的最大值。例如，如果输入数组{2,3,4,2,6,2,5,1}及滑动窗口的大小3，那么一共存在6个滑动窗口，他们的最大值分别为{4,4,6,6,6,5}； 针对数组{2,3,4,2,6,2,5,1}的滑动窗口有以下6个： {[2,3,4],2,6,2,5,1}， {2,[3,4,2],6,2,5,1}， {2,3,[4,2,6],2,5,1}， {2,3,4,[2,6,2],5,1}， {2,3,4,2,[6,2,5],1}， {2,3,4,2,6,[2,5,1]}。

窗口大于数组长度的时候，返回空

### 34.1 题目翻译

滑动窗口，

### 34.2 解题思路

使用双指针控制窗口大小，并移动


### 34.3 C++ 代码实现


```c++
class Solution {
public:
    vector<int> maxInWindows(const vector<int>& num, unsigned int size)
    {
        int left =0;
        int right = size-1;//2
        vector<int> ret;
        if(size > num.size() || size<1 || num.size() ==0)return ret;
        while(right<num.size()){//2<8
            int index =left;//0
            int temp=num[left];//2
            for(index;index<=right;index++){//0;0<=2;0++
                temp = temp>num[index]?temp:num[index];
            }
            ret.push_back(temp);
            left++;//0++
            right++;//2++
        }
        return ret;
    }
};
```
## 35.连续子数组的动态和

### 35.1 题目描述

我们可以用2*1的小矩形横着或者竖着去覆盖更大的矩形。请问用n个2*1的小矩形无重叠地覆盖一个2*n的大矩形，总共有多少种方法？

比如n=3时，2*3的矩形块有3种覆盖方法：

### 35.2 题目翻译

斐波那契数列

f(n)=f(n-1)+f(n-2);

.

f(2)=2

f(1)=1

### 35.3 解题思路

斐波那契数列

f(n)=f(n-1)+f(n-2);

.

f(2)=2

f(1)=1


### 35.5 C++ 代码实现


```c++
class Solution {
public:
    int rectCover(int number) {
        if(number <3)return number;
        else
            return rectCover(number-1)+rectCover(number-2);
    }
};
```
## 36.替换空格

### 36.1 题目描述

请实现一个函数，将一个字符串中的每个空格替换成“%20”。例如，当字符串为We Are Happy.则经过替换之后的字符串为We%20Are%20Happy。

### 36.2 题目翻译
把字符串中的空格替换为”%20“，原始字符串要加长。

### 36.3 c++代码实现

<strong>思路一</strong>

1.统计字符串中的空格的个数

2.从后往前进行替换


```c++
class Solution {
public:
	void replaceSpace(char *str,int length) 
    {   
        if(length < 1&&str == NULL)return; 
        int num=0;//空格个数
        for(int i=0;i<length;i++){
             if(' ' == str[i])num++;
        }
        for(int i = length -1;i>=0;i--){//从后往前替换
            if(' ' != str[i]){
                str[i+2*num]=str[i];
            }else{
                str[i+2*num]='0';
                str[i+2*num-1]='2';
                str[i+2*num-2]='%';
                num--;
            }
        }
	}
};
```

<strong>思路2</strong>

1.将char * 转为 string;

2.用string.find()方法查找空格，

3.查找到插入%20

4.string 转为char *；

```c++
class Solution {
public:
    void replaceSpace(char *str,int length) {
        string s(str);
        int i=0;
        while((i=s.find(' ',i))>-1){
            s.erase(i,1);
            s.insert(i,"%20");
             
        }
        auto ret=s.c_str();
        strcpy(str,ret);
    }
};
```

## 37.翻转单词顺序列

### 37.1 题目描述

牛客最近来了一个新员工Fish，每天早晨总是会拿着一本英文杂志，写些句子在本子上。同事Cat对Fish写的内容颇感兴趣，有一天他向Fish借来翻看，但却读不懂它的意思。例如，“student. a am I”。后来才意识到，这家伙原来把句子单词的顺序翻转了，正确的句子应该是“I am a student.”。Cat对一一的翻转这些单词顺序可不在行，你能帮助他么？

### 37.2 题目翻译
将字符串数组反转，然后，以空格为单位间隔性翻转

### 37.3 解题思路

1.数组整体翻转

2.以空格为分界，单词翻转


### 37.4 C++ 代码实现


```c++
class Solution {
public:
    string ReverseSentence(string str) {
        reverse(str.begin(),str.end());
        int start=0;
        for(int i =0;i<str.size();i++){
            if(str[i] == ' '){
                reverse(str.begin()+start,str.begin()+i);
                start=i+1;
            }
            if(i+1 == str.size()){
                reverse(str.begin()+start,str.end());
            }   
        }
        return str;
    }
};
```

附录

```c++
string reverse(char * begin;char * end)
{	
    while(begin != end)
        swap(begin ++;end--);
    
}
```

## 38.调整数组奇数位于偶数前面

### 38.1 题目描述

输入一个整数数组，实现一个函数来调整该数组中数字的顺序，使得所有的奇数位于数组的前半部分，所有的偶数位于数组的后半部分，并保证奇数和奇数，偶数和偶数之间的相对位置不变。

### 38.2 题目翻译

数组处理

### 38.3 解题思路




### 38.4 C++ 代码实现


```c++
class Solution {
public:
    void reOrderArray(vector<int> &array) {
        vector<int> ood ;
        vector<int> event;
        for(auto value:array)(value%2)?event.push_back(value):ood.push_back(value);
        array.erase(array.begin(),array.end());
        for(auto value:event)array.push_back(value);
        for(auto value:ood)array.push_back(value);
        
    }
};
```

## 39.进制中1的个数

### 39.1 题目描述

输入一个整数，输出该数32位二进制表示中1的个数。其中负数用补码表示。

### 39.2 题目翻译

位移运算


### 39.3 C++ 代码实现


```c++
class Solution {
public:
     int  NumberOf1(int val) {
        int ans = 0;
        int mark = 0x01;
        while (mark != 0) {
            if (mark & val) ++ans;
            mark <<= 1;
        }
         return ans;
     }
};
```
## 40.连续子数组的动态和

### 40.1 题目描述

HZ偶尔会拿些专业问题来忽悠那些非计算机专业的同学。今天测试组开完会后,他又发话了:在古老的一维模式识别中,常常需要计算连续子向量的最大和,当向量全为正数的时候,问题很好解决。但是,如果向量中包含负数,是否应该包含某个负数,并期望旁边的正数会弥补它呢？例如:{6,-3,-2,7,-15,1,2,2},连续子向量的最大和为8(从第0个开始,到第3个为止)。给一个数组，返回它的最大连续子序列的和，你会不会被他忽悠住？(子向量的长度至少是1)

### 40.2 题目翻译

求最大连续子数组的动态和，数组需要为连续的，不定长度的

### 40.3 解题思路

用二维数组模拟，i，j表示从i到j个元素的和，求最大。


### 40.4 C++ 代码实现


```c++
class Solution {
public:
    int FindGreatestSumOfSubArray(vector<int> array) {
        int len = array.size();
        if(len<1)return 0;
        vector<vector<int>>res(len, vector<int>(len));//n x n的二维数组
        int max;
        for(int i=0;i<len;i++){
            for(int j =i;j<len;j++){ //j=i目的是只取右上三角。
                int temp =i;
                if(temp != j){
                    while(temp<=j){
                        res[i][j]+=array[temp];
                        temp++;
                        if(j > 0){
                        max = (res[i][j]<max?max:res[i][j]);
                        }
                    }
                }else{
                    res[i][j]=array[i];
                    if(j==0){
                        max =res[i][j];
                    }else if(j > 0){
                        max = (res[i][j]<max?max:res[i][j]);
                    }
                }
            }
        }
        return max;
    }
};
```
## 41.重建二叉树

### 41.1 题目描述

输入某二叉树的前序遍历和中序遍历的结果，请重建出该二叉树。假设输入的前序遍历和中序遍历的结果中都不含重复的数字。例如输入前序遍历序列{1,2,4,7,3,5,6,8}和中序遍历序列{4,7,2,1,5,3,8,6}，则重建二叉树并返回。

### 41.2 题目翻译

根据前序遍历和，中序遍历求二叉树。

### 41.3 解题思路

递归，

前序：根左右。中序：左根右。后续：左右根。


### 41.4 C++ 代码实现


```c++
/**
 * Definition for binary tree
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode(int x) : val(x), left(NULL), right(NULL) {}
 * };
 */
class Solution {
public:
    TreeNode* rebuild(vector<int>& pre,int pl,int pr,vector<int>& vin,int vl,int vr)
    {
        if(pl>pr)return nullptr;
        int mid;
        for(int i=0;i<vin.size();i++){
            if(vin[i] == pre[pl]){
                mid = i;        //根节点在中序中的位置
            }
        }
        TreeNode * root = new TreeNode(pre[pl]);
        root->left=rebuild(pre,pl+1,pl+mid-vl,vin,vl,mid-1);//pl+mid-vl 左子树起始点
        root->right=rebuild(pre,pl+mid-vl+1,pr,vin,mid+1,vr);//pl+mid-vl+1 右子树起始点
        return root;
    }
    TreeNode* reConstructBinaryTree(vector<int> pre,vector<int> vin) 
    {
        return rebuild(pre,0,pre.size()-1,vin,0,vin.size()-1);
    }
};
```

## 42.链表中倒数第K个节点

### 42. 1 题目描述

输入一个链表，输出该链表中倒数第k个结点。

### 42.2 题目翻译

输出指定节点

### 42.3 解题思路

1.遍历链表，存入数组

2.返回倒数第K个节点

> 注意：
>
> ​	1.链表长度为空
>
> ​	2.指定位置大于链表长度


### 42.4 C++ 代码实现


```c++
/*
struct ListNode {
	int val;
	struct ListNode *next;
	ListNode(int x) :
			val(x), next(NULL) {
	}
};*/
class Solution {
public:
    ListNode* FindKthToTail(ListNode* pListHead, unsigned int k) {
        if(NULL == pListHead||k < 1)return nullptr;//链表为空，指定位置小于0
        vector<ListNode*> arr;
        int len =0; //计算链表个数
        ListNode* temp = pListHead;
        while(NULL != temp){
            arr.push_back(temp);
            ++len;//记录数组一共多少个元素
            temp = temp->next;
        }
        if(len<k)return nullptr;//指定位置大于数组长度
        return arr[len-k]; //数组序号从0开始，所以用len-k
    }
};
```
## 43.反转链表

### 43.1 题目描述

输入一个链表，反转链表后，输出新链表的表头。

### 43.2 题目翻译
链表反转3种思路

一，挨个遍历，进行反转

二，用栈stack，入栈出栈进行反转。（注意：第一个入栈的需要将next指向 NULL）

三，递归思路

### 43.3 解题思路

思路一

​	遍历链表，进行替换


### 43.4 C++ 代码实现


```c++
/*
struct ListNode {
	int val;
	struct ListNode *next;
	ListNode(int x) :
			val(x), next(NULL) {
	}
};*/
class Solution {
public:
    ListNode* ReverseList(ListNode* pHead) {
        if(NULL == pHead && NULL == pHead->next)return pHead;
        ListNode * pre  = nullptr;
        ListNode * cur  = pHead;
        ListNode * next = nullptr;
        while(NULL != cur){
            next=cur->next;
            cur->next=pre;
            pre=cur;
            cur=next;
        }
        return pre;
    }
};
```
## 44.顺时针打印矩阵

### 44.1 题目描述

输入一个矩阵，按照从外向里以顺时针的顺序依次打印出每一个数字，例如，如果输入如下4 X 4矩阵： 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 则依次打印出数字1,2,3,4,8,12,16,15,14,13,9,5,6,7,11,10.

### 44.2 题目翻译

按照 左-右 ，上-下，右-左，下-上 打印矩阵

### 44.3 解题思路

四个方向按顺序开始打印，左等于右，且上等于下，停止打印


### 44.4 C++ 代码实现


```c++
class Solution {
public:
    vector<int> printMatrix(vector<vector<int> > matrix) {
        int row = matrix.size();    //行数
        int col = matrix[0].size(); //列数
        vector<int> res;
        if(row < 1 || col < 1)return res;
        int left=0,right=col-1,top=0,bottom=row-1;
        while(left <= right && top <=bottom ){
            for(int i =left;i<=right;i++)res.push_back(matrix[top][i]);//左-右打印
            for(int i =top+1;i<=bottom;i++)res.push_back(matrix[i][right]);//上-下
            if(top!=bottom)for(int i =right-1;i>=left;i--)res.push_back(matrix[bottom][i]);//右-左
            if(left != right)for(int i =bottom-1;i>top;i--)res.push_back(matrix[i][left]);//下-上 
            left++;top++;right--;bottom--;
        }
        return res;
    }
};
```

## 45 已知后序和中序，求树

### 45.1 c++代码实现

```c++
/**
 * Definition for binary tree
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode(int x) : val(x), left(NULL), right(NULL) {}
 * };
 */
class Solution {
public:
    TreeNode* rebuild(vector<int>& pre,int pl,int pr,vector<int>& vin,int vl,int vr)
    {
        if(pl>pr)return nullptr;
        int mid;
        for(int i=0;i<vin.size();i++){
            if(vin[i] == pre[pl]){
                mid = i;        //根节点在中序中的位置
            }
        }
        TreeNode * root = new TreeNode(pre[pl]);
        root->left=rebuild(pre,pl+1,pl+mid-vl,vin,vl,mid-1);//pl+mid-vl 左子树起始点
        root->right=rebuild(pre,pl+mid-vl+1,pr,vin,mid+1,vr);//pl+mid-vl+1 右子树起始点
        return root;
    }
    TreeNode* reConstructBinaryTree(vector<int> pre,vector<int> vin) 
    {
        return rebuild(pre,0,pre.size()-1,vin,0,vin.size()-1);
    }
};
```

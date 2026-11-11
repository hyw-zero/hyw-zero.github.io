---
title: 'Qt学习笔记之数据库操作'
date: 2019-02-05 22:10:30
tags:
  - C++
categories:
  - Qt学习笔记
copyright: true
---

## 1 数据库操作

<strong>Qt</strong> <strong>使用QSqlDatabase表示一个数据库连接。</strong>更底层上，Qt 使用驱动（drivers）来与不同的数据库 API 进行交互。Qt 桌面版本提供了如下几种驱动：

<!--more-->

| 驱动     | 数据库                                                       |
| -------- | ------------------------------------------------------------ |
| QDB2     | IBM DB2 (7.1 或更新版本)                                     |
| QIBASE   | Borland InterBase                                            |
| QMYSQL   | MySQL                                                        |
| QOCI     | Oracle Call Interface Driver                                 |
| QODBC    | Open Database Connectivity (ODBC) – Microsoft SQL Server 及其它兼容 ODBC 的数据库 |
| QPSQL    | PostgreSQL (7.3 或更新版本)                                  |
| QSQLITE2 | SQLite 2                                                     |
| QSQLITE  | SQLite 3                                                     |
| QSYMSQL  | 针对 Symbian 平台的SQLite 3                                  |
| QTDS     | Sybase Adaptive Server (自  Qt 4.7 起废除)                   |

Qt 只默认搭载 QSqlite 驱动（这个驱动实际还包括 Sqlite 数据库，也就是说，如果需要使用 Sqlite 的话，只需要该驱动即可）。我们可以选择把这些驱动作为 Qt 的一部分进行编译，也可以当作插件编译。

如果习惯于使用 SQL 语句，我们可以选择QSqlQuery类；如果只需要使用高层次的数据库接口（不关心 SQL 语法），我们可以选择使用QsqlTableModel类。 

在使用时，我们可以通过

```c++
QSqlDatabase::drivers();
```

找到系统中所有可用的数据库驱动的名字列表。我们只能使用出现在列表中的驱动。由于默认情况下，QtSql 是作为 Qt 的一个模块提供的。为了使用有关数据库的类，我们必须早 .pro 文件中添加这么一句：

```
QT += sql
```

这表示，我们的程序需要使用 Qt 的 core、gui 以及 sql 三个模块。注意，如果需要同时使用 Qt4 和 Qt5 编译程序，通常我们的 .pro 文件是这样的：

```
QT += core gui sql
greaterThan(QT_MAJOR_VERSION, 4): QT += widgets
```

这两句也很明确：Qt 需要加载 core、gui 和 sql 三个模块，如果主板本大于 4，则再添加 widgets 模块。

下面来看一个简单的函数：

```c++
bool connect(const QString &dbName)
{
  QSqlDatabase db = QSqlDatabase::addDatabase("QSQLITE");
//  db.setHostName("host");
//   db.setDatabaseName("dbname");
//  db.setUserName("username");
//  db.setPassword("password");
  db.setDatabaseName(dbName);
  if (!db.open()) {
    QMessageBox::critical(0, QObject::tr("Database Error"),db.lastError().text());
    return false;
  }
  return true;
}
```

我们使用connect()函数创建一个数据库连接。我们使用QSqlDatabase::addDatabase()静态函数完成这一请求，也就是创建了一个QSqlDatabase实例。注意，数据库连接使用自己的名字进行区分，而不是数据库的名字。例如，我们可以使用下面的语句：

```c++
QSqlDatabase db=QSqlDatabase::addDatabase("QSQLITE",QString("con%1").arg(dbName));
```

此时，我们是使用addDatabase()函数的第二个参数来给这个数据库连接一个名字。在这个例子中，用于区分这个数据库连接的名字是QString("conn%1").arg(dbName)，而不是 “QSQLITE”。这个参数是可选的，如果不指定，系统会给出一个默认的名字QSqlDatabase::defaultConnection，此时，Qt 会创建一个默认的连接。如果你给出的名字与已存在的名字相同，新的连接会替换掉已有的连接。通过这种设计，我们可以为一个数据库建立多个连接。

我们这里使用的是 sqlite 数据库，只需要指定数据库名字即可。如果是数据库服务器，比如 MySQL，我们还需要指定主机名、端口号、用户名和密码，这些语句使用注释进行了简单的说明。

接下来我们调用了<strong>QSqlDatabase类的open()函数，打开这个数据库连接</strong>。通过检查open()函数的返回值，我们可以判断数据库是不是正确打开。

QtSql 模块中的类大多具有lastError()函数，用于检查最新出现的错误。如果你发现数据库操作有任何问题，应该使用这个函数进行错误的检查。这一点我们也在上面的代码中进行了体现。当然，这只是最简单的实现，一般来说，更好的设计是，不要在数据库操作中混杂界面代码（并且将这个connect()函数放在一个专门的数据库操作类中）。

接下来我们可以在main()函数中使用这个connect()函数：

```c++
int main(int argc, char *argv[])
{
  QApplication a(argc, argv);
  if (connect("demo.db")) 
  {
    QSqlQuery query;
    if (!query.exec("CREATE TABLE student ("
                                            "id INT PRIMARY KEY AUTOINCREMENT,"
                                            "name VARCHAR(255),"
                                            "age INT)")
       ) 
    {
	   QMessageBox::critical(0,QObject::tr("Database Error"), query.lastError().text());
       return 1;
    }
  } else 
  {
		return 1;
  }
  return a.exec();
}
```

main()函数中，我们调用这个connect()函数打开数据库。如果打开成功，我们通过一个QSqlQuery实例执行了 SQL 语句。同样，我们使用其lastError()函数检查了执行结果是否正确。

> <strong>注意：</strong>
> 这里的QSqlQuery实例的创建。我们并没有指定是为哪一个数据库连接创建查询对象，此时，系统会使用默认的连接，也就是使用没有第二个参数的addDatabase()函数创建的那个连接（其实就是名字为QSqlDatabase::defaultConnection的默认连接）。如果没有这么一个连接，系统就会报错。也就是说，如果没有默认连接，我们在创建QSqlQuery对象时必须指明是哪一个QSqlDatabase对象，也就是addDatabase()的返回值。

我们还可以通过使用QSqlQuery::isActive()函数检查语句执行正确与否。如果QSqlQuery对象是活动的，该函数返回 true。所谓“活动”，就是指该对象成功执行了exec()函数，但是还没有完成。这里需要注意的是，如果存在一个活动的 SELECT 语句，某些数据库系统不能成功完成connect()或者rollback()函数的调用。此时，我们必须首先将活动的 SELECT 语句设置成不活动的。

创建过数据库表 student 之后，我们开始插入数据，然后将其独取出来：

```c++
if (connect("demo.db")) {
  QSqlQuery query;
  query.prepare("INSERT INTO student (name, age) VALUES (?, ?)");
  QVariantList names;
  names << "Tom" << "Jack" << "Jane" << "Jerry";
  query.addBindValue(names);
  QVariantList ages;
  ages << 20 << 23 << 22 << 25;
  query.addBindValue(ages);
  if (!query.execBatch())
  {
    QMessageBox::critical(0, QObject::tr("Database Error"),query.lastError().text());
  }
  query.exec("SELECT name, age FROM student");
  while (query.next()) {
    QString name = query.value(0).toString();
    int age = query.value(1).toInt();
    qDebug() << name << ": " << age;
  }
} else {
  return 1;
}
```

依旧连接到我们创建的 demo.db 数据库。我们需要插入多条数据，此时可以使用QSqlQuery::exec()函数一条一条插入数据，但是这里我们选择了另外一种方法：批量执行。首先，我们使用<strong>QSqlQuery::prepare()函数对这条 SQL 语句进行预处理，问号 ? 相当于占位符，预示着以后我们可以使用实际数据替换这些位置。</strong>简单说明一下，预处理是数据库提供的一种特性，它会将 SQL 语句进行编译，性能和安全性都要优于普通的 SQL 处理。在上面的代码中，我们使用一个字符串列表 names 替换掉第一个问号的位置，一个整型列表 ages 替换掉第二个问号的位置，利用<strong>QSqlQuery::addBindValue()我们将实际数据绑定到这个预处理的 SQL 语句上</strong>。需要注意的是，names 和 ages 这两个列表里面的数据需要一一对应。然后我们调用<strong>QSqlQuery::execBatch()批量执行 SQL，之后结束该对象。</strong>这样，插入操作便完成了。

另外说明一点，我们这里使用了 ODBC 风格的 ? 占位符，同样，我们也可以使用 Oracle 风格的占位符：

```c++
query.prepare("INSERT INTO student (name, age) VALUES (:name, :age)");
```

此时，我们就需要使用

```c++
query.bindValue(":name", names);
query.bindValue(":age", ages);
```

进行绑定。Oracle 风格的绑定最大的好处是，绑定的名字和值很清晰，与顺序无关。但是这里需要注意，bindValue()函数只能绑定一个位置。比如

```c++
query.prepare("INSERT INTO test (name1, name2) 
VALUES (:name, :name)");
// ...
query.bindValue(":name", name);
```

只能绑定第一个 :name 占位符，不能绑定到第二个。

接下来我们依旧使用同一个查询对象执行一个 SELECT 语句。如果存在查询结果，QSqlQuery::next()会返回 true，直到到达结果最末，返回 false，说明遍历结束。我们利用这一点，使用 while 循环即可遍历查询结果。使用QSqlQuery::value()函数即可按照 SELECT 语句的字段顺序获取到对应的数据库存储的数据。

```c++
query.exec(“select name, age from student”);
while（query.next()）
{
  QString name = query.value(0);
  QString age = query.value(1);
}
```

对于数据库事务的操作，我们可以使用 QSqlDatabase::transaction() 开启事务，QSqlDatabase::commit() 或者QSqlDatabase::rollback() 结束事务。使用QSqlDatabase::database()函数则可以根据名字获取所需要的数据库连接。

### 1.1实例

<strong>1. MySql数据库</strong>

```c++
#include "widget.h"
#include "ui_widget.h"
#include <QSqlDatabase>
#include <QDebug>
#include <QMessageBox>
#include <QSqlError>
#include <QSqlQuery>
#include <QVariantList>
Widget::Widget(QWidget *parent) :
    QWidget(parent),
    ui(new Ui::Widget)
{
    ui->setupUi(this);
    //打印Qt支持的数据库驱动
    qDebug() << QSqlDatabase::drivers();
    //添加MySql数据库
    QSqlDatabase db = QSqlDatabase::addDatabase("QMYSQL");
    //连接数据库
    db.setHostName("127.0.0.1"); //数据库服务器IP
    db.setUserName("root"); //数据库用户名
    db.setPassword("123456"); //密码
    db.setDatabaseName("info"); //使用哪个数据库
    //打开数据库
    if(!db.open() ) //数据库打开失败
    {
        QMessageBox::warning(this, "错误", db.lastError().text());
        return;
    }
//    QSqlQuery query;
//    query.exec("create table student(id int primary key, name varchar(255), age int, score int);");

/* //多个数据库查询操作
     QSqlDatabase db1 = QSqlDatabase::addDatabase("QMYSQL", "a");
     db1.setHostName("127.0.0.1"); //数据库服务器IP
     db1.setUserName("root"); //数据库用户名
     db1.setPassword("123456"); //密码
     db1.setDatabaseName("test"); //使用哪个数据库
     //打开数据库
     if( !db1.open() ) //数据库打开失败
     {
         QMessageBox::warning(this, "错误", db.lastError().text());
         return;
     }
     QSqlQuery query1;
     query1.exec("create table student(id int primary key, name varchar(255), age int, score int);");
*/
#if 0
    //插入
    QSqlQuery query;
    query.exec("insert into student(id, name, age, score) values(1, 'mike', 18, 59);");
    //批量插入
    //odbc风格
    //预处理语句
    // ? 相当于 占位符
    query.prepare("insert into student(name, age, score) values(?, ?, ?)");
    //给字段设置内容 list
    QVariantList nameList;
    nameList << "xiaoming" << "xiaolong" << "xiaojiang";
    QVariantList ageList;
    ageList << 11 << 22 << 33;
    QVariantList scoreList;
    scoreList << 59 << 69 << 79;
    //给字段绑定相应的值 按顺序绑定
    query.addBindValue(nameList);
    query.addBindValue(ageList);
    query.addBindValue(scoreList);
    //执行预处理命令
    query.execBatch();

    //oracle风格
    //占位符 ： + 自定义名字
    query.prepare("insert into student(name, age, score) values(:name, :age, :score)");
    //给字段设置内容 list
    QVariantList nameList;
    nameList << "xiaoa" << "xiaob" << "xiaoc";
    QVariantList ageList;
    ageList << 33 << 44 << 55;
    QVariantList scoreList;
    scoreList << 89 << 90 << 99;
    //给字段绑定
    query.bindValue(":name", nameList);
    query.bindValue(":score", scoreList);
    query.bindValue(":age", ageList);
    //执行预处理命令
    query.execBatch();
#endif
    QSqlQuery query;
    query.exec("select * from student");
    while(query.next()) //一行一行遍历
    {
        //取出当前行的内容
        qDebug() << query.value(0).toInt()
                 << query.value(1).toString()
                 << query.value("age").toInt()
                 << query.value("score").toInt();
    }
}

Widget::~Widget()
{
    delete ui;
}
void Widget::on_buttonDel_clicked()
{
    //获取行编辑内容
    QString name = ui->lineEdit->text();
    QString sql = QString("delete from student where name = '%1'").arg(name);
    //开启一个事务
    QSqlDatabase::database().transaction();
    QSqlQuery query;
    query.exec(sql);
}
void Widget::on_buttonSure_clicked()
{
    //确定删除
    QSqlDatabase::database().commit();
}
void Widget::on_buttonCancel_clicked()
{
    //回滚，撤销
     QSqlDatabase::database().rollback();
}
```

<strong>2.SQLite</strong>

```c++
#include "widget.h"
#include "ui_widget.h"
#include <QSqlDatabase>
#include <QDebug>
#include <QMessageBox>
#include <QSqlError>
#include <QSqlQuery>
#include <QVariantList>
Widget::Widget(QWidget *parent) :
    QWidget(parent),
    ui(new Ui::Widget)
{
    ui->setupUi(this);

    //打印Qt支持的数据库驱动
    qDebug() << QSqlDatabase::drivers();

    //添加Sqlite数据库
    QSqlDatabase db = QSqlDatabase::addDatabase("QSQLITE");
    //设置数据库
    db.setDatabaseName("../info.db");
    //打开数据库
    if( !db.open() ) //数据库打开失败
    {
        QMessageBox::warning(this, "错误", db.lastError().text());
        return;
    }
    QSqlQuery query;
    query.exec("create table student(id int primary key, name varchar(255), age int, score int);");
    query.prepare("insert into student(name, age, score) values(?, ?, ?)");
    //给字段设置内容 list
    QVariantList nameList;
    nameList << "xiaoming" << "xiaolong" << "xiaojiang";
    QVariantList ageList;
    ageList << 11 << 22 << 33;
    QVariantList scoreList;
    scoreList << 59 << 69 << 79;
    //给字段绑定相应的值 按顺序绑定
    query.addBindValue(nameList);
    query.addBindValue(ageList);
    query.addBindValue(scoreList);
    //执行预处理命令
    query.execBatch();
    query.exec("select * from student");
    while(query.next()) //一行一行遍历
    {
        //取出当前行的内容
        qDebug() << query.value(0).toInt()
                 << query.value(1).toString()
                 << query.value("age").toInt()
                 << query.value("score").toInt();
    }
}
```



## 2 使用模型操作数据库

上一节我们使用 SQL 语句完成了对数据库的常规操作，包括简单的 CREATE、SELECT 等语句的使用。我们也提到过，Qt 不仅提供了这种使用 SQL 语句的方式，还提供了一种基于模型的更高级的处理方式。这种<strong>基于QSqlTableModel 的模型处理更为高级，如果对 SQL 语句不熟悉，并且不需要很多复杂的查询，这种QSqlTableModel模型基本可以满足一般的需求。</strong>本节我们将介绍QSqlTableModel的一般使用，对比 SQL 语句完成对数据库的增删改查等的操作。值得注意的是，QSqlTableModel并不一定非得结合 QListView或QTableView使用，我们完全可以用其作一般性处理。

### 2.1 查询操作

首先我们来看看如何使用QSqlTableModel 进行 SELECT 操作：

```c++
if (connect("demo.db")) {
  QSqlTableModel model;
  model.setTable("student");
  model.setFilter("age > 20 and age < 25");
  if (model.select())
  {
    for (int i = 0; i < model.rowCount(); ++i) //打印模型界面显示内容
    {
      QSqlRecord record = model.record(i);
      QString name = record.value("name").toString();
      int age = record.value("age").toInt();
      qDebug() << name << ": " << age;
    }
  }
} else {
  return 1;
}
```

我们依旧使用了上一节的connect()函数。接下来我们创建了QSqlTableModel实例，

- setTable()函数设置所需要操作的表格；


-  setFilter()函数则是添加过滤器，也就是 WHERE 语句所需要的部分。


例如上面代码中的操作实际相当于 SQL 语句

```sql
SELECT * FROM student WHERE age > 20 and age < 25
```

使用QSqlTableModel::select()函数进行操作，也就是执行了查询操作。如果查询成功，函数返回 true，由此判断是否发生了错误。如果没有错误，我们使用record()函数取出一行记录，该记录是以QSqlRecord的形式给出的，而QSqlRecord::value()则取出一个列的实际数据值。注意，由于QSqlTableModel没有提供const_iterator遍历器，因此不能使用foreach宏进行遍历。

另外需要注意，由于QSqlTableModel只是一种高级操作，肯定没有实际 SQL 语句方便。具体来说，<strong>我们使用QSqlTableModel只能进行 SELECT   \* 的查询，不能只查询其中某些列的数据。</strong>

### 2.2 插入操作

下面一段代码则显示了如何使用QSqlTableModel进行插入操作：

```c++
QSqlTableModel model;
model.setTable("student");
int row = 0;
model.insertRows(row, 1);
model.setData(model.index(row, 1), "Cheng");
model.setData(model.index(row, 2), 24);
model.submitAll();
```

插入也很简单：model.insertRows(row, 1);说明我们想在索引 0 的位置插入 1 行新的数据。使用<strong>setData()函数则开始准备实际需要插入的数据</strong>。注意这里我们向 row 的第一个位置写入 Cheng（通过model.index(row, 1)，回忆一下，我们把 model 当作一个二维表，这个坐标相当于第 row 行第 1 列），其余以此类推。最后，调用<strong>submitAll()函数提交所有修改</strong>。这里执行的操作可以用如下 SQL 表示：

```sql
INSERT INTO student (name, age) VALUES ('Cheng', 24)
```



### 2.3 更新操作

当我们取出了已经存在的数据后，对其进行修改，然后重新写入数据库，即完成了一次更新操作：

```c++
QSqlTableModel model;
model.setTable("student");
model.setFilter("age = 25");
if (model.select()) {
  if (model.rowCount() == 1)
  {
    QSqlRecord record = model.record(0);
    record.setValue("age", 26);
    model.setRecord(0, record);
    model.submitAll();
  }
}
```

这段代码中，我们首先找到 age = 25 的记录，然后将 age 重新设置为 26，存入相同的位置（在这里都是索引 0 的位置），提交之后完成一次更新。当然，我们也可以类似其它模型一样的设置方式：setData()函数。具体代码片段如下：

```c++
if (model.select()) 
{
  if (model.rowCount() == 1) 
  {
    model.setData(model.index(0, 2), 26);
    model.submitAll();
  }
}
```

注意我们的 age 列是第 3 列，索引值为 2，因为前面还有 id 和 name 两列。这里的更新操作则可以用如下 SQL 表示：

```sql
UPDATE student SET age = 26 WHERE age = 25
```

### 2.4 删除操作

删除操作同更新类似：

```c++
QSqlTableModel model;
model.setTable("student");
model.setFilter("age = 25");
if (model.select()) 
{
  if (model.rowCount() == 1) {
     model.removeRows(0, 1);
	 model.submitAll();
  }
}
```

如果使用 SQL 则是：

```sql
DELETE FROM student WHERE age = 25
```

当我们看到removeRows()函数就应该想到：我们可以一次删除多行。事实也正是如此，这里不再赘述。

## 3 可视化显示数据库数据

前面我们用了两个章节介绍了 Qt 提供的两种操作数据库的方法。显然，使用QSqlQuery的方式更灵活，功能更强大，而使用QSqlTableModel则更简单，更方便与 model/view 结合使用（数据库应用很大一部分就是以表格形式显示出来，这正是 model/view 的强项）。本章我们简单介绍使用QSqlTableModel显示数据的方法。当然，我们也可以选择使用QSqlQuery获取数据，然后交给 view 显示，而这需要自己给 model 提供数据。

我们还是使用前面一直在用的 student 表，直接来看代码：

```c++
int main(int argc, char *argv[])
{
  QApplication a(argc, argv);
  if (connect("demo.db")) 
  {
    QSqlTableModel *model = new QSqlTableModel;
    model->setTable("student");     //设定数据库显示的表
    model->setSort(1, Qt::AscendingOrder); 
    model->setHeaderData(1, Qt::Horizontal, "Name");
    model->setHeaderData(2, Qt::Horizontal, "Age");
    model->select();
    
    QTableView *view = new QTableView;
    view->setModel(model);
	view->setSelectionMode(QAbstractItemView::SingleSelection);    
	view->setSelectionBehavior(QAbstractItemView::SelectRows);
//  view->setColumnHidden(0, true);
    view->resizeColumnsToContents();
    view->setEditTriggers(QAbstractItemView::NoEditTriggers);

    QHeaderView *header = view->horizontalHeader();
    header->setStretchLastSection(true);

    view->show();

  } else 
  {
    return 1;
  }
 return a.exec();
}
```

这里的connect()函数还是我们前面使用过的（11.1），

我们在main()函数中创建了QSqlTableModel对象，使用 student 表。student 表有三列：id，name 和 age，我们选择按照 name 排序，使用setSort()函数达到这一目的。然后我们设置每一列的列头。这里我们只使用了后两列，第一列没有设置，所以依旧显示为列名 id。

在设置好 model 之后，我们又创建了QTableView对象作为视图。注意这里的设置：单行选择，按行选择。resizeColumnsToContents()说明每列宽度适配其内容；<strong>setEditTriggers()</strong>则禁用编辑功能。最后，我们设置最后一列要充满整个窗口。我们的代码中有一行注释，设置第一列不显示。

# microservices-with-react-and-nodejs

> Build, deploy, and scale a Microservices built with Node, React, Docker and Kubernetes.

## Menu

01. 微服务基础
02. 实现最小微服务系统
03. 使用 `Docker` 运行服务
04. 使用 `K8s` 编排服务
05. 多服务应用程序的体系结构
06. 利用云环境进行开发
07. 统一响应规范策略
08. 数据库管理与建模
09. 鉴权策略和配置
10. 测试相互隔离的微服务
11. 集成 `React-SSR-APP`
12. 服务之间的代码共享和重用
13. `CURD`服务抽象封装
14. 使用 `NATS Streaming Server`(Brokered)
15. `Node.js` 使用 `NATS`
16. 管理 `NATS Client`
17. 线上环境跨服务数据复制
18. 深入事件流
19. 侦听事件和处理并发事务
20. Worker Services
21. 处理支付
22. 前端开发
23. CI/CD

## Notes

![nats1](/images/nats.jpg)

## Chapter

### 01-微服务基础

- 搞微服务之前，不得不先看看 `单体应用`

![001](/images/001.png)
![002](/images/002.png)
![003](/images/003.png)

- Each service gets its own databse (if it needs one)

![003](/images/ch01/003.png)

- With microservices, we store and access data sort of strange way (果真有点奇怪 😂)

- Services will never, ever reach into another services database

![004](/images/ch01/004.png)

![004](/images/004.png)

> 一直没想好怎么解释A服务调B服务的数据库的弊端，原来如此。

#### Why Database-Per-Service

- We want each service to run independently of other services
- Database sechema/structure might change unexpectedly
- Some services migth function more efficiently with different types of DB's (sql vs nosql)
  - 某些服务跑在不通类型的数据库上能有更高效的运行效率

#### Quiz - Data in Microservices

> 老哥出个题目都那么专业 🐂 🐃 🐄 🦏

- 👀 Creating one database per service seems like a waste! Why do we create one database per services?
  - ✅ We want every service to be able to act independently whitout depending on any other service
  - ✅ If each service has its own database, we can optimize what type of database we pick for a service
  - ✅ A single databse shared between many services would be a single point of failure, which would limit the reliability of our app

- 👀 What is the #1 challenge in microservices?
  - ✅ Managing data between different services
  - ❌ Implementing monitoring and logging for services written in different languages
  - ❌ Deploying two services at the same time

#### 服务间通信

![008](/images/ch01/007.png)

- 同步通信

举个例子：

![005](/images/005.png)

- 同步通信要点
  - Conceptually easy to understand! (概念很简单)
  - Service D won't need a databse! (服务器不需要依赖数据库)
  - introduces a dependency between services (引入一个依赖在各服务之间！而不是A去调B、C，我以前真是这么干的)
  - If any inter-service request fails, the overall request fails (其中任何一个子服务出错，则整个业务链上的请求也出错)
  - The entire request is only as fast as the slowest request (一个完整的请求是否完成得看最慢的哪一个子请求)
  - Can easilty intoduce webs of requests (好处？轻松接入各种web请求)

举个同步通信的例子 🌰

![006](/images/006.png)

![010](/images/ch01/010.png)

如上图所示，要是各个服务用同步通信，开发到后期真的如乱麻一把难缠了，快点祭出 “异步通信” 吧。

![007](/images/007.png)

为每个服务配置独立数据库，并且用异步通信这也的设计模式看上去诡异又低消！

![008](/images/008.png)

- 异步通信要点
  - 👍 Service D has zero dependencies on other services!
  - 👍 Service D will be extremely fast!
  - 👎 Data duplication - paying for extra storage + extra DB
  - 👎 Harder to understand

### 02-mini-microservices-system

- client
- posts
  - `yarn add express cors axios nodemon`
- comments
  - `yarn add express cors axios nodemon`

![009](/images/009.png)

> 在单体应用中，毕竟在一个数据库里的不同的表，很好解决！

![010](/images/010.png)

> 但在微服务中，怎么解决呢？

![011](/images/011.png)

同步方案：意思还是来个同步通信了。

![012](/images/012.png)

#### 异步方案

- 👀 Wait, so you are saying we need to create a new service every time we need to join some data ?!?!?!
  - Absolutely not! In reality, might not even have posts and comments in separate services in the first place

#### Event Bus

- Many different implementations. RabbitMQ, Kafka, NATS...
- Receives events, publishes them to listeners
- Many different subtle features that make async communication way easier or way harder
  - 许多不同且微妙的功能可能会使得异步通信变得更容易或更难
- We are going to build out own event bus using Express. It will not implement the vast majority of features a normal bus has.
  - `mini` 阶段我们用 `Express` 建议模拟事件总线，后面再用正儿八经的
  - 是的，模拟阶段使用 `Express` 假把意思的调度下而已
  - 原来 Event Bus 是调度器的作用，如果换上消息队列就把同步调度转换成异步被动执行
- Yes, for our next app we will use a production grade, open source event bus

![012x](/images/012x.png)

> 在 mini 系统里，所有服务都监听着 Event Bus 的消息，就是自己服务发生的一件事且是自己发出来的，也会收到 `总线` 的回馈。

独立一个 Query-Service 出来有利有弊吧

- 利：减少了数据库查询次数
- 弊：增加事务、增加数据不一致的可能性，实时性要求较高的系统不合适
- 这应该算是 CQRS 命令查询职责分离
- 也可以是简单的资源合并

![013x](/images/013x.jpeg)

新增功能：评论审核机制

![014](/images/014.png)

![015](/images/015.png)

- The query service is about presentation logic
- It is join ing two resources right now (posts and comments), but it might join 10!
- Does it make sense for a presentation service to understand how to process a very precise update?
- Query-Service 只和展示有关，数据跟新和他没关系，所说方案二不可行
- 而且未来随着功能越来越多，代码会越来越冗余！它要处理的事件太多，其实我们只需要要 query-service 只关注一件事 `CommentUpdated` 即可

![016](/images/016.png)

![017](/images/017.png)

如何处理事件丢失的情况

![018](/images/018.png)

![021](/images/021.png)

我们设想这么一个场景：如果 Query 或者 Moderation 服务失效，则 Comments 服务的数据是一定变了，但 Query 服务的数据没变，这就是数据不一致问题，也就是个事务的不完整性，那该怎么解决数据存储的不一致性问题呢？

- 如下有三种方式：
  - 第一种 `“同步请求”`：每次来请求了，两边数据源都问一遍！😂
  - 第二种 `“直连数据库”`：不说了，不可能！
  - 第三种：`“存储事件消息”`：目前比较合适的方案，这个方案的确是CQRS！
    - 老哥一直在给 NATS 作铺垫，原生自带解决方案嘛

![019](/images/019.png)

![020](/images/020.png)

![022](/images/022.png)

- 让总线把错误的事件先存下来，等那个消费消息失败的服务重新上线了，再发送出来。
- NATS 原生功能，而且还带序号的
- 也不是只存储未消费的消息，而是全部都存储起来

![023](/images/023.png)

弱弱地总结下我们 `mini-system` CQRS：

- 首先 Event Bus 存储所有 Event
- 然后每个所依赖服务的每次重启都消费一遍所有旧的事务(所有)
- 最后开始监听处理新事物

这样的好处就是：

- Query Service 挂了，我Posts照样能写
- Moderation Service 挂了，我查询和下入照样OK
- 我 Comments Service 挂了，我查询照样可以

> 🐂 🐄 🦏 🦬 🐃

### 03-Running Services with Docker

![024](/images/024.png)

![025](/images/025.png)

![026](/images/026.png)

Why Docker ?

- running our app right now makes big assumptions about out environment
- running our app requires precise knowledge of how to start it (npm start)
- Docker solves both these issues. Containers wrap up everything that is needed for a program + how to start run run it

Why k8s ?

- K8s is a tool for running a bunch of different containers
- We give it some configuration to describe how we want our containers to rn and interact with each other

![027](/images/027.png)

![028](/images/028.png)

> 都是些基操！

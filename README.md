# microservices-with-react-and-nodejs

> Build, deploy, and scale a Microservices built with Node, React, Docker and Kubernetes.

## Menu

01. 微服务基础
02. 实现最小微服务系统
03. 使用 `Docker` 运行服务
04. 使用 `K8s` 编排服务
05. 多服务应用程序的体系结构
06. 利用云环境进行开发
07. 使用归一化策略
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

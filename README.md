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

- Each service gets its own databse (if it needs one)

![003](/images/ch01/003.png)

- Services will never, ever reach into another services database

![004](/images/ch01/004.png)

#### Why Database-Per-Service

- We want each service to run independently of other services
- Database sechema/structure might change unexpectedly
- Some services migth function more efficiently with different types of DB's (sql vs nosql)
  - 某些服务跑在不通类型的数据库上能有更高效的运行效率

#### 服务间通信

![008](/images/ch01/007.png)

- 同步通信

举个例子：

![008](/images/ch01/008.png)

- 同步通信要点
  - Conceptually easy to understand! (概念很简单啦)
  - Service D won't need a databse! (服务器不需要数据库)
  - introduces a dependency between services (引入一个依赖在各服务之间！而不是A去调B、C，我以前真是这么干的)
  - If any inter-service request fails, the overrall request fails
  - The entire request is only as fast as the slowest request (一个完整的请求是否完成看最慢的哪一个子请求)
  - Can easilty intoduce webs of requests (轻松接入各种web请求)

![010](/images/ch01/010.png)

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

![029](/images/029.png)

![030](/images/030.png)

![031](/images/031.png)

![032](/images/032.png)

> `kubectl apply -f posts.yaml`

![033](/images/033.png)

![034](/images/034.png)

![036](/images/036.png)

方法一：修改配置文件里的版本号，更新`deployment`

> 此方法不可行，远程服务器一多，改的配置文件也多，麻烦！

![035](/images/035.png)

方法二：使用`latest`标签更好，其步骤如下：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: posts-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: posts
  template:
    metadata:
      labels:
        app: posts
    spec:
      containers:
        - name: posts
          image: registry.cn-shenzhen.aliyuncs.com/444/m-blog-posts:latest
```

- 1.在 `deployment` 描述时，容器的镜像一定要用 `latest` 标签
- 2.修改代码
- 3.制作新版本镜像
- 4.推送到镜像服务: `docker-hub`
- 5. 重启 `deployment`，此时他会比较 image 的值，看有新的没，有就拉取重新部署
  - `kubectl rollout restart deployment [depl_name]`

![037](/images/037.png)

- `Cluster IP` 取个号输入的url让pord可以再k8s的集群内部被访问！
- `Node Port` 让pod可以被“外网访问”，但都是用于开发测试
- `Load Balancer` 这才是正确的让pod被访问的正确方式，生产用
- `External Name` 取个别名 CNAME

```yaml
appVersion: v1
kind: Service
metadata:
  name: posts-serv
spec:
  type: NodePort
  selector:
    app: posts
  posts:
    - name: posts
      protocol: TCP
      port: 4000
      targetPort: 4000
```

![038](/images/038.png)

> 简直玩死人！macOS+docker的minikube 网络访问是个坑，玩了个一个半小时，换vm才可以！直接从23点坑到1点多，搞死！

```bash
$ minikube start --registry-mirror=https://registry.docker-cn.com --kubernetes-version=1.18.8 --driver=virtualbox

$ minikube ip
192.168.99.100

$ minikube service posts-srv --url
http://192.168.99.100:31557
```

#### ClusterIP的正确用法

![039](/images/039.png)

Golas Moving Forward

- Build an `image` for the Event Bus
- `Push` the image to Docker Hub
- Create a `deployment` for Event Bus
- Create a `Cluster IP service` for Event Bus and Posts
- Wire it all up!

> 怎么看 `pod` 或 `depl` 的 `clusterIP` 呢？其实就是 `k get services` ，然后看 `name` 即可，这时我们就可以在 `Cluster` 里使用那么访问到这个 `pod`

Adding More Services

- For 'comments', 'query', 'moderation'...
- Update the URL's in each to reach out to the 'event-bus-srv'
- Build images + push them to docker hub
- Create a depolyment + clusterIP service for each
- Update the event-bus to once again send events to 'comments', 'query', 'moderation'

> 那么久开始再造剩余服务，这三个服务器都依赖总线，改起来也灰常简单，真的有点感觉了。

![040](/images/040.png)

> 把剩余服务整完，启动 `query` 服务后发现，创建前的事务也 `同步`过来了，`Event Store` 、 `CQRS` 真心不错。

```bash
~/git/microservices-with-react-and-nodejs/blog/posts on  master! ⌚
$ k describe pod query-depl-77b8cc9684-hqhbr
Name:         query-depl-77b8cc9684-hqhbr
Namespace:    default
Priority:     0
Node:         minikube/192.168.99.100
Start Time:   Tue, 17 Aug 2021 15:38:45 +0800
Labels:       app=query
              pod-template-hash=77b8cc9684
Annotations:  <none>
Status:       Running
IP:           172.17.0.7
IPs:
  IP:           172.17.0.7
Controlled By:  ReplicaSet/query-depl-77b8cc9684
Containers:
  query:
    Container ID:   docker://e41ea415d2e24bb9fe5ce3a470ef9b37cefb359d588d159a3510c99f7d191057
    Image:          registry.cn-shenzhen.aliyuncs.com/444/m-blog-query:latest
    Image ID:       docker-pullable://registry.cn-shenzhen.aliyuncs.com/444/m-blog-query@sha256:2a4cd605c80df6c4f487836a2831a7dcdce26b1a4b693e936e7298695a665058
    Port:           <none>
    Host Port:      <none>
    State:          Running
      Started:      Tue, 17 Aug 2021 15:38:50 +0800
    Ready:          True
    Restart Count:  0
    Environment:    <none>
    Mounts:
      /var/run/secrets/kubernetes.io/serviceaccount from default-token-kt77w (ro)
Conditions:
  Type              Status
  Initialized       True
  Ready             True
  ContainersReady   True
  PodScheduled      True
Volumes:
  default-token-kt77w:
    Type:        Secret (a volume populated by a Secret)
    SecretName:  default-token-kt77w
    Optional:    false
QoS Class:       BestEffort
Node-Selectors:  <none>
Tolerations:     node.kubernetes.io/not-ready:NoExecute op=Exists for 300s
                 node.kubernetes.io/unreachable:NoExecute op=Exists for 300s
Events:
  Type    Reason     Age    From               Message
  ----    ------     ----   ----               -------
  Normal  Scheduled  7m52s  default-scheduler  Successfully assigned default/query-depl-77b8cc9684-hqhbr to minikube
  Normal  Pulling    7m51s  kubelet            Pulling image "registry.cn-shenzhen.aliyuncs.com/444/m-blog-query:latest"
  Normal  Pulled     7m47s  kubelet            Successfully pulled image "registry.cn-shenzhen.aliyuncs.com/444/m-blog-query:latest"
  Normal  Created    7m47s  kubelet            Created container query
  Normal  Started    7m47s  kubelet            Started container query
```

> 看下 `pod` 的健康状况
>
> 现在 docker 的 `cli` 命令也和 `k8s` 的靠拢了，以后进来改掉原来的 `docker-cli` 习惯

#### 关于怎么导入流量

![041](/images/041.png)

方案一：此方案肯定不行。要管理多个NodePort的服务，况且它也扛不住，只能用来开发。对了而且这个端口多数情况是随机，也能手动固定。

![042](/images/042.png)

- Load Balancer Service：Tells k8s to reach out to its provider and provision a load balancer. Gets traffic in to a single pod
- Ingress or Ingress Controller: A pod with a set of routing rules to distribute traffic to other services

![043](/images/043.png)

#### ingress

> service时有说了暴露了service的三种方式ClusterIP、NodePort与LoadBalance，这几种方式都是在service的维度提供的，service的作用体现在两个方面，对集群内部，它不断跟踪pod的变化，更新endpoint中对应pod的对象，提供了ip不断变化的pod的服务发现机制，对集群外部，他类似负载均衡器，可以在集群内外部对pod进行访问。但是，单独用service暴露服务的方式，在实际生产环境中不太合适：
>
> 1.ClusterIP的方式只能在集群内部访问。
> 2.NodePort方式的话，测试环境使用还行，当有几十上百的服务在集群中运行时，NodePort的端口管理是灾难。
> 3.LoadBalance方式受限于云平台，且通常在云平台部署ELB还需要额外的费用。
>
> 所幸k8s还提供了一种集群维度暴露服务的方式，也就是ingress。ingress可以简单理解为service的service，他通过独立的ingress对象来制定请求转发的规则，把请求路由到一个或多个service中。这样就把服务与请求规则解耦了，可以从业务维度统一考虑业务的暴露，而不用为每个service单独考虑。
>
> 举个例子，现在集群有api、文件存储、前端3个service，可以通过一个ingress对象来实现图中的请求转发：

![044](/images/044.png)

`ingress` 规则是很灵活的，可以根据不同域名、不同 `path` 转发请求到不同的 `service` ，并且支持 `https`/`http。`

[k8s ingress原理](https://segmentfault.com/a/1190000019908991)

```yaml
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  name: ingress-srv
  annotations:
    kubernetes.io/ingress.class: nginx
spec:
  rules:
    - host: posts.com
      http:
        paths:
          - path: /posts
            backend:
              serviceName: posts-clusterip-srv
              servicePort: 4000
```

- 这里有 `posts.com`，因为 `vm=VirtualBox` 所以在hosts修改 posts.com 到 `minikube ip`

> 太屌了，炸裂了。

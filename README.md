# microservices-with-react-and-nodejs

> Build, deploy, and scale a Microservices built with Node, React, Docker and Kubernetes.

## Menu

01. Fundamental Ideas Around Microservices
02. A Mini-Microservices App
03. Running Services with Docker
04. Orchestrating Collections of Services with Kubernetes
05. Architecture of Multi-Service Apps
06. Leveraging a Cloud Environment for Development
07. Response Normalization Strategies
08. Database Management and Modeling
09. Authentication Strategies and Options
10. Testing Isolated Microservices
11. Integrating a Server-Side-Rendered React App
12. Code Sharing and Reuse Between Services
13. Create-Read-Update-Destroy Server Setup
14. NATS Streaming Server - An Event Bus Implementation
15. Connecting to NATS in a Node JS World
16. Managing a NATS Client
17. Cross-Service Data Replication In Action
18. Understanding Event Flow
19. Listening for Events and Handling Concurrency Issues
20. Worker Services
21. Handling Payments
22. Back to the Client
23. CI/CD

## Notes

![nats1](images/nats.jpg)

## Chapter

### 01-微服务基础

- 搞微服务之前，不得不先看看 `单体应用`

![001](images/001.png)
![002](images/002.png)
![003](images/003.png)

- Each service gets its own databse (if it needs one)

![003](images/ch01/003.png)

- With microservices, we store and access data sort of strange way (果真有点奇怪 😂)

- Services will never, ever reach into another services database

![004](images/ch01/004.png)

![004](images/004.png)

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

![008](images/ch01/007.png)

- 同步通信

举个例子：

![005](images/005.png)

- 同步通信要点
  - Conceptually easy to understand! (概念很简单)
  - Service D won't need a databse! (服务器不需要依赖数据库)
  - introduces a dependency between services (引入一个依赖在各服务之间！而不是A去调B、C，我以前真是这么干的)
  - If any inter-service request fails, the overall request fails (其中任何一个子服务出错，则整个业务链上的请求也出错)
  - The entire request is only as fast as the slowest request (一个完整的请求是否完成得看最慢的哪一个子请求)
  - Can easilty intoduce webs of requests (好处？轻松接入各种web请求)

举个同步通信的例子 🌰

![006](images/006.png)

![010](images/ch01/010.png)

如上图所示，要是各个服务用同步通信，开发到后期真的如乱麻一把难缠了，快点祭出 “异步通信” 吧。

![007](images/007.png)

为每个服务配置独立数据库，并且用异步通信这也的设计模式看上去诡异又低消！

![008](images/008.png)

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

![009](images/009.png)

> 在单体应用中，毕竟在一个数据库里的不同的表，很好解决！

![010](images/010.png)

> 但在微服务中，怎么解决呢？

![011](images/011.png)

同步方案：意思还是来个同步通信了。

![012](images/012.png)

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

![012x](images/012x.png)

> 在 mini 系统里，所有服务都监听着 Event Bus 的消息，就是自己服务发生的一件事且是自己发出来的，也会收到 `总线` 的回馈。

独立一个 Query-Service 出来有利有弊吧

- 利：减少了数据库查询次数
- 弊：增加事务、增加数据不一致的可能性，实时性要求较高的系统不合适
- 这应该算是 CQRS 命令查询职责分离
- 也可以是简单的资源合并

![013x](images/013x.jpeg)

新增功能：评论审核机制

![014](images/014.png)

![015](images/015.png)

- The query service is about presentation logic
- It is join ing two resources right now (posts and comments), but it might join 10!
- Does it make sense for a presentation service to understand how to process a very precise update?
- Query-Service 只和展示有关，数据跟新和他没关系，所说方案二不可行
- 而且未来随着功能越来越多，代码会越来越冗余！它要处理的事件太多，其实我们只需要要 query-service 只关注一件事 `CommentUpdated` 即可

![016](images/016.png)

![017](images/017.png)

如何处理事件丢失的情况

![018](images/018.png)

![021](images/021.png)

我们设想这么一个场景：如果 Query 或者 Moderation 服务失效，则 Comments 服务的数据是一定变了，但 Query 服务的数据没变，这就是数据不一致问题，也就是个事务的不完整性，那该怎么解决数据存储的不一致性问题呢？

- 如下有三种方式：
  - 第一种 `“同步请求”`：每次来请求了，两边数据源都问一遍！😂
  - 第二种 `“直连数据库”`：不说了，不可能！
  - 第三种：`“存储事件消息”`：目前比较合适的方案，这个方案的确是CQRS！
    - 老哥一直在给 NATS 作铺垫，原生自带解决方案嘛

![019](images/019.png)

![020](images/020.png)

![022](images/022.png)

- 让总线把错误的事件先存下来，等那个消费消息失败的服务重新上线了，再发送出来。
- NATS 原生功能，而且还带序号的
- 也不是只存储未消费的消息，而是全部都存储起来

![023](images/023.png)

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

![024](images/024.png)

![025](images/025.png)

![026](images/026.png)

Why Docker ?

- running our app right now makes big assumptions about out environment
- running our app requires precise knowledge of how to start it (npm start)
- Docker solves both these issues. Containers wrap up everything that is needed for a program + how to start run run it

Why k8s ?

- K8s is a tool for running a bunch of different containers
- We give it some configuration to describe how we want our containers to rn and interact with each other

![027](images/027.png)

![028](images/028.png)

> 都是些基操！

![029](images/029.png)

![030](images/030.png)

![031](images/031.png)

![032](images/032.png)

> `kubectl apply -f posts.yaml`

![033](images/033.png)

![034](images/034.png)

![036](images/036.png)

方法一：修改配置文件里的版本号，更新`deployment`

> 此方法不可行，远程服务器一多，改的配置文件也多，麻烦！

![035](images/035.png)

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

![037](images/037.png)

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

![038](images/038.png)

> 简直玩死人！macOS+docker的minikube 网络访问是个坑，玩了个一个半小时，换vm才可以！直接从23点坑到1点多，搞死！

```bash
$ minikube start --registry-mirror=https://registry.docker-cn.com --kubernetes-version=1.18.8 --driver=virtualbox

$ minikube ip
192.168.99.100

$ minikube service posts-srv --url
http://192.168.99.100:31557
```

#### ClusterIP的正确用法

![039](images/039.png)

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

![040](images/040.png)

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

![041](images/041.png)

方案一：此方案肯定不行。要管理多个NodePort的服务，况且它也扛不住，只能用来开发。对了而且这个端口多数情况是随机，也能手动固定。

![042](images/042.png)

- Load Balancer Service：Tells k8s to reach out to its provider and provision a load balancer. Gets traffic in to a single pod
- Ingress or Ingress Controller: A pod with a set of routing rules to distribute traffic to other services

![045](images/045.png)

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

![044](images/044.png)

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

#### Skaffold

- Automates many tasks in a k8s dev environment
- Makes it really easy to update code in a running pod
- Makes it really easy to create/delete all object tied to a project at once
- [skaffold.dev](https://skaffold.dev/)

### 05-Architecture of Multi-Service Apps

- the big challenge in microservices is data
- different ways to share data between services. We are going to focus on async communication
- async communication focuses on communication using events sent to an event bus
- async communication encourages each service to be 100% self-sufficient. Relatively easy to handle temporary downtime or new service creation
- Docker makes it easier to package up services
- K8s is a pain to setup, but makes it really to deploy + scale service

![046](images/046.png)

- We are going to make some big changes to our development process for this next project
- You might really dislike me for some of these decisions
- I wouldn't do this if i didn't think it was absolutely, positively the right way to build microservices

#### Ticketing App

- Users can list a ticket for an event (concert, sports) for sale
- Other users can purchase this ticket
- Any user can list tickets for sale and purchase tickets
- When a user attempts to purchase a ticket, the ticket is 'locked' for 15 minutes. The user has 15 minutes to enter their payment info.
- While locked, no other user can purchase the ticket. After 15 minutes, the ticket should 'unlock'
- Ticket prices can be edited if they are not locked

![047](images/047.png)

![048](images/048.png)

- We are creating a separate service to manage each type of resource
- Should we do this for every microservices app?
- Probably not? Depends on your use case, number of resources, business logic tied to each resource, etc
- Perhaps 'feature-based' design would be better

![049](images/049.png)

![050](images/050.png)

![051](images/051.png)

- `docker build -t registry.cn-shenzhen.aliyuncs.com/444/ticketing-auth .`
- `docker login`
- `docker push registry.cn-shenzhen.aliyuncs.com/444/ticketing-auth`
- `k8s-deploment`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: auth
  template:
    metadata:
      labels:
        app: auth
    spec:
      containers:
        - name: auth
          image: registry.cn-shenzhen.aliyuncs.com/444/ticketing-auth
---
apiVersion: v1
kind: Service
metadata:
  name: auth-srv
spec:
  selector:
    app: auth
  ports:
    - name: auth
      protocol: TCP
      port: 3000
      targetPort: 3000
```

> `Service` 的默认 `type: ClusterIP`，可以不写！！！

- 配置 `skaffold`

```yaml
apiVersion: skaffold/v2alpha3
kind: Config
deploy:
  kubectl:
    manifests:
      - ./infra/k8s/*
build:
  local:
    push: false
  artifacts:
    - image: registry.cn-shenzhen.aliyuncs.com/444/ticketing-auth
      context: auth
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: 'src/**/*.ts'
            dest: .
```

![052](images/052.png)

不能任由某一个服务个性化的错误格式返回，我们得统一错误返回的格式

![053](images/053.png)

如何统一错误对象？把所有已知场景全部列出来，然后分析共同需要达到的目的，最后给出结构即可。

![054](images/054.png)

![055](images/055.png)

We want an object like an 'Error', but we want to add in some more custom properties to it

> Usually a sign you want to subclass something!

![056](images/056.png)

![057](images/057.png)

> 不要在 error-middlaware 中处理业务，而是把业务放在具体的每个错误类里。

我们在给全局 `Error` 再套一层壳子，这也所有我们具体业主的错误类就可以继承这个壳子，目前有两个选择：1.接口 和 2.抽象类

![059](images/059.png)

![060](images/060.png)

现在既然有了自定义错误类，那如何新增一个错误类呢？

- 定义一个类，重写所有抽象类的字段
- 构造函数定义默认的 message 字符串

> k8s中部署 MongoDB 真有意思

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-mongo-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: auth-mongo
  template:
    metadata:
      labels:
        app: auth-mongo
    spec:
      containers:
        - name: auth-mongo
          image: mongo:4.4-bionic
          imagePullPolicy: IfNotPresent
---
apiVersion: v1
kind: Service
metadata:
  name: auth-mongo-srv
spec:
  selector:
    app: auth-mongo
  ports:
    - name: db
      protocol: TCP
      port: 27017
      targetPort: 27017
```

![060](images/061.png)

对了，接下来就是 `mongoose` + `js` 的诟病，无法知晓属性类型嘛，怎么利用 `TS` 呢？

```js
new User({ email: '123@123.com', password: '123123' })
```

![062](images/062.png)

![063](images/063.png)

> 我们的目标 -> `Creating the Model with TS`

- Type checking User Properties
- Adding Static Properties to a Model

一段美丽的代码

```ts
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export class Password {
  static async toHash(password: string) {
    const salt = randomBytes(8).toString('hex');
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;

    return `${buf.toString('hex')}.${salt}`;
  }

  static async compare(storedPassword: string, suppliedPassowrd: string) {
    const [hashedPassword, salt] = storedPassword.split('.');
    const buf = (await scryptAsync(suppliedPassowrd, salt, 64)) as Buffer;

    return buf.toString('hex') === hashedPassword;
  }
}
```

### 09-Authentication Strategies and Options

![064](images/064.png)

#### Fundamenttal Options 1

![065](images/065.png)

> Individual services rely on the auth service

- 每个需要登录信息的服务都要依赖 `auth` -> ❌
- 关键这个请求还是同步请求 -> ❌
- 一旦 `auth` 挂了，整个与之相关的所有业务都停滞无法使用，`cluster` 挂彩 -> ❌

#### Fundamenttal Options 1.1

![066](images/066.png)

#### Fundamenttal Options 2

![067](images/067.png)

![068](images/068.png)

![070](images/070.png)

![071](images/071.png)

![072](images/072.png)

![073](images/073.png)

![074](images/074.png)

![075](images/075.png)

> 在 SSR 中解决首次渲染问题的方案就是，登录成功时不仅返回 jwt 还要设置 cookies
>
> 那么就可以在授权期内，使用cookie中不加密的jwt完成首次渲染没法获取登录信息的问题

#### Securely Storing Secrets with Kubernetes

![076](images/076.png)

![077](images/077.png)

> `kubectl create secret generic jwt-secret --from-literal=JWT_KEY=1234`

```yaml
spec:
  containers:
    - name: auth
      image: registry.cn-shenzhen.aliyuncs.com/444/ticketing-auth
      env:
        - name: JWT_KEY
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: JWT_KEY
```

> 这里的 `secretKeyRef-name` 写错会有提示！ -- `CreateContainerConfigError`。 而且 `pod` 状态都会异常

![078](images/078.png)

为了统一，我们必须将不同服务+数据库的返回格式JSON统一。

那么就有一个问题，user 集合里的 password。

```js
{
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.password;
      delete ret.__v;
    },
  },
}
```

![079](images/079.png)

### 10 Testing Isolated Microservices

![080](images/080.png)

![081](images/081.png)

![082](images/082.png)

![083](images/083.png)

![084](images/084.png)

![085](images/085.png)

![086](images/086.png)

- `yarn add -D @types/jest @types/supertest jest ts-jest supertest mongodb-memory-server`

![087](images/087.png)

- 在测试登录时，可以在全局global添加一些方法，保存登录token，因为每个函数都是独立作用域，没法全局保存一个登录信息，避免每次登录

### 11.Integrating a Server-Side-Rendered React App

![088](images/088.png)

- We will be writing the Next app using javascript, not typescript
- It would be normally be beneficial to use TS, bug this app in particular would need a lot of extra TS stuff written out for little benefit

> 老哥的意思是前端并非本课重点，而且使用 `TS` 会增加代码量，间接增加前端课程的时间，所以为了突显终点前端项目就用 `JS`

重要提示

> `nextjs` 在 `k8s` 和 `skaffold` 中监听代码变化时必须加载如下配置：

```js
module.exports = {
  webpackDevMiddleware: (config) => {
    config.watchOptions.poll = 300;
    return config;
  },
};
```

![089](images/089.png)

#### 🔥 Fetching Data During SSR in Cluster

> ☢️ 🌝 🍥 ⭕️ 重点来了

```js
// 注意这里不能这么用！
LandingPage.getInitialProps = async context => {
  // const res = await axios.get('/api/users');
  // ...
  // return res.data;
};
```

- 以上代码存在一个问题，不区分服务端和客户端环境，服务端的请求地址和客户端的请求地址不一样
  - 服务端用的是 `k8s` 里的 `clusterIP`
  - 客户端用的是 `外网地址`
  - 区别可大了 😂
- 所以呢，我们应该构建一个请求 `request`，让它知道自己是在服务端环境还是客服端环境 !!!

![090](images/090.png)

![091](images/091.png)

![092](images/092.png)

![093](images/093.png)

![094](images/094.png)

![095](images/095.png)

![096](images/096.png)

> [重点] We access services using that 'http://auth-srv' style only wen they are in the same namespace

- **开着 v2ray 全局模式** `k8s` 的 `ingress` 就失效
- k8s 集群内部访问套路：**servicename.namespacename.svc.cluster.local**

> 一个 `minikube` 参数搞了我4个小时，这个 `k8s` 简直玩死人。
>
> 这个集群内部或跨命名空间访问是如此重要，必须鼓着搞出来，要不然业务线会短啊！

#### minikube ingress 启动但没服务或服务没80端口问题

先看症状：

```bash
$ k get namespaces
NAME              STATUS   AGE
default           Active   8d
kube-node-lease   Active   8d
kube-public       Active   8d
kube-system       Active   8d
```

- 如上所示，没有常规的 `ingress-nginx` 命名空间!
- 其实是隐藏在 `kube-system`

```bash
$ k get services -n kube-system
NAME                                 TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)                   AGE
ingress-nginx-controller-admission   ClusterIP   10.101.117.241   <none>        443/TCP                   7d23h
kube-dns
```

- 哦豁，有个很像的 `service` `ingress-nginx-controller-admission`
- 但老狗的没 80 端口肯定不对

> 🚀 🚀 🚀 🚀 **解决方案** 🚀 🚀 🚀 🚀

- 首先: `kubectl expose deployment ingress-nginx-controller --target-port=80 --type=ClusterIP -n kube-system`
  - 没有开80和443的 `ingress-nginx-controller`，我手动加一个
- 最后启动时 `'minikube start --vm=true'`
  - 因为使用 `docker` 驱动时，我在 `MacOS` 没法成功，所以用 `virtualbox` ，所以务必加上 `--vm=true` 参数
  - `minikube start --registry-mirror=https://registry.docker-cn.com --kubernetes-version=1.18.8 --driver=virtualbox --vm=true`
- 最后再重复一遍：集群内部访问service的套路是 **servicename.namespacename.svc.cluster.local**

#### Service 解决了什么问题

![097](images/097.png)

- 我们应该如何为一个 `Pod` 建立一个抽象，让另一个 `Pod` 找到它呢？
  - 答案：`Service`
  - 每一个 `Service` 都是一组 `Pods` 的逻辑集合

![098](images/098.png)

![099](images/099.png)

> 上图仅为集群内访问示意图！

- 默认的 `Service` 就是 `Cluster`
- `Service-A` 要访问 `Service-hello`
- 如果在同一命名空间 `default` 的话，直接访问 `Service-Name` 即可访问，也可以在后面点一个命名空间
- 也可以 `hello.default.svc.cluster.local`

> 我一直有个疑问，为啥子 Pod 不能直接被访问？
>
> 因为如果 pod 直接被访问，逻辑就缺失很多，功能覆盖性就要少很多，真是一点抽象泄漏都没有！

- 在 k8s 中，A 访问 B 服务，如果 B 服务是一个还没有部署的服务，我们是不知道 B 服务的 IP 或者 域名 是多少。
- 那么我们在编写 A 服务的代码时，如何描述 B 服务的 **访问地址** 呢？
- 其实我们可以给这个 B 服务的访问地址定义一个 **名字**，当 B 服务部署时，自动解析并去DNS注册这个 **名字** 即可。
- 这就是 k8 内部的 `服务发现` 机制！

```yaml
apiVersion: v1
kind: Service
metadata:
  name: hello
spec:
  selector:
    app: hello
  ports:
    - name: http
      protocol: TCP
      port: 80
      targetPort: 80
      nodePort: 30080
  type: NodePort
```

![100](images/100.png)

> 我们在集群里 `nextjs` 做服务端渲染时，记得把 `req.headers` 传递下去

![101](images/101.png)

- 为什么要运行两次 `getInitialProps` ？
- 一次在 `Custome_AppComponent` 中，一次又在 `IndexPage` 中
- 在 `IndexPage` 中的每次刷新都执行
- 其实可以在 `Custome_AppComponent` 中的使之传递下来即可

![102](images/102.png)

> 我只能管理到我儿子辈的，我可以传，也可以不传，我还可以拿到儿子辈的东西。

### 12 Code Sharing and Reuse Between Services

- ❓ What about event-related stuff for the auth service?
- ❓ It turns out that no other services really need to know about what the auth service is doing?
- ❓ Everything the auth service does is exposed through that JWT in the cookie

![103](images/103.png)

js的代码复用一般有三种办法

- #1 - Direct Copy Paste
- #2 - Git Submodule
- #3 - NPM Package (也可以自己搭私服)

- There might be differences in out TS settings between the common lib and our services - don't want to deal with that
- Service might not be written with TS at all!
- Our common library will be written Typescript and published as Javascript

- 在单独使用共享库时，更新库使用 `npm update @js-ticketing/common`
- 发布了新的 common 库，最好去关联pod或容器内看看是否用上了最新的库

### 13 Create-Read-Update-Destroy Server Setup

Ticketing Service Overview

![104](images/104.png)

- ``

----

### Docker

Why use Docker ?

> Docker makes it really easy to install and run software without worrying about setup or dependencies.

![d001](images/docker/d001.png)

![d002](images/docker/d002.png)

![d004](images/docker/d004.png)

![d005](images/docker/d005.png)

![d006](images/docker/d006.png)

![d007](images/docker/d007.png)

![d008](images/docker/d008.png)

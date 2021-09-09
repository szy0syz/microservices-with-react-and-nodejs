# microservices-with-react-and-nodejs

> Build, deploy, and scale a Microservices built with Node, React, Docker and Kubernetes.

## Menu

1. Fundamental Ideas Around Microservices
2. A Mini-Microservices App
3. Running Services with Docker
4. Orchestrating Collections of Services with Kubernetes
5. Architecture of Multi-Service Apps
6. Leveraging a Cloud Environment for Development
7. Response Normalization Strategies
8. Database Management and Modeling
9. Authentication Strategies and Options
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

> 一直没想好怎么解释 A 服务调 B 服务的数据库的弊端，原来如此。

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
  - introduces a dependency between services (引入一个依赖在各服务之间！而不是 A 去调 B、C，我以前真是这么干的)
  - If any inter-service request fails, the overall request fails (其中任何一个子服务出错，则整个业务链上的请求也出错)
  - The entire request is only as fast as the slowest request (一个完整的请求是否完成得看最慢的哪一个子请求)
  - Can easilty intoduce webs of requests (好处？轻松接入各种 web 请求)

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
  - 第三种：`“存储事件消息”`：目前比较合适的方案，这个方案的确是 CQRS！
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

- Query Service 挂了，我 Posts 照样能写
- Moderation Service 挂了，我查询和下入照样 OK
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

- `Cluster IP` 取个号输入的 url 让 pord 可以再 k8s 的集群内部被访问！
- `Node Port` 让 pod 可以被“外网访问”，但都是用于开发测试
- `Load Balancer` 这才是正确的让 pod 被访问的正确方式，生产用
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

> 简直玩死人！macOS+docker 的 minikube 网络访问是个坑，玩了个一个半小时，换 vm 才可以！直接从 23 点坑到 1 点多，搞死！

```bash
$ minikube start --registry-mirror=https://registry.docker-cn.com --kubernetes-version=1.18.8 --driver=virtualbox

$ minikube ip
192.168.99.100

$ minikube service posts-srv --url
http://192.168.99.100:31557
```

#### ClusterIP 的正确用法

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

方案一：此方案肯定不行。要管理多个 NodePort 的服务，况且它也扛不住，只能用来开发。对了而且这个端口多数情况是随机，也能手动固定。

![042](images/042.png)

- Load Balancer Service：Tells k8s to reach out to its provider and provision a load balancer. Gets traffic in to a single pod
- Ingress or Ingress Controller: A pod with a set of routing rules to distribute traffic to other services

![045](images/045.png)

#### ingress

> service 时有说了暴露了 service 的三种方式 ClusterIP、NodePort 与 LoadBalance，这几种方式都是在 service 的维度提供的，service 的作用体现在两个方面，对集群内部，它不断跟踪 pod 的变化，更新 endpoint 中对应 pod 的对象，提供了 ip 不断变化的 pod 的服务发现机制，对集群外部，他类似负载均衡器，可以在集群内外部对 pod 进行访问。但是，单独用 service 暴露服务的方式，在实际生产环境中不太合适：
>
> 1.ClusterIP 的方式只能在集群内部访问。
> 2.NodePort 方式的话，测试环境使用还行，当有几十上百的服务在集群中运行时，NodePort 的端口管理是灾难。
> 3.LoadBalance 方式受限于云平台，且通常在云平台部署 ELB 还需要额外的费用。
>
> 所幸 k8s 还提供了一种集群维度暴露服务的方式，也就是 ingress。ingress 可以简单理解为 service 的 service，他通过独立的 ingress 对象来制定请求转发的规则，把请求路由到一个或多个 service 中。这样就把服务与请求规则解耦了，可以从业务维度统一考虑业务的暴露，而不用为每个 service 单独考虑。
>
> 举个例子，现在集群有 api、文件存储、前端 3 个 service，可以通过一个 ingress 对象来实现图中的请求转发：

![044](images/044.png)

`ingress` 规则是很灵活的，可以根据不同域名、不同 `path` 转发请求到不同的 `service` ，并且支持 `https`/`http。`

[k8s ingress 原理](https://segmentfault.com/a/1190000019908991)

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

- 这里有 `posts.com`，因为 `vm=VirtualBox` 所以在 hosts 修改 posts.com 到 `minikube ip`

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

> k8s 中部署 MongoDB 真有意思

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
new User({ email: '123@123.com', password: '123123' });
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
> 那么就可以在授权期内，使用 cookie 中不加密的 jwt 完成首次渲染没法获取登录信息的问题

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

为了统一，我们必须将不同服务+数据库的返回格式 JSON 统一。

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

- 在测试登录时，可以在全局 global 添加一些方法，保存登录 token，因为每个函数都是独立作用域，没法全局保存一个登录信息，避免每次登录

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
LandingPage.getInitialProps = async (context) => {
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

> 一个 `minikube` 参数搞了我 4 个小时，这个 `k8s` 简直玩死人。
>
> 这个集群内部或跨命名空间访问是如此重要，必须鼓着搞出来，要不然业务线会短啊！

#### minikube ingress 启动但没服务或服务没 80 端口问题

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
  - 没有开 80 和 443 的 `ingress-nginx-controller`，我手动加一个
- 最后启动时 `'minikube start --vm=true'`
  - 因为使用 `docker` 驱动时，我在 `MacOS` 没法成功，所以用 `virtualbox` ，所以务必加上 `--vm=true` 参数
  - `minikube start --registry-mirror=https://registry.docker-cn.com --kubernetes-version=1.18.8 --driver=virtualbox --vm=true`
- 最后再重复一遍：集群内部访问 service 的套路是 **servicename.namespacename.svc.cluster.local**

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
- 其实我们可以给这个 B 服务的访问地址定义一个 **名字**，当 B 服务部署时，自动解析并去 DNS 注册这个 **名字** 即可。
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

js 的代码复用一般有三种办法

- #1 - Direct Copy Paste
- #2 - Git Submodule
- #3 - NPM Package (也可以自己搭私服)

- There might be differences in out TS settings between the common lib and our services - don't want to deal with that
- Service might not be written with TS at all!
- Our common library will be written Typescript and published as Javascript

- 在单独使用共享库时，更新库使用 `npm update @js-ticketing/common`
- 发布了新的 common 库，最好去关联 pod 或容器内看看是否用上了最新的库

### 13 Create-Read-Update-Destroy Server Setup

Ticketing Service Overview

![104](images/104.png)

```ts
const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });
    console.log('Connected to MongoDb');
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000!!!!!!!!');
  });
};
```

#### 感悟1

> <span style="color: #e74c3c;font-size: 18px">好代码 -> 几乎一样</span>
>
> <span style="color: #e74c3c;font-size: 18px">烂代码 -> 千奇百怪</span>

原来听到这句话，当时不是很理解，现在真的被感觉出来了：

- 一个两年前的代码，美国人写的
- 一个一年前的代码，俄罗斯人写的
- 一个最近一周的代码，印度人写的

> <span style="color: #e74c3c;font-size: 17px">几乎一样！</span>

#### 测试先行

![105](images/105.png)

- 我们要写一个业务，框架已搭建好，只需要从流量入口开始写，那些是 `controller`
- 因为写入已经很明确，看上图所以可以先写测试用例

```ts
import request from 'supertest';
import { app } from '../../app';

it('has a route handler listening to /api/tickets for post requests', async () => {});

it('can only be accessed if the user is signed in', async () => {});

it('returns an error if an invalid title is provided', async () => {});

it('returns an error if an invalid price is provided', async () => {});

it('creates a ticket with valid inputs', async () => {});

// npm run test // -> 测试走起
```

![106](images/106.png)

![107](images/107.png)

### 14 NATS Streaming Server

![108](images/108.png)

![109](images/109.png)

![110](images/110.png)

#### NATS Streaming

- docs.nats.io
- NATS and NATS Streaming Server are two different things
- NATS Streaming implements some extraordinarily important design decisions that will affect our app
- We are going to run the official `nats-streaming` docker image in k8s. Need to read the image's docs.

```yaml
containers:
  - name: nats
    image: nats-streaming:0.17.0
    args:
      [
        '-p',
        '4222',
        '-m',
        '8222',
        '-hbi',
        '5s',
        '-hbt',
        '5s',
        '-hbf',
        '2',
        '-SD',
        '-cid',
        'ticketing',
      ]
```

- -cid, --cluster_id  `<string>`         Cluster ID (default: test-cluster)
- -hbi, --hb_interval `<duration>`       Interval at which server sends heartbeat to a client
- -hbt, --hb_timeout `<duration>`        How long server waits for a heartbeat response
- -hbf, --hb_fail_count `<int>`          Number of failed heartbeats before server closes the client connection
- -SD, --stan_debug=`<bool>`             Enable STAN debugging output

#### Big Notes on NATS Streaming

![111](images/111.png)

![112](images/112.png)

![113](images/113.png)

![114](images/114.png)

![115](images/115.png)

![116](images/116.png)

- `k port-forward nats-depl-8674c9d8b-z7qgc 4222:4222`

```json
"scripts": {
  "publish": "ts-node-dev --rs --notify false src/publisher.ts",
  "listen": "ts-node-dev --rs --notify false src/listener.ts"
},
```

#### Client ID Generation

- `NATS` 是不允许两个相同 `ClientID` 的存在 ❌
- 所以 listener 的ID `randomBytes(4).toString('hex')`

### Queue Groups

> 队列分组

![117](images/117.png)

![118](images/118.png)

- 只给分组里的一个 Listener 发送
- 没分组，但又监听那个频道的所有 Listener 都会收到
- NATS 就是如此之简单

```ts
  const subscription = stan.subscribe('ticket:created', 'orders-service-queue-group');
```

#### Manual Ack Mode

> 手动确认收到模式

```ts
const options = stan.subscriptionOptions().setManualAckMode(true);

const subscription = stan.subscribe(
  'ticket:created',
  'orders-service-queue-group',
  options
);
```

![119](images/119.png)

#### Client Health Checks

是时候看我们的 `NATS-Streaming` 了

- `http://localhost:8222/`
- `http://localhost:8222/streaming`
  - server - 服务端状态
  - store
  - clients: 多少个客户端和其统计
  - channels
  - `http://localhost:8222/streaming/channelsz`
  - `http://localhost:8222/streaming/channelsz?subs=1`

```json
{
  "cluster_id": "ticketing",
  "server_id": "g4fLu1bOVnS8CHONPcBJ9R",
  "now": "2021-08-28T06:52:48.594224213Z",
  "offset": 0,
  "limit": 1024,
  "count": 1,
  "total": 1,
  "channels": [
    {
      "name": "ticket:created",
      "msgs": 4,
      "bytes": 284,
      "first_seq": 1,
      "last_seq": 4,
      "subscriptions": [
        {
          "client_id": "2ae3ce9f",
          "inbox": "_INBOX.4HBRWIQAJ18FLBJW61DXM6",
          "ack_inbox": "_INBOX.g4fLu1bOVnS8CHONPcBJUr",
          "queue_name": "orders-service-queue-group",
          "is_durable": false,
          "is_offline": false,
          "max_inflight": 16384,
          "ack_wait": 30,
          "last_sent": 3,
          "pending_count": 0,
          "is_stalled": false
        },
        {
          "client_id": "8fa5936d",
          "inbox": "_INBOX.NOW3ZZ2LSD2WI92T2VIA7K",
          "ack_inbox": "_INBOX.g4fLu1bOVnS8CHONPcBJaD",
          "queue_name": "orders-service-queue-group",
          "is_durable": false,
          "is_offline": false,
          "max_inflight": 16384,
          "ack_wait": 30,
          "last_sent": 4,
          "pending_count": 0,
          "is_stalled": false
        }
      ]
    }
  ]
}
```

#### Graceful Client Shutdown

```ts
stan.on('close', () => {
  console.log('NATS connection closed!');
  process.exit();
})

process.on('SIGINT', () => stan.close());
process.on('SIGNTERM', () => stan.close());
```

- 📢 注意：只有做了优雅的退出，服务端的 `clients` 数量才是正常的，要不然还要麻烦 “别人”。

#### Core Concurrency Issues

> 关键并发问题

![120](images/120.png)

![121](images/121.png)

![122](images/122.png)

#### Solving Concurrency Issues

- We are working with a poorly designed system and relying on NATS to somehow save us
- We should revisit the service design
- If we redesign the system, a better solution to this concurrency stuff will present itself

> 真期待 🤔
>
> 是的，我们应该回头看看我们的 `mini-posts` 或许可以给我们什么解决灵感

![123](images/123.png)

#### 因分布式系统原因，待我们解决的问题

- 某一组 `Services` 集群里的某一个 `Service` 副本在处理业务是会 **失败** ❌
- 某一个 `Service` 副本一不小心会比其他副本运行的快 🚀
- NATS 消息总线以为某个已经 `挂彩` 的 `Service` 副本还活着 💀
- `Services` 集群里的副本有可能接口重复的消息 🌝 🌝

> 是时候解决以上这些老表了！👺

#### Concurrency Control with the Tickets App

> TODO

### 15 Connecting to NATS in a Node JS World

![124](images/124.png)

![125](images/125.png)

The Listener Abstract Class -> 👍🏻

> 优美的代码

```ts
abstract class Listener {
  private client: Stan;
  abstract subject: string;
  abstract queueGroupName: string;

  abstract onMessage(data: any, msg: Message): void;

  protected ackWait = 5 * 1000;

  constructor(client: Stan) {
    this.client = client;
  }

  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setManualAckMode(true)
      .setDeliverAllAvailable()
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName);
  }

  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    );

    subscription.on('message', (msg: Message) => {
      console.log(`Message received: ${this.subject} / ${this.queueGroupName}`);

      const patsedData = this.parseMessage(msg);

      this.onMessage(patsedData, msg);
    });
  }

  parseMessage(msg: Message) {
    const data = msg.getData();
    return typeof data === 'string'
      ? JSON.parse(data)
      : JSON.parse(data.toString('utf8'));
  }
}
```

![125](images/125.png)

- 我们应该把抽象与实现分离
- 毕竟这个是个微服务项目，所以把 `Class Listener` 放到公共代码，它的实现就散布在实际 `Service` 中即可

![126](images/126.png)

![127](images/127.png)

![128](images/128.png)

消息在通信过程中，我们应该把 subject 用枚举固定下来，千万不能用字符串，因为其不可控，导致data格式错乱，还会引起空指针。

![129](images/129.png)

代码正确的组织方式！

> 为了预防 `publisher` 昏头杂脑的发些数据，必须重构。

![130](images/130.png)

![131](images/131.png)

![132](images/132.png)

借鉴下 `mongoose`，我们开个单例

![133](images/133.png)

![134](images/134.png)

#### test ticket-created-publisher

- `skaffold dev`
- `k get pods`
  - nats-deploment 正常
  - 把它的 `4222` 手动测试映射出来
  - `k port-forward nats-depl-69b65fd545-xkcfk 4222:4222`
- 使用 `nats-test` 里的 `listener` 监听对应 `channel`
- `rest-api` 接口手动发包，创建 `ticket` ，看 `listener` 是否正常

```bash
NAME                                  READY   STATUS    RESTARTS   AGE
auth-depl-58d65454dc-vmggt            1/1     Running   0          70m
auth-mongo-depl-6cd58b78fb-9cp6v      1/1     Running   0          70m
client-depl-cfd877c6f-v57ld           1/1     Running   0          70m
nats-depl-69b65fd545-xkcfk            1/1     Running   0          70m
tickets-depl-f6b454654-69ftg          1/1     Running   0          70m
tickets-mongo-depl-8448df7874-5kp5k   1/1     Running   0          70m
```

![135](images/135.png)

> **非常完美**
>
> 些许感悟：距今(2021-09-01)十六个月前拿到教程，没有好好珍惜，直到快一年半后才幡然醒悟，600多集教程跟到330集，收获实在太大，坚持才会有质变啊！
>
> 跳出舒适区，痛并快乐！
>
> 还有就是认准一个东西是好的，就要一口不剩的全部吃完！😈 😈 😈

#### 修复一个测试问题

![136](images/136.png)

![137](images/137.png)

![138](images/138.png)

![139](images/139.png)

> 测试环境我们没有 `natsWrapper`

```ts
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

// 可以单独文件指定，最好在总的文件 setup.ts 中指定
jest.mock('../../nats-wrapper');

it('has a route handler listening to /api/tickets for post requests', async () => {
  const response = await request(app).post('/api/tickets').send({});

  expect(response.status).not.toEqual(404);
});
```

```ts
export const natsWrapper = {
  client: {
    publish: (subject: string, data: string, callback: () => void) => {
      callback();
    }
  }
}
// -------
export const natsWrapper = {
  client: {
    publish: jest
      .fn()
      .mockImplementation(
        (subject: string, data: string, callback: () => void) => {
          callback();
        }
      ),
  },
};
```

- 在使用消息系统时，为了确保消息发送正常，必须用 jest 做一个测试，保证事件消息一定被发出！

### 17 Cross-Service Data Replication In Action

![140](images/140.png)

![141](images/141.png)

- 只复制除了 `node_modules` 和 `src` 以外的支撑文件
- `docker build -t registry.cn-shenzhen.aliyuncs.com/444/ticketing-orders .`

![142](images/142.png)

一个消息发送的技巧

- 因为目前两个服务之间消息通信，如果A服务发给B服务，虽然A觉得发成功了，该有的都有，但例如ticketId不是合法的，B收到缺无法进行业务，这样就会出现分布式事务问题
- 所以为了尽可能减少这样跨服务之间的事务耦合，`发卡弯的连环车祸`问题，我们因竟可能在发出时就做好自我验证
- **减少出事的概率，自我认真检查**

```ts
router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('TicketId must be provided'),
  ],
  validateRequest,
  async (_: Request, res: Response) => {
    res.send({});
  }
);
```

#### 两个服务数据副本

![143](images/143.png)

---

### 18 Understanding Event Flow

![144](images/144.png)

![145](images/145.png)

### 19 Listening for Events and Handling Concurrency Issues

![146](images/146.png)

![147](images/147.png)

![148](images/148.png)

- 在分布式系统了，最啰嗦的就是这个数据一致性问题
- `Tickets-Service` 有一个原生的 `ticket` 实体，通过 `Message` 传到了 `Orders-Service`
- `Orders-Service` 接到了这个消息，把 `ticket` 实体保存下来，那么价格 `price` 有两份，唯一标识 `_id` 有两份，非常麻烦！
- 最终我们的在 `Orders-Service` 调整 `ID` 了，也就是从 source 起源地开始，把唯一标识符全部同步一致

#### 测试 orders 和 tickets 之间的通信

```bash
[tickets] Event published to subject ticket:created
[orders] Message received: ticket:created / orders-service
[tickets] Event published to subject ticket:created
[orders] Message received: ticket:created / orders-service
[orders] Message received: ticket:created / orders-service
[tickets] Event published to subject ticket:created
[tickets] Event published to subject ticket:created
[orders] Message received: ticket:created / orders-service
[tickets] Event published to subject ticket:updated
[orders] Message received: ticket:updated / orders-service
```

> 也是醉了，竟然收到在发送之前！
>
> 太屌了，竟然同步了！

#### Clear Concurrency Issues

> 搞清楚 “并发问题”

![149](images/149.png)

![150](images/150.png)

- 我们使用如下事务测试：
  - 1. 创建一个5元ticket
  - 2. 修改这个ticket的为10元
  - 3. 再次修改这个ticket的为15元
- 每次执行压力测试批量执行10000次
- 结果如下：

![151](images/151.png)

![152](images/152.png)

> 我真的为什么那么会画图啊？

加入了数据的版本控制后如下图所以：

![153](images/153.png)

![154](images/154.png)

![155](images/155.png)

> 从👆🏻上面的图可以看出来，我们在更新完某个资源后，要 await 它并把更新后的 version 字段和唯一键 ID 发送给消息中心，告诉它：我要更新 `ID=CQZ and version=1` 的某个资源！

#### OCC 优化并发控制的单元测试

> 屌到没朋友

```ts
it('implements optimistic concurrenty control', async (done) => {
  // Create an instance of a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: '123',
  });

  // Save the ticket to the database
  await ticket.save();

  // Fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // Make two separate changes to the ticket we fetched
  firstInstance?.set({ price: 10 });
  secondInstance?.set({ price: 15 });

  // Save the first fetched ticket
  await firstInstance?.save();

  // Save the second fetch ticket and expect an error
  await secondInstance?.save();

  try {
    await secondInstance?.save();
  } catch (error) {
    return done();
  }
  throw new Error('Should not reach this point');

  // expect(async () => {
  //   await secondInstance?.save();
  // }).toThrow();
});
```

```bash
 FAIL  src/models/__tests__/ticket.test.ts (10.893 s)
  ● implements optimistic concurrenty control

    VersionError: No matching document found for id "61343baa7437340cfd01b2f8" version 0 modifiedPaths "price"

      24 |
      25 |   // Save the second fetch ticket and expect an error
    > 26 |   await secondInstance?.save();
         |                         ^
      27 | });
      28 |

      at generateVersionError (node_modules/mongoose/lib/model.js:444:10)
      at model.Object.<anonymous>.Model.save (node_modules/mongoose/lib/model.js:500:28)
      at src/models/__tests__/ticket.test.ts:26:25
      at step (src/models/__tests__/ticket.test.ts:33:23)
      at Object.next (src/models/__tests__/ticket.test.ts:14:53)
      at fulfilled (src/models/__tests__/ticket.test.ts:5:58)
```

#### Who Updates Versions?

- When should we increment or include the 'version' number of a record with an event?
  - 啥时候我们应该增加或包含 version 版本号在一个事件中呢？
- Increment/include the 'version' number whenever the primary service responsible for a record emits an event to describe a create/update/destroy to a record
  - 每当负责记录的 **主要服务** 发出描述创建/更新/销毁记录的事件时，就应增加/包括 "版本 "号
  - 也就是说只有 record 的源头服务才能发送带有 version 的事件出来，让其他监听它的关联服务做优化并发控制！
  - 这个数据的源头服务就是指代写入的入口服务！
  - 一个写，其他的所有都是听。
  - 对的，就是这样！

我们按原来的 mini-posts 系统举例：

![156](images/156.png)

![157](images/157.png)

- Moderation-Service 无权直接更改 comment 实体，只能通知让 Comments-Service 自己来更新，这样的话，它自己更改了数据就会自己发送 CommentUpdated 事件，这样所有关联服务都会更新，省了一大麻烦 ——— 妙哉！

```bash
Test Suites: 5 passed, 5 total
Tests:       18 passed, 18 total
Snapshots:   0 total
Time:        11.871 s
Ran all test suites.
```

#### test Version Query

> 非常关键，必须要测试好！
>
> 批量走起！！

```js
const axios = require('axios');
const https = require('https');

const instance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

const cookie =
  'express:sess=eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcFpDSTZJall4TXpSak9UVTNaR1F6Tmpnd01EQXhPV05rTlRoa01DSXNJbVZ0WVdsc0lqb2lNVEl6UURFeU15NWpiMjBpTENKcFlYUWlPakUyTXpBNE5EazVOekY5Lk5seTQxSmRneENRR2hLMldHVTZSTVo0emtzT2gtV0xFZEZodWczOHEtbDgifQ==';

const doRequest = async (index) => {
  const { data } = await instance.post(
    `https://ticketing.dev/api/tickets`,
    {
      title: 'ticket',
      price: 5,
    },
    {
      headers: { cookie },
    }
  );

  await instance.put(
    `https://ticketing.dev/api/tickets/${data.id}`,
    {
      title: 'ticket',
      price: 10,
    },
    {
      headers: { cookie },
    }
  );

  await instance.put(
    `https://ticketing.dev/api/tickets/${data.id}`,
    {
      title: 'ticket',
      price: 15,
    },
    {
      headers: { cookie },
    }
  );

  console.log(`[${index}] - Request complete.`);
};

(async () => {
  for (let i = 0; i < 400; i++) {
    doRequest(i);
  }
})();
```

```bash
$ node batch-test.js
[16] - Request complete.
[123] - Request complete.
[5] - Request complete.
[13] - Request complete.
[2] - Request complete.
[20] - Request complete.
[21] - Request complete.
[6] - Request complete.
[18] - Request complete.
[12] - Request complete.
[7] - Request complete.
[1] - Request complete.
[0] - Request complete.
[15] - Request complete.
[19] - Request complete.
[4] - Request complete.
[43] - Request complete.
[50] - Request complete.
[51] - Request complete.
[52] - Request complete.
[30] - Request complete.
[34] - Request complete.
[10] - Request complete.
[26] - Request complete.
[56] - Request complete.
[64] - Request complete.
[66] - Request complete.
[69] - Request complete.
[70] - Request complete.
```

- console 的第一个框表示请求序号
- 看到没有，程序发出的请求序号是一定按顺序的，但返回已经乱序了！
- 我们就是为了测试版本原本执行是 A-1、2、3，B-1、2、3，C-1、2、3 (数字代表version)
- 但现在同时400并发的请求过来，A的1、2、3，能会被C的1的乱，不在按顺序了，所以我们现在到数据库检查下结果

```bash
k get pods
k exec -it orders-mongo-depl-69b8b978b7-jkwx4 sh
k exec -it tickets-mongo-depl-69c59bc4f7-255r6 sh

use tickets
use orders

db.tickets.remove({})
db.tickets.remove({})

# 跑并发脚本

db.tickets.find({price: 15}).length()
# 400

db.tickets.find({price: 15}).length()
# 400，两个服务中的数据一致性完全一样
# 但要注意，`console` 会报 `ticket not found` 的错误，但 `NATS` 会处理
```

Next Couple Videos

- Add the 'mongoose-update-if-current' module into the Orders model
- Fix up some tests - we are createing some Tickets in service without providing them an ID
- Fix up some route handler - we are publishing events around orders but not providing the version of the order

记录下 orders-model 增加OCC

- `model` 文件增加 `updateIfCurrentPlugin` 并使用
- `orderSchema.set('versionKey', 'version');`
- 在 `OrderDoc` 下新增 `version` 字段
- 不需要在 `OrderAttrs` 增加

#### Strategies for Locking a Ticket

> 票据的锁定策略

![158](images/158.png)

![159](images/159.png)

![160](images/160.png)

#### Missing Update Event

![161](images/161.jpg)

![162](images/162.jpg)

- 在 `Tickets-Service` 中，别忘记了在顶层初始化 `listener`实例
- 这样就能直接使用 `this.client` ，等等不对啊！？

#### Rejecting Edits of Reserved Tickets

只要 ticket 实体已经写入了 orderId 字段后，就不让再次编辑了。

#### 20 Worker Services

![163](images/163.png)

![164](images/164.png)

![165](images/165.png)

![166](images/166.png)

#### 如何新建一个服务

- 复制其他服务的如下文件到其根目录
  - `.dockerignore`
  - `Dockerfile`
  - `package.json`
  - `tsconfig.json`
- 再复制如下文件到 `/src/`
  - `index.ts`
  - `nats-wrapper.ts`
  - `__mocks__`

#### 到底 bull 是个什么？

![167](images/167.png)

![168](images/168.png)

![169](images/169.png)

![170](images/170.png)

> 幽默：expiration-depl 和 expiration-redis-depl 一起部署，有种坏的情况是，expiration-depl 连不到一起启动的 redis ，这时暂时杀死 expiration-depl 重启即可连接 redis ！

```bash
[orders] Message received: ticket:created / orders-service
[tickets] Event published to subject ticket:created
[tickets] Message received: order:created / tickets-server
[orders] Event published to subject order:created
[expiration] Message received: order:created / expiration-service
[expiration] I want to publish an expiration:complete event for OrderId 6136393432febc0018df3135
[orders] Message received: ticket:updated / orders-service
[tickets] Event published to subject ticket:updated
```

> ↑ 这些服务真是可爱的令人泪流满面！

#### 感悟2

原来接手的一个项目，使用单体应用来写，就有类似海量1、2、3、4、5、6、7、8、9分量子任务叠加，最后再加 `avi转mp4` 的巨耗资源的需求，写到最后代码无法修复，且极容易 **“爆”**，当时要是知道现在 “这条路” 就真的太好了！

#### Delaying Job Processing

```ts
export class ORderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupname;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {

    await expirationQueue.add(
      {
        orderId: data.id,
      },
      {
        delay: 10000,
      }
    );

    msg.ack();
  }
}
```

#### 如何处理 Expiration Event 和 Order Cancelled Event ？

```ts
export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName;

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId).populate('ticket');

    if (!order) {
      throw new Error('Order not found');
    }

    //! 千万不能在这里直接设置 ticket: null ，因为有OCC，我们需要加 version !!
    //! 况且这里加了好比我们一个事件处理了两个任务，这个也是违背了我们设计原则的 !!
    //! 也就是说，订到到期和订单取消，必须走两个事件 !!
    //  order.set({ ticket: null, status: OrderStatus.Cancelled });
    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    msg.ack();
  }
}
```

#### 如何测试 expiration-complete-listener.test

- 首先在 `setup` 里准备好数据和函数，因为每个 `it` 断言都是独立的作用域，相互不影响

- 测试 ExpirationCompleteListener 类的 onMessage 方法会不会修改订单状态为 “取消”

```ts
it('updates the order status to cancelled', async () => {
  const { listener, order, data, msg } = await setup();

  // 这里 data 是手动准备的 刚刚创建的订单数据
  // 我们测的就是 ExpirationCompleteListener 的 onMessage 方法
  // 对，是一个黑盒测试法！
  // 这个方法里 “一定会去数据库里改订单状态，并且调用msg.ack()”
  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});
```

- 测试发送一个 “取消订单的事件”，观察它的结果是否正确！！！

```ts
it('emit an OrderCancelled event', async () => {
  const { listener, order, data, msg } = await setup();

  // 📢 注意：只要一 await 就相当于发送事件出去了
  // 但是假的 nats 在处理事件
  await listener.onMessage(data, msg);

  // 确认下到底调用了 publish 方法没
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  // 确认下调用 publish 方法时传递的参数是否正确
  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  // 有必要看看为啥子上面这个转换可以执行！！看下面！

  expect(eventData.id).toEqual(order.id);
});
```

// 为什么 publish 方法可以这样搞，因为做了劫持注入，看下面！

```ts
export const natsWrapper = {
  client: {
    publish: jest
      .fn()
      .mockImplementation(
        (subject: string, data: string, callback: () => void) => {
          callback();
        }
      ),
  },
};
```

- 最后就简单了，测试下是否执行了消息回执

```ts

it('ack the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
```

### 21 Handling Payments

![171](images/171.png)

![172](images/172.png)

#### initial Payment Service

> 改服务是个包含 `http` ，要加 `express` ，后面我自己改成 `nestjs` 😂

- root下
  - `.dockerignore`
  - `Dockerfile`
  - `package.json`
  - `tsconfig.json`
- src下
  - `__mocks__`
  - `test`
  - `app.ts`
  - `index.ts`
  - `nats-wrapper.ts`

![173](images/173.png)

![174](images/174.png)

![175](images/175.png)

创建一个 `payments-service` 里的 `model`

```ts
import mongoose from 'mongoose';

interface OrderAttrs {}

interface OrderDoc extends mongoose.Document {}

interface OrderModel extends mongoose.Model<OrderDoc> {}
```

![176](images/176.png)

![177](images/177.png)

#### 想k8s中注入秘钥

- `k create secret generic stripe-secret --from-literal STRIPE_KEY=sk_test_......`
- `k get secrets`

![178](images/178.png)

![179](images/179.png)

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

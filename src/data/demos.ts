export interface Demo {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  keywords: string[];
  coverImage: string; //ratio: 2:1
  introduction: string;
  challenges: string;
  solution: string;
  screenshots: { desc: string; src: string }[]; //ratio: 4:3
  steps: string[];
  dataFlowImage?: string; // Made optional
  dataFlowMarkdown?: string; // Added for Mermaid.js content
  sqlExample: string;
  youtubeVideoLink?: string;
  demoLinks: {
    title: string;
    url: string;
    icon?: string;
    description?: string;
  }[];
}

export const demos: Demo[] = [
  {
    id: "cdc",
    title: "OLTP to OLAP Pipeline",
    subtitle:
      "Denormalize N+1 records in MySQL to a JSON doc, and Save in S3/GCS.",
    category: "Pipeline",
    keywords: ["cdc", "debezium", "kafka", "pipeline", "s3", "oltp", "olap"],
    coverImage: "cdc_cover.png",
    introduction: `It's common to design your OLTP database schema in the normalized way. For example, when a customer places an order with multiple line items, one row will be added to the "orders" MySQL table with a "orderNumber", and multiple rows to add in the "order_details" table with the same "orderNumber".

The goal is to create a JSON document for each order, with all line items aggregated, with the subtotal calculated, so that BigQuery can run SQL for those JSON files in GCS and no need to perform expensive JOINs.`,
    challenges: `1️⃣ You can capture database changes via tools like Debezium and make the change feed available in Apache Kafka. However since each order include 1 new row in "orders" and multiple rows in "order_details", the time stamp for those CDC messages are not exactly same. A naive JOIN by "orderNumber" and timestamp won't catch all changes.

2️⃣ Tumble window aggregations (say every 10s) can split one order across two windows if the customer adds items right at the edge

3️⃣ Sliding windows (hop) solve the split but now you get duplicate events

4️⃣ Global aggregation keeps everything in memory—great until your state grows to 100GB in a week…`,
    solution: `✨ Timeplus can seamlessly connect OLTP systems like MySQL, using technologies such as Debezium for Change Data Capture (CDC) and Kafka for streaming.

✨ Use a range join first, assuming all events for a single transaction arrive within 10 seconds. Join "orders" and "order_details" for the same ID within that time range, then use the order timestamp (not the event timestamp) to run your tumble window aggregation.

✨ This approach ensures data is ready for immediate analysis, without order splitting, no duplicate and small JOIN state.`,
    screenshots: [
      { desc: "Multiple tables in MySQL", src: "mysql.png" },
      { desc: "N+1 CDC messages in Kafka", src: "kafka_msg.png" },
      {
        desc: "Kafka external streams for read and GCS/S3 external table for write",
        src: "lineage.png",
      },
      {
        desc: "N+1 CDC messages turned to 1 JSON doc in S3/GCS",
        src: "gcs.png",
      },
      {
        desc: "Mutltiple JSON doc in each files in S3/GCS",
        src: "jsonl.png",
      },
      {
        desc: "JSON files can be querid by BigQuery/Looker",
        src: "bigquery.png",
      },
    ],
    steps: [
      "Create 2 tables in MySQL",
      "Set up Kafka Connect and Debezium MySQL Connector to load changes from MySQL",
      "Create External Streams in Timeplus to read data from those 2 Kafka topics",
      "Creaet an External Table in S3 type to write data to S3 or GCS",
      "Create a Materialized View to apply range join to enrich each order_details message with the order event, then apply tumble window join to aggregate line items for same order and send to S3/GCS ",
      "Optionally, you can set up BigQuery to scan the JSON files in GCS or use Looker to visualize them",
    ],
    dataFlowImage: "cdc_data_flow.png",
    sqlExample: `create external stream retailer_etl.topic_orders(raw string)
settings type='kafka', brokers='10.138.0.23:9092',topic='demo.cdc.mysql.retailer.orders';

create materialized view orders as
select _tp_time
, to_uint32_or_zero(raw:after.orderNumber) as orderNumber
, to_int16_or_zero(raw:after.orderDate) as orderDate
, to_int16_or_zero(raw:after.requiredDate) as requiredDate
, to_int16_or_zero(raw:after.shippedDate) as shippedDate
, raw:after.status as status
, raw:after.comments as comments
, raw:after.customerNumber::int16 as customerNumber
from retailer_etl.topic_orders settings seek_to='earliest';

create external stream retailer_etl.topic_orderdetails(raw string)
settings type='kafka', brokers='10.138.0.23:9092',topic='demo.cdc.mysql.retailer.orderdetails';

create materialized view details as ..

create external table retailer_etl.gcs(
  orderNumber uint32,
  customerNumber int16,
  orderDate int16,
  status string,
  orderTotal decimal(10,2),
  itemCount uint64,
  productCodes array(string)
)
SETTINGS type='s3',
  endpoint = 'https://storage.googleapis.com/timeplus-demo',
  access_key_id = '..', --HMAC access ID
  secret_access_key = '..', --HMAC secret key
  data_format='JSONEachRow',
  write_to = 'retailer_cdc/orders.jsonl',
  s3_min_upload_file_size=1024, --default 500MB, use 1KB for demo
  s3_max_upload_idle_seconds=60; --flush data after 1m

create materialized view pipeline into gcs as
with enriched_orderdetails as (
  select orders._tp_time as timestamp,*
  from details inner join orders
  on (details.orderNumber = orders.orderNumber)
  and date_diff_within(10s)
)
select orderNumber,any(customerNumber) as customerNumber,
        any(orderDate) as orderDate,any(status) as status,
        sum(priceEach*quantityOrdered)::decimal(10,2) as orderTotal,
        count( ) as itemCount,
        group_uniq_array(productCode) as productCodes
from tumble(enriched_orderdetails,timestamp,30s)
group by window_start,orderNumber;`,
    youtubeVideoLink:
      "https://www.youtube.com/embed/lTzSm2pMs-E?si=7NR8qbqq7m383OSS",
    demoLinks: [
      {
        title: "Kafka UI",
        url: "http://kafka.demo.timeplus.com:8080/topics/demo.cdc.mysql.retailer.orders",
        icon: "apachekafka_white.png",
        description: "View raw Kafka topics and messages",
      },
      {
        title: "Timeplus Enterprise",
        url: "https://timeplus.demo.timeplus.com",
        icon: "timeplus_logo.svg",
        description:
          "Login with demo/demo123. Check data lineage for retailer_etl namespace",
      },
    ],
  },
  {
    id: "opentelemetry",
    title: "OpenTelemetry + SQL",
    subtitle:
      "Collect logs, metrics and tracing via OpenTelemetry, export to Kafka, filter and aggregated by streaming SQL and build dashboards in Timeplus or Grafana.",
    category: "Observability",
    keywords: ["kafka", "opentelemetry", "grafana", "sql"],
    coverImage: "otlp_cover.png",
    introduction: `[OpenTelemetry](https://opentelemetry.io/) is a collection of APIs, SDKs, and tools. Use it to instrument, generate, collect, and export telemetry data (metrics, logs, and traces) to help you analyze your software’s performance and behavior.
You can install OpenTelemetry collectors on Linux and export data as JSON documents in Kafka topics and have Timeplus to run streaming ETL, routing, alerts and visualization.`,
    challenges: `1️⃣ While the OpenTelemetry schema is open and flexible, the exported JSON documents are usually with thousands of lines per messages, with nested structure. Parsing and filtering such complex JSON documents are not easy and error-prone.

2️⃣ Storing such complex JSON documents on Kafka and OLAP data warehouse lead to high cost of storage and computing

3️⃣ Metrics and logs across different machines are usually collated to understand the big picture or troubleshot issues. JOIN data across mulitiple data sources and ID is usually a challenge in Grafana, Splunk and other platforms. Timestamps for those collated events are close but not exactly same.`,
    solution:
      "This demo shows how Timeplus integrates with OpenTelemetry to provide a unified observability platform. Logs, metrics and tracing can be collected via open-source or 3rd party OpenTelemetry collector agents and pushed to Timeplus directly or via Kafka. \n\nTimeplus provides real-time processing with streaming SQL and custom filtering and aggregation, as well as built-in alerts and live visualization. By integrating with Grafana, Splunk, OpenSearch and other systems, Timeplus enables DevOps teams with immediate insights into system health and performance.",
    screenshots: [
      {
        desc: "Read OpenTelemetry data from Kafka and route to Splunk/OpenSearch",
        src: "lineage.png",
      },
      { desc: "Real-time dashboard in Timeplus", src: "timeplus_charts.png" },
      { desc: "Real-time dashboard in Grafana", src: "grafana.png" },
    ],
    steps: [
      "Install OpenTelemetry Collector on Linux machines",
      "Configure the collector to send cpu/memory/disk metrics to Kafka",
      "Create External Stream in Timeplus to read data from Kafka",
      "Parse and filter the complex JSON message in Timeplus with JSON Path",
      "Visualize the live metrics in Timeplus built-in dashboards",
      "Install plugin in Grafana to run streaming SQL for Timeplus and build dashboards",
      "Forward the logs and metrics to Splunk, OpenSearch and other systems",
    ],
    dataFlowMarkdown: `graph TD;
        A[Linux with OpenTelemetry Collector]-->K[Apache Kafka];
        K-->Timeplus-->Splunk;
        Timeplus-->OpenSearch;
        Grafana-->Timeplus;
`,
    sqlExample: `create external stream o11y.otlp_metrics (raw string)
settings type='kafka', brokers='10.138.0.23:9092',topic='otlp_metrics';

-- get average CPU load every minute per instance
select * except (rm,sm,metrics) from(
  select _tp_time, array_join(raw:resourceMetrics[*]) as rm
,(rm:resource.attributes[*][1]):value.stringValue as instance,rm:scopeMetrics[*][1] as sm,
replace_regex(sm:scope.name,'.*scraper/(.*)','\\1') as scope_name
,array_join(sm:metrics[*]) as metrics,metrics:description as metrics_desc
,(metrics:gauge.dataPoints[*][1]):asDouble::double as metrics_value
from o11y.otlp_metrics where scope_name='loadscraper' and metrics_desc='Average CPU Load over 1 minute.' settings seek_to='-1h'
);

create external stream sink.splunk_t1 (event string)
settings
type = 'http',
data_format = 'JSONEachRow',
http_header_Authorization='Splunk 8367dcdd-..1bb',
url = 'http://hec.splunk.demo.timeplus.com:8088/services/collector/event';

create materialized view o11y.mv_otel_kafka2splunk into sink.splunk_t1
as select raw as event from o11y.otlp_metrics;
    `,
    demoLinks: [
      {
        title: "Kafka UI",
        url: "http://kafka.demo.timeplus.com:8080/topics/otlp_metrics",
        icon: "apachekafka_white.png",
        description: "View raw JSON message in otlp_metrics Kafka topic",
      },
      {
        title: "Live Dashboard in Timeplus",
        url: "https://timeplus.demo.timeplus.com/default/console/dashboard/f38e1645-ea15-4f10-aa69-85f55440ff55",
        icon: "timeplus_logo.svg",
        description: "Login with demo/demo123",
      },
      {
        title: "Live Dashboard in Grafana",
        url: "https://grafana.demo.timeplus.com/d/a5246160-2353-42eb-8879-90d4a035d03e/real-time-observability",
        icon: "Grafana_logo.svg",
        description: "Login with demo/demo123",
      },
      {
        title: "Live Data in Splunk",
        url: "https://splunk.demo.timeplus.com/en-US/app/search/search?q=search%20index%3D%22test1%22%20sourcetype%3D_json",
        icon: "splunk_github.jpeg",
        description: "Login with demo/demo1234",
      },
      {
        title: "Live Data in OpenSearch",
        url: "http://opensearch.demo.timeplus.com:5601/app/dev_tools#/console",
        icon: "opensearch_mark_default.svg",
        description:
          "Login with demo/de1237!Mo, run the default query to match all events",
      },
    ],
  },
  {
    id: "ksql_alternative",
    title: "ksqlDB Alternative",
    subtitle: "Timeplus offers additional benefits compared to ksqlDB.",
    category: "Stream Processing",
    keywords: ["kafka", "sql", "database"],
    coverImage: "ksql_cover.png",
    introduction: `[ksqlDB](https://www.confluent.io/product/ksqldb/) is a stream processing engine designed specifically to read data from Apache Kafka topics, create stateless/stateful transformations, and write them back to Apache Kafka. Data then has to be landed in other dedicated downstream systems for rich query capability. It was renamed from KSQL to ksqlDB with limited capabilities to query some of the derived state from stream processing functions. These “ad-hoc” queries are limited to quick lookups via primary key equality or range queries..`,
    challenges: `1️⃣ Limited Query and Join Capabilities: ksqlDB does not have the capability to answer any ad-hoc queries as a database or data warehouse would. It can only do certain key based lookups or range lookups. The data can also be joined in very limited ways based on primary key lookups.

2️⃣ The performance of ksqlDB can be impacted by the time needed to serialize and deserialize data between Apache Kafka and RocksDB. The strong coupling to Kafka also has a big impact on performance: frequent data publication and retrieval from Kafka can increase latency and costs.


3️⃣ ksqlDB state stores are notoriously difficult to maintain due to limitations in TTL management and other storage configurations. State stores are backed in Apache Kafka and thus require way more storage and network bandwidth overall for high availability and resilience.`,
    solution:
      "Timeplus is designed from the ground up in C++ based on database technology (Clickhouse in this case) but extended for Stream Processing. It leverages Clickhouse libraries and data structures under the hood in its process for extremely fast database operations such as filtering, projection, and aggregations.\n\n&nbsp;\n\nFor stream processing, it has created a native stream data structure as a first class citizen which does not require any coupling  with Apache Kafka although it can integrate with it if required. This allows for a much simpler and more performant system for data ingestion, processing and analytics all in one single binary. Data products created within Timeplus can be pushed out to external systems via Streaming or or consumed via Ad-hoc querying. As such it can easily integrate into the wider ecosystem of systems that integrate with Apache Kafka or Database/BI Tools.",
    screenshots: [
      { desc: "Comparing Timeplus and ksqlDB", src: "dashboards.png" },
    ],
    steps: [
      "Create External Streams in Timplus to read or write Kafka",
      "Create Materialized Views for streaming data pipelines",
      "Write data to other systems such as ClickHouse/S3/Iceberg",
    ],
    dataFlowMarkdown: `graph TD;
        A[Apache Kafka Topic]-->T[Timeplus External Stream];
        P[Apache Pulsar Topic]-->T;
        T-->ClickHouse;
        T-->B[Other Kafka/Pulsar Topics];
`,
    sqlExample: `create external stream frontend_events (
    version int,
    requestedUrl string,
    method string,
    correlationId string,
    ipAddress string,
    requestDuration int,
    response map(string, int),
    headers map(string, string)
)
SETTINGS
type = 'kafka',
brokers = 'kafka.demo-internal:9092',
topic = 'owlshop-frontend-events';

-- self JOIN, which is not available in ksqlDB
SELECT
  c.cid, c.latitude, c.longitude, c.speed_kmh, b.bid
FROM
  car_live_data AS c
INNER JOIN bookings AS b ON c.cid = b.cid;

-- ASOF JOIN is not supported in ksqlDB
SELECT
  c.cid, c.latitude, c.longitude, c.speed_kmh, b.bid
FROM
  car_live_data AS c
ASOF JOIN bookings AS b ON (c.cid = b.cid)
AND to_time(c.time) >= to_time(b.time);
    `,
    demoLinks: [
      {
        title: "Live Demo in Timeplus",
        url: "https://demo.timeplus.cloud/ksql-alt/console/",
        icon: "timeplus_logo.svg",
        description: "Login with SSO, choose ksql demo workspace",
      },
      {
        title: "Kafka UI",
        url: "http://kafka.demo.timeplus.com:8080/topics/otlp_metrics",
        icon: "apachekafka_white.png",
        description: "View raw JSON message in otlp_metrics Kafka topic",
      },
      {
        title: "📝 Comparing Timeplus and ksqlDB",
        url: "https://www.timeplus.com/timeplus-vs-ksqldb",
        description: "White paper to compare those 2 products",
      },
    ],
  },
  {
    id: "kafka2ch",
    title: "Kafka To ClickHouse",
    subtitle:
      "Query data in Kafka with SQL, apply join and lookup and send high quality data to ClickHouse.",
    category: "Pipeline",
    keywords: ["kafka", "sql", "clickhouse", "streaming", "join"],
    coverImage: "kafak2ch_cover.png",
    introduction: `Apache Kafka is a common data source for real-time data. ClickHouse and a few other OLAP databases can consume data from Kafka, but with various limitations. Timeplus provides high-performance and flexible way to query data in Kafka, join with other data sources and send transformed data to ClickHouse or other descriptions.`,
    challenges: `1️⃣ The KafkaEngine in ClickHouse can connect ClickHouse with Kafka, but you cannot query tables in KafkaEngine directly in ClickHouse. You have to create Materialized Views to query Kafka data. This is not productive or flexible to explore the best way to run proper SQL query for the Kafka data.

2️⃣ ClickHouse Materialized Views do not support UNION operations or complex JOINs. This severely limits the ability to create denormalized records or to combine data from multiple sources, which is often necessary in real-world analytics scenarios.


3️⃣ ClickHouse Materialized Views can only operate on a single input table. This restricts the ability to create views that combine or correlate data from multiple sources (for example, JOIN data from 2 active Kafka topics), limiting their usefulness in complex data environments.

4️⃣ Materialized Views in ClickHouse are updated only when new data is inserted into the input table. This means that updates or deletions in the source data are not reflected in the view, potentially leading to inconsistencies.
`,
    solution: `Timeplus is a modern stream processing platform designed to handle real-time data with low latency supporting native streams as well as data from popular streaming platforms such as Apache Kafka. It excels in processing, joining, and preparing streaming data before it reaches the final storage system, e.g. ClickHouse. The benefits of adding Timeplus between Kafka and ClickHouse are:

✨ You can query Kafka data without having to set up materialized views. Explore the Kafka data using SQL or web console.

✨ Timeplus can run complex SQL to join data from multiple Kafka external streams, or apply lookups with other ClickHouse/MySQL/Postgres tables.

✨ Timeplus supports continuous and incremental stream processing, such as tumble, hop, session windows, watermark and out-of-order processing.`,
    screenshots: [
      {
        desc: "Read real-time data from one Kafka topic and set up complex pipelines to transform the data.",
        src: "lineage.png",
      },
    ],
    steps: [
      "Create Kafka External Stream in Timeplus to read data from Kafka",
      "Explore the Kafka data with ad-hoc SQL without having to create materialized views",
      "Create ClickHouse External Table to read from or write to ClickHouse",
      "Create Materialized Views with complex SQL to read multiple Kafka topics and send streaming transformed data to ClickHouse",
    ],
    dataFlowMarkdown: `graph TD;
        K[Apache Kafka]-->T[Timeplus]-->ClickHouse;
`,
    sqlExample: `-- read from a Kafka topic
create external stream eventstream(raw string)
SETTINGS type = 'kafka', brokers = 'kafka.demo.timeplus.com:9092',
topic = 'owlshop-frontend-events', sasl_mechanism = 'PLAIN',
username = 'demo', password = 'demo123', security_protocol = 'SASL_SSL',
skip_ssl_cert_check = true;

-- set up a external table to write to remote ClickHouse
create external table default.http_code_count_5s
SETTINGS type = 'clickhouse', address = 'clickhouse.demo.timeplus.com:9000',
user = 'demo', password = 'demo123', database = 'demo',
table = 'http_code_count_5s';

-- create a materialized view as a streaming data pipeline
create materialized view mv_5s_tumble_then_join into http_code_count_5s as
with statuscode as(
    select _tp_time, cast(raw:response.statuscode, 'uint8') as code
    from eventstream
  ), countbystatus as(
    select window_start, code, count() as views
    from tumble(statuscode, 5s)
    group by window_start, code
  )
select window_start as ts, code, status, views
from countbystatus
inner join dim_code_to_status using (code);`,
    demoLinks: [
      {
        title: "Kafka UI",
        url: "http://kafka.demo.timeplus.com:8080/topics/owlshop-frontend-events",
        icon: "apachekafka_white.png",
        description: "View raw Kafka messages",
      },
      {
        title: "Live Demo in Timeplus",
        url: "https://demo.timeplus.cloud/sp/console/",
        icon: "timeplus_logo.svg",
        description:
          "Login with SSO, choose 'Stream Processing' demo workspace",
      },
      {
        title: "ClickHouse UI",
        url: "http://clickhouse.demo.timeplus.com:8123/play?password=demo123&user=demo#c2VsZWN0ICogZnJvbSBkZW1vLmh0dHBfY29kZV9jb3VudF81cyBvcmRlciBieSB0cyBkZXNjIGxpbWl0IDM=",
        icon: "clickhouse_logo_square_120.png",
        description: "Query the tables in ClickHouse",
      },
      {
        title: "📝 Comparing ClickHouse and Timeplus",
        url: "https://www.timeplus.com/timeplus-and-clickhouse",
        description:
          "Timeplus complements ClickHouse by providing better Kafka integration and robust stream processing capabilities",
      },
    ],
  },
  {
    id: "marketdata",
    title: "Crypto Market Data",
    subtitle:
      "Get real-time data from blockchain, monitor millions of token pairs and deliver insights in subsecond latency.",
    category: "Stream Processing",
    keywords: ["bitcoin", "blockchain", "trading", "streaming"],
    coverImage: "bitcoin_cover.png",
    introduction: `The cryptocurrency ecosystem generates vast amounts of high-velocity, mutable data. Timeplus can grab latest market data via Web Socket, HTTP Stream or API push and build real-time data pipeline to derive real-time insights.`,
    challenges: `1️⃣ High Cardinality and Scale: Unlike traditional financial data, blockchain data is decentralized, high-cardinality, constantly mutating, and often needs to be analyzed in real-time. For example, the Ethereum Mainnet alone has processed over 2.7 billion transactions since 2015, with blocks being added every 12 seconds. Faster chains like Arbitrum (250ms block times) and upcoming networks like MegaETH (10ms block times) generate even more data.

2️⃣ Fast Data Mutation: Blockchain data contains high-cardinality attributes such as wallet addresses, transaction hashes, and smart contract interactions, making indexing and querying expensive. The data isn’t static: there are frequent reorganizations, backfills of massive datasets, and fast mutations & event-driven updates.


3️⃣ Unlike batch ETL systems where data is transformed in predefined intervals, crypto data requires continuous, incremental updates. Some critical use cases include: tracking real-time asset balances, aggregating market data (olhc), detecting anomalies & fraud.

4️⃣ Crypto applications rely on both point queries and large-scale analytical queries. Some common ones include: fetching specific transactions or NFT balances instantly; aggregating trading volumes for specific assets over different timeframes (e.g. over the last 7 days); analyzing wallet activity trends over time. With high-cardinality datasets and constant updates, these queries must be optimized for performance—without requiring full table scans.
`,
    solution:
      "Timeplus supports mutable streams for high-cardinality, fast-mutating data. Developers can build secondary indexes on mutable streams for high-performance and flexible queries. Timeplus also suppors changelog-based incremental aggregation and hybrid aggregation powered by hybrid hash tables",
    screenshots: [
      {
        desc: "Various ways to get crypto data in Timeplus",
        src: "sources.png",
      },
      {
        desc: "Real-time OHLC and RSI in Timeplus",
        src: "dashboard.png",
      },
    ],
    steps: [
      "Create Web Socket or HTTP Stream to acquire market data, or use Kafka/NATs/REST",
      "Apply stream processing, mutable data schema and JOIN",
      "Create real-time alerts or visualization",
    ],
    dataFlowMarkdown: `graph TD;
        T[Timeplus]-->A[Market Data API];
        Grafana-->T;
        T-->ClickHouse;
        T-->B[Other Kafka/Pulsar Topics];
`,
    sqlExample: `with ohlc as (
SELECT
  window_start as time, earliest(price) AS open, latest(price) AS close, max(price) AS high, min(price) AS low
FROM
  tumble(mv_coinbase_tickers_extracted, {{filter_window_size}})
WHERE product_id = '{{filter_product}}' and _tp_time > now() -{{filter_time_range}}
GROUP BY
  window_start
),
returns as (
SELECT
  time, close, lag(close) AS prev_close, (close - prev_close) / prev_close AS ret
FROM
  ohlc
WHERE
  prev_close > 0
)
SELECT
  time,
  lags(ret, 1, 14) AS rets,
  array_avg(array_map(x -> if(x > 0, x, 0), rets)) AS avg_gains,
  array_avg(array_map(x -> if(x > 0, 0, -x), rets)) AS avg_losses,
  avg_gains / avg_losses AS RS,
  100 - (100/(1+RS)) as RSI
FROM returns
    `,
    demoLinks: [
      {
        title: "Live Demo in Timeplus",
        url: "https://demo.timeplus.cloud/ksql-alt/console/",
        icon: "timeplus_logo.svg",
        description: "Login with SSO, choose market-data demo workspace",
      },
      {
        title:
          "📝 How Zyre Leverages Timeplus for Real-Time Blockchain Analytics at Scale",
        url: "https://www.timeplus.com/post/customer-story-zyre",
        description: "Customer story",
      },
    ],
  },
];

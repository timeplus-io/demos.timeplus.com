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
  rank?: number;
}

export const demos: Demo[] = [
  {
    id: "cdc",
    title: "OLTP to OLAP",
    subtitle:
      "Denormalize N+1 records in MySQL to a JSON doc, and Save in S3/GCS.",
    category: "Real-Time Analytics",
    keywords: ["cdc", "debezium", "kafka", "pipeline", "s3", "oltp", "olap"],
    coverImage: "cdc_cover.png",
    introduction: `A common practice in OLTP database design is normalization. For instance, processing a customer order with multiple line items typically involves inserting one row into an "orders" table and multiple rows into an "order_details" table, linked by an "orderNumber".

The objective is to generate a denormalized JSON document for each order, aggregating all line items and calculating subtotals. This structure enables efficient querying in OLAP systems like BigQuery (via GCS) by eliminating the need for expensive JOIN operations at query time.`,
    challenges: `1️⃣ **Data Correlation Complexity with CDC:** Capturing database changes using tools like Debezium and streaming them via Apache Kafka is a standard approach. However, because a single logical transaction (e.g., an order) results in multiple CDC messages (one for "orders", several for "order_details") with slightly different timestamps, a naive JOIN based on "orderNumber" and exact event timestamps can lead to incomplete data aggregation.

2️⃣ **Windowing Challenges:** Tumble window aggregations (e.g., 10-second intervals) risk splitting a single order's data across two consecutive windows if line items are added near the window boundary.

3️⃣ **Duplicate Events with Sliding Windows:** While sliding windows (hop windows) can mitigate the order splitting issue, they may introduce duplicate events in the output, requiring further deduplication logic.

4️⃣ **Scalability of Global Aggregation:** Global aggregation, while ensuring complete data capture for a transaction, becomes impractical as the state size grows significantly (e.g., potentially reaching hundreds of gigabytes), leading to excessive memory consumption and performance degradation.`,
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
    rank: 10,
  },
  {
    id: "opentelemetry",
    title: "OpenTelemetry + SQL",
    subtitle:
      "Collect logs, metrics and tracing via OpenTelemetry, export to Kafka, filter and aggregated by streaming SQL and build dashboards in Timeplus or Grafana.",
    category: "Observability",
    keywords: ["kafka", "opentelemetry", "grafana", "sql"],
    coverImage: "otlp_cover.png",
    introduction: `[OpenTelemetry (OTel)](https://opentelemetry.io/) provides a standardized framework of APIs, SDKs, and tools for instrumenting, generating, collecting, and exporting telemetry data (metrics, logs, and traces). This data is crucial for analyzing software performance and behavior. OTel collectors, deployable on systems such as Linux, can export this data, often as JSON documents, to messaging systems like Apache Kafka. Timeplus can then consume this data for streaming ETL, data routing, alert generation, and real-time visualization.`,
    challenges: `1️⃣ **Complex Data Structures:** The OpenTelemetry schema, while open and flexible, often results in verbose JSON documents with complex, nested structures, potentially spanning thousands of lines per message. Parsing and filtering these documents efficiently and accurately presents a significant challenge.

2️⃣ **Storage and Compute Costs:** Storing voluminous and complex JSON documents in Kafka and subsequently in OLAP data warehouses can lead to substantial storage and computational costs.

3️⃣ **Cross-Source Correlation:** Correlating metrics and logs from distributed systems is essential for comprehensive observability and troubleshooting. However, joining data across multiple sources based on identifiers can be challenging in conventional platforms (e.g., Grafana, Splunk), especially when dealing with events that have closely aligned but not identical timestamps.`,
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
    rank: 20,
  },
  {
    id: "ksql_alternative",
    title: "ksqlDB Alternative",
    subtitle: "Timeplus offers additional benefits compared to ksqlDB.",
    category: "Real-Time Analytics",
    keywords: ["kafka", "sql", "pipeline", "database"],
    coverImage: "ksql_cover.png",
    introduction: `[ksqlDB](https://www.confluent.io/product/ksqldb/), a stream processing engine by Confluent, is primarily designed for consuming data from Apache Kafka topics, performing stateless or stateful transformations, and writing results back to Kafka. For comprehensive analytical querying, data typically needs to be offloaded to specialized downstream systems. While ksqlDB offers some capabilities for querying derived state (e.g., materialized views), these ad-hoc queries are generally restricted to primary key lookups or simple range scans.`,
    challenges: `1️⃣ **Limited Ad-Hoc Querying and Join Capabilities:** ksqlDB's query capabilities fall short of those offered by traditional databases or data warehouses, primarily supporting key-based lookups and range scans. Its JOIN operations are also restricted, often limited to primary key relationships.

2️⃣ **Performance Considerations:** ksqlDB's performance can be affected by serialization/deserialization overhead between Apache Kafka and its underlying state store (RocksDB). Its tight coupling with Kafka, involving frequent data transmission and reception, can contribute to increased latency and operational costs.

3️⃣ **State Management Complexity:** Managing ksqlDB state stores can be challenging due to limitations in Time-To-Live (TTL) configurations and other storage settings. State persistence, often reliant on Kafka topics, can lead to increased storage and network bandwidth requirements for achieving high availability and resilience.`,
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
    rank: 30,
  },
  {
    id: "kafka2ch",
    title: "Kafka To ClickHouse",
    subtitle:
      "Query data in Kafka with SQL, apply join and lookup and send high quality data to ClickHouse.",
    category: "Real-Time Analytics",
    keywords: ["kafka", "sql", "clickhouse", "pipeline", "streaming", "join"],
    coverImage: "kafak2ch_cover.png",
    introduction: `Apache Kafka is a prevalent source for real-time data streams. While OLAP databases like ClickHouse offer Kafka consumption capabilities, they often come with certain limitations. Timeplus offers a high-performance and flexible solution for querying data directly within Kafka, performing complex joins with other data sources, and delivering transformed, high-quality data to destinations such as ClickHouse or other analytical systems.`,
    challenges: `1️⃣ **Indirect Kafka Data Access in ClickHouse:** ClickHouse's KafkaEngine allows integration with Kafka, but direct querying of KafkaEngine tables is not supported. Users must create Materialized Views to access and process Kafka data, which can hinder interactive data exploration and iterative query development.

2️⃣ **Limited SQL Capabilities in ClickHouse Materialized Views:** ClickHouse Materialized Views have restrictions, such as lack of support for UNION ALL operations on KafkaEngine tables or complex JOINs (e.g., joining multiple Kafka topics). This limits their utility in creating denormalized datasets or combining information from disparate sources, common requirements in analytical workloads.

3️⃣ **Single Source Limitation for Materialized Views:** ClickHouse Materialized Views typically operate on a single input table. This constraint restricts the creation of views that consolidate or correlate data from multiple Kafka topics or other sources simultaneously, impacting their effectiveness in complex data integration scenarios.

4️⃣ **Triggered by ingestion only:** Materialized Views in ClickHouse are updated only when new data is inserted into the input table. This means that you can not run incremental aggregation based on a tumble, hop or session window.`,
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
    rank: 40,
  },
  {
    id: "msk2iceberg",
    title: "MSK To Iceberg",
    subtitle:
      "Query data in Amazon Managed Streaming for Apache Kafka (MSK) with SQL, apply join and lookup and save high quality data in Apache Iceberg, for low cost storage and multi-engine queries.",
    category: "Real-Time Analytics",
    keywords: ["kafka", "sql", "aws", "pipeline", "msk", "iceberg", "etl"],
    coverImage: "msk2iceberg_cover.png",
    introduction: `Apache Kafka serves as a ubiquitous source for real-time data streams, and Amazon MSK (Managed Streaming for Apache Kafka) provides a fully managed Kafka service on AWS. While data within Kafka can be queried using frameworks like Apache Flink or Apache Spark, these solutions often entail significant operational overhead and cost. Timeplus presents a high-performance, flexible alternative for processing data directly from MSK, enabling the transformation and delivery of high-quality, structured data to Amazon S3 in the Apache Iceberg open table format.`,
    challenges: `1️⃣ **Kafka's Design Limitations for Analytics:** Apache Kafka excels as a message bus for inter-service communication and data transport (supporting formats like JSON, Avro, Protobuf, and binary). However, it is not inherently designed for direct analytical workloads. Storing large datasets in Kafka long-term is costly, and Kafka lacks native indexing capabilities to optimize data scanning for analytical queries. Consequently, a common pattern involves processing data from Kafka and landing it into OLAP databases or data lakes, such as those utilizing the Apache Iceberg format.

2️⃣ **Operational Complexity and Cost of Flink/Spark:** While Amazon Managed Service for Apache Flink and Apache Spark on Amazon EMR offer powerful stream processing capabilities, they are often associated with steep learning curves, complex setup procedures, and considerable operational expenses.

3️⃣ **Data Latency with Batch ETL:** Alternative solutions like Airbyte or Apache NiFi can establish batch ETL pipelines to move data from Kafka to databases or data lakes. These may be less resource-intensive than Flink or Spark but typically introduce data latency by converting real-time streams into hourly or daily batches, diminishing data freshness.

4️⃣ **Apache Iceberg's JVM-Centric Ecosystem and Write Limitations:** [Apache Iceberg](https://iceberg.apache.org/) is an emerging high-performance open table format optimized for large-scale analytical tables, often used with data lakes on Amazon S3. However, its current ecosystem is predominantly JVM-based, with primary support from engines like Apache Spark, Trino, Flink, and Hive. While high-performance query engines like ClickHouse or DuckDB offer read support for Iceberg, their write capabilities to Iceberg tables are often limited or non-existent.`,
    solution: `Timeplus is a modern stream processing platform designed to handle real-time data with low latency supporting native streams as well as data from popular streaming platforms such as Apache Kafka or Amazon MSK. It excels in processing, joining, and preparing streaming data before it reaches the final storage system, e.g. Iceberg. The benefits of adding Timeplus between Kafka and Iceberg are:

✨ Timeplus is implemented in C++ and delivers amazing performance, low latency and cost infrasturre cost, comparing to Apache Flink or Spark.

✨ Timeplus can run complex SQL to join data from multiple MSK topics or even different MSK clusters in same or different regions, or apply lookups with other ClickHouse/MySQL/Postgres tables.

✨ Timeplus supports continuous and incremental stream processing, such as tumble, hop, session windows, watermark and out-of-order processing.`,
    screenshots: [
      {
        desc: "Parquet files in Amazon S3, in Apache Iceberg open format",
        src: "s3_files.png",
      },
      {
        desc: "Other engines such as Spark can read the Iceberg data written by Timeplus",
        src: "sparksql.png",
      },
    ],
    steps: [
      "Create Kafka External Stream in Timeplus to read data from Amazon MSK",
      "Optionally enable Avro or Protobuf while reading Kafka data",
      "Explore the Kafka data with ad-hoc SQL without having to create materialized views",
      "Create Iceberg External Stream to write data in Iceberg open format, using Glue Iceberg REST Catalog",
      "Create Materialized Views with complex SQL to read multiple MSK topics and send streaming transformed data to Iceberg",
    ],
    dataFlowMarkdown: `graph TD;
        K[Amazon MSK]-->T[Timeplus]-->S3[Amazon S3];
        T-->Glue[Glue Catalog];
        T-->S3T[S3 Table Catalog];
`,
    sqlExample: `-- read Avro messages from MSK topics
create external stream msk_stream_read(
  org_id string,
  float_value nullable(float32),
  array_of_records array(tuple(a_str string, a_num int32))
)
settings
    type='kafka',
    brokers='brokerid.kafka.us-west-2.amazonaws.com:9098',
    topic='topic2',
    security_protocol='SASL_SSL',
    sasl_mechanism='AWS_MSK_IAM',--using IAM role
    data_format='Avro',
    format_schema='avro_schema';

-- connect to Iceberg datalake on S3
create database iceberg
settings  type='iceberg',
          catalog_type='rest', catalog_uri='https://glue.us-west-2.amazonaws.com/iceberg',
          warehouse='..', storage_endpoint='https://tp-iceberg-demo.s3.us-west-2.amazonaws.com',
          rest_catalog_sigv4_enabled=true, rest_catalog_signing_region='us-west-2', rest_catalog_signing_name='glue';
create stream iceberg.transformed(
  timestamp datetime64,
  org_id string,
  float_value float,
  array_length int,
  max_num int,
  min_num int
);

create materialized view mv_write_iceberg into iceberg.transformed
AS select now() as timestamp, org_id,float_value, length(array_of_records.a_num) as array_length,
array_max(array_of_records.a_num) as max_num,array_min(array_of_records.a_num) as min_num
from msk_stream_read
settings s3_min_upload_file_size=1024;
`,
    youtubeVideoLink:
      "https://www.youtube.com/embed/2m6ehwmzOnc?si=QMRqKYMzSZCO2VyK",
    demoLinks: [
      {
        title: "🔒 Book a Demo",
        url: "https://www.timeplus.com/contact",
        description: "Contact us to schedule a live demo",
      },
    ],
    rank: 50,
  },
  {
    id: "marketdata",
    title: "Crypto Market Data",
    subtitle:
      "Get real-time data from blockchain, monitor millions of token pairs and deliver insights in subsecond latency.",
    category: "Real-Time Analytics",
    keywords: ["bitcoin", "blockchain", "trading", "streaming"],
    coverImage: "bitcoin_cover.png",
    introduction: `The cryptocurrency ecosystem is characterized by the generation of high-volume, high-velocity, and frequently mutable data. Timeplus facilitates the ingestion of real-time market data through various mechanisms, including WebSockets, HTTP Streams, or API push notifications, enabling the construction of sophisticated data pipelines for deriving immediate insights.`,
    challenges: `1️⃣ **High Cardinality and Extreme Scale:** Blockchain data, distinct from traditional financial data, is decentralized, exhibits high cardinality (e.g., wallet addresses, transaction hashes), undergoes constant mutation, and necessitates real-time analysis. For instance, the Ethereum Mainnet has processed billions of transactions, with new blocks appended at frequent intervals (e.g., every ~12 seconds). Emerging Layer 2 solutions and newer blockchain architectures generate data at even higher velocities (e.g., block times of 250ms or even 10ms).

2️⃣ **Rapid Data Mutation and Complexity:** The inherent nature of blockchain data, with its high-cardinality attributes (wallet addresses, transaction hashes, smart contract interactions), makes indexing and querying computationally intensive. Furthermore, the data is dynamic, subject to frequent reorganizations (reorgs), large-scale backfills, and rapid, event-driven updates.

3️⃣ **Continuous and Incremental Processing Demand:** In contrast to batch ETL paradigms, crypto data analysis demands continuous and incremental processing. Critical use cases include real-time asset balance tracking, live aggregation of market data (e.g., OHLC - Open, High, Low, Close), and immediate anomaly or fraud detection.

4️⃣ **Hybrid Query Workloads:** Crypto applications typically require support for both low-latency point queries (e.g., fetching a specific transaction or NFT balance) and complex analytical queries (e.g., aggregating trading volumes over various timeframes, analyzing wallet activity trends). Optimizing these diverse query patterns over high-cardinality, constantly updating datasets, without resorting to full table scans, is a significant technical hurdle.`,
    solution:
      "Timeplus supports mutable streams for high-cardinality, fast-mutating data. Developers can build secondary indexes on mutable streams for high-performance and flexible queries. Timeplus also suppors changelog-based incremental aggregation and hybrid aggregation powered by hybrid hash tables",
    screenshots: [
      {
        desc: "Various ways to get crypto data in Timeplus",
        src: "sources.png",
      },
      {
        desc: "Real-Time OHLC and RSI in Timeplus",
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
        url: "https://play.demo.timeplus.com/default/console/dashboard/e4436486-0503-4265-93b8-300354ea6568",
        icon: "timeplus_logo.svg",
        description: "",
      },
      {
        title:
          "📝 How Zyre Leverages Timeplus for Real-Time Blockchain Analytics at Scale",
        url: "https://www.timeplus.com/post/customer-story-zyre",
        description: "Customer story",
      },
    ],
    rank: 60,
  },
  {
    id: "github",
    title: "GitHub Events",
    subtitle:
      "Get real-time data from GitHub, monitor millions of events to gain real-time insights.",
    category: "Real-Time Analytics",
    keywords: ["kafka", "json", "mv"],
    coverImage: "github_cover.png",
    introduction: `Imagine you have millions of GitHub events, such as commits, pull requests, issues, and releases, streaming in real-time. You want to monitor these events to gain insights into rising new projects, popular projects, and developer contributions. Querying them directly from Apache Kafka can be challenging due to the complexity of the data and the need for efficient processing. Timeplus provides a solution to this problem by allowing you to create materialized views that can process and analyze these events in real-time, enabling you to gain valuable insights quickly.`,
    challenges: `1️⃣ **Storage and Compute Costs:** Storing voluminous and complex JSON documents in Kafka and subsequently in OLAP data warehouses can lead to substantial storage and computational costs.

2️⃣ **Complex Data Structures:** The GitHub schema, while open and flexible, often results in verbose JSON documents with complex, nested structures, potentially spanning hundreds of lines per message. Parsing and filtering these documents efficiently and accurately presents a significant challenge.

3️⃣ **Continuous and Incremental Analytics Demand:** In contrast to batch ETL and traditional BI, Timeplus supports continuous and incremental processing. Critical use cases include real-time event tracking, live aggregation of event data, and immediate anomaly or fraud detection.`,
    solution:
      "Timeplus seamlessly connects with Kafka API and read incoming and existing messages. You can run SQL query directly via the Kafka External Stream without saving any data in Timeplus. To avoid the high cost of storing billions of events in Kafka and also to improve the query performance, it's recommended to create Materialized Views in Timeplus to save Kafka message locally and apply optimized columar storage or index. Materialized Views also enable incremental updates to turn BI reports from minutes to sub-seconds.",
    screenshots: [
      {
        desc: "Millions of GitHub events in Kafka",
        src: "event.png",
      },
      {
        desc: "Real-Time GitHub Monitoring",
        src: "dashboard.png",
      },
    ],
    steps: [
      "Call GitHub API to get real-time events and push to Kafka",
      "Create External Stream in Timeplus to read data from Kafka",
      "Create Materialized Views to process and analyze the data",
      "Create real-time alerts or visualization in Timeplus or Grafana",
    ],
    dataFlowMarkdown: `graph TD;
        G[GitHub API]-->K[Kafka];
        subgraph Timeplus
        MV[Materialized View]-->T[Kafka External Stream];
        end
        T-->K;
        Grafana-->MV;
`,
    sqlExample: `create external stream github_events(
  actor string,
  created_at string,
  id string,
  payload string,
  repo string,
  type string
)
SETTINGS type = 'kafka', brokers = 'kafkaproxynoauth.us-west1-a.c.tpdemo2025.internal:9092',
topic = 'github_events', security_protocol = 'PLAINTEXT', data_format = 'JSONEachRow',
skip_ssl_cert_check = false, one_message_per_row = true;

create materialized view mv_github_events as(
  select _tp_time,actor,created_at::datetime as created_at,id,payload,repo,type
  from github_events settings seek_to='earliest');

select repo, count(distinct actor) as new_followers
from table(mv_github_events) where type ='WatchEvent' and _tp_time>now()-1d
group by repo order by new_followers desc
limit 5;`,
    demoLinks: [
      {
        title: "Kafka UI",
        url: "http://kafka.demo.timeplus.com:8080/topics/github_events",
        icon: "apachekafka_white.png",
        description: "View raw Kafka topics and messages",
      },
      {
        title: "Live Demo in Timeplus",
        url: "https://play.demo.timeplus.com/default/console/dashboard/7b553ed7-c29f-49ee-aa6c-ac95e371059c",
        icon: "timeplus_logo.svg",
        description: "",
      },
      {
        title: "🐍 Python Notebook",
        url: "https://marimo.demo.timeplus.com/github/",
        description: "",
      },
      {
        title: "📝 Build Real-Time Analytics for GitHub",
        url: "https://www.timeplus.com/post/github-real-time-app",
        description: "Tutorial",
      },
    ],
    rank: 55,
  },
];

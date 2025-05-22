export interface Demo {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  keywords: string[];
  coverImage: string;
  introduction: string;
  challenges: string;
  solution: string;
  steps: string[];
  dataFlowImage: string;
  sqlExample: string;
  youtubeVideoLink?: string;
  demoLinks: {
    title: string;
    url: string;
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
        description: "View raw Kafka topics and messages",
      },
      {
        title: "Timeplus Enterprise",
        url: "https://timeplus.demo.timeplus.com",
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
    coverImage: "/otlp_cover.png",
    introduction: `[OpenTelemetry](https://opentelemetry.io/) is a collection of APIs, SDKs, and tools. Use it to instrument, generate, collect, and export telemetry data (metrics, logs, and traces) to help you analyze your software’s performance and behavior.
You can install OpenTelemetry collectors on Linux and export data as JSON documents in Kafka topics and have Timeplus to run streaming ETL, routing, alerts and visualization.`,
    challenges: `1️⃣ While the OpenTelemetry schema is open and flexible, the exported JSON documents are usually with thousands of lines per messages, with nested structure. Parsing and filtering such complex JSON documents are not easy and error-prone.

2️⃣ Storing such complex JSON documents on Kafka and OLAP data warehouse lead to high cost of storage and computing

3️⃣ Metrics and logs across different machines are usually collated to understand the big picture or troubleshot issues. JOIN data across mulitiple data sources and ID is usually a challenge in Grafana, Splunk and other platforms. Timestamps for those collated events are close but not exactly same.`,
    solution:
      "This demo shows how Timeplus integrates with OpenTelemetry to provide a unified observability platform. Logs, metrics and tracing can be collected via open-source or 3rd party OpenTelemetry collector agents and pushed to Timeplus directly or via Kafka. \n\nTimeplus provides real-time processing with streaming SQL and custom filtering and aggregation, as well as built-in alerts and live visualization. By integrating with Grafana, Splunk, OpenSearch and other systems, Timeplus enables DevOps teams with immediate insights into system health and performance.",
    steps: [
      "Install OpenTelemetry Collector on Linux machines",
      "Configure the collector to send cpu/memory/disk metrics to Kafka",
      "Create External Stream in Timeplus to read data from Kafka",
      "Parse and filter the complex JSON message in Timeplus with JSON Path",
      "Visualize the live metrics in Timeplus built-in dashboards",
      "Install plugin in Grafana to run streaming SQL for Timeplus and build dashboards",
      "Forward the logs and metrics to Splunk, OpenSearch and other systems",
    ],
    dataFlowImage: "/observability-flow.jpg",
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
    `,
    demoLinks: [
      {
        title: "Kafka UI",
        url: "http://kafka.demo.timeplus.com:8080/topics/otlp_metrics",
        description: "View raw JSON message in otlp_metrics Kafka topic",
      },
      {
        title: "Live Dashboard in Timeplus",
        url: "https://timeplus.demo.timeplus.com/default/console/dashboard/f38e1645-ea15-4f10-aa69-85f55440ff55",
        description: "Login with demo/demo123.",
      },
      {
        title: "Live Dashboard in Grafana",
        url: "https://grafana.demo.timeplus.com/d/a5246160-2353-42eb-8879-90d4a035d03e/real-time-observability",
        description: "Login with demo/demo123.",
      },
    ],
  },
];

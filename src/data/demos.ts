export interface Demo {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  keywords: string[];
  coverImage: string;
  description: string;
  problemStatement: string;
  context: string;
  steps: string[];
  demoLinks: {
    title: string;
    url: string;
    description?: string;
  }[];
}

export const demos: Demo[] = [
  {
    id: "demo-1",
    title: "OLTP to OLAP Pipeline",
    subtitle:
      "Denormalize N+1 records in MySQL to a JSON doc, and Save in S3/GCS",
    category: "Pipeline",
    keywords: ["cdc", "debezium", "kafka", "pipeline", "s3", "oltp", "olap"],
    coverImage: "/cdc.jpg",
    description: `It's common to design your OLTP database schema in the normalized way. For example, when a customer places an order with multiple line items, one row will be added to the "orders" MySQL table with a "orderNumber", and multiple rows to add in the "order_details" table with the same "orderNumber".

The goal is to create a JSON document for each order, with all line items aggregated, with the subtotal calculated, so that BigQuery can run SQL for those JSON files in GCS and no need to perform expensive JOINs.`,
    problemStatement: `1️⃣ You can capture database changes via tools like Debezium and make the change feed available in Apache Kafka. However since each order include 1 new row in "orders" and multiple rows in "order_details", the time stamp for those CDC messages are not exactly same. A naive JOIN by "orderNumber" and timestamp won't catch all changes.

2️⃣ Tumble window aggregations (say every 10s) can split one order across two windows if the customer adds items right at the edge

3️⃣ Sliding windows (hop) solve the split but now you get duplicate events

4️⃣ Global aggregation keeps everything in memory—great until your state grows to 100GB in a week…`,
    context: `✨ Timeplus can seamlessly connect OLTP systems like MySQL, using technologies such as Debezium for Change Data Capture (CDC) and Kafka for streaming.

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
    id: "demo-2",
    title: "OpenTelemetry + SQL",
    subtitle:
      "Collect logs, metrics and tracing via OpenTelemetry, export to Kafka, filter and aggregated by streaming SQL and build dashboards in Timeplus or Grafana",
    category: "Observability",
    keywords: ["kafka", "opentelemetry", "grafana", "sql"],
    coverImage: "/anomaly-detection.jpg",
    description:
      "A powerful observability solution combining OpenTelemetry with streaming SQL.\nKey features include:\n- Comprehensive data collection\n- Real-time filtering and aggregation\n- Flexible visualization options",
    problemStatement:
      "Modern distributed systems generate vast amounts of observability data including logs, metrics, and traces.\nKey challenges include:\n- Data silos across different tools\n- Complexity in correlating different data types\n- Delays in identifying and resolving issues\nThis results in slower incident response and reduced system reliability.",
    context:
      "This demo shows how Timeplus integrates with OpenTelemetry to provide a unified observability platform.\nBy collecting data via OpenTelemetry standards and exporting to Kafka, we enable:\n- Real-time processing with streaming SQL\n- Custom filtering and aggregation\n- Visualization through Timeplus dashboards or integration with Grafana\nThis provides teams with immediate insights into system health and performance.",
    steps: [
      "Ingest streaming sensor data from IoT devices",
      "Apply anomaly detection algorithms in real-time",
      "Visualize normal vs. anomalous patterns",
      "Configure alerts for detected anomalies",
    ],
    demoLinks: [
      {
        title: "Anomaly Detection Demo",
        url: "https://demo.timeplus.com/anomaly-detection",
        description: "Interactive anomaly detection visualization",
      },
      {
        title: "OpenSearch Dashboard",
        url: "https://demo.timeplus.com/opensearch",
        description: "Detailed logs and analytics",
      },
    ],
  },
];

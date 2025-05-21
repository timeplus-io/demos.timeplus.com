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
    description:
      "A comprehensive dashboard for monitoring and analyzing streaming data in real-time.",
    problemStatement:
      "Organizations struggle to gain immediate insights from high-velocity streaming data, leading to delayed decision making.",
    context:
      "This demo showcases how Timeplus enables real-time monitoring and analysis of streaming data through an intuitive dashboard interface.",
    steps: [
      "Connect to streaming data sources like Kafka or Redpanda",
      "Configure real-time processing rules and transformations",
      "Set up interactive visualizations and alerts",
      "Monitor system performance and data throughput",
    ],
    demoLinks: [
      {
        title: "Dashboard Demo",
        url: "https://demo.timeplus.com/dashboard",
        description: "Interactive dashboard with live data streams",
      },
      {
        title: "Redpanda Console",
        url: "https://demo.timeplus.com/redpanda",
        description: "View raw Kafka topics and messages",
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
      "Detect anomalies in IoT sensor data streams using machine learning algorithms.",
    problemStatement:
      "IoT deployments generate massive amounts of sensor data, making it difficult to manually identify anomalies or issues that require attention.",
    context:
      "This demo shows how Timeplus can automatically detect anomalies in streaming sensor data using built-in machine learning capabilities.",
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

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
    title: "Real-time Stream Processing Dashboard",
    subtitle: "Monitor and analyze streaming data with interactive visualizations",
    category: "Analytics",
    keywords: ["streaming", "dashboard", "real-time", "visualization"],
    coverImage: "/stream-dashboard.jpg",
    description: "A comprehensive dashboard for monitoring and analyzing streaming data in real-time.",
    problemStatement: "Organizations struggle to gain immediate insights from high-velocity streaming data, leading to delayed decision making.",
    context: "This demo showcases how Timeplus enables real-time monitoring and analysis of streaming data through an intuitive dashboard interface.",
    steps: [
      "Connect to streaming data sources like Kafka or Redpanda",
      "Configure real-time processing rules and transformations",
      "Set up interactive visualizations and alerts",
      "Monitor system performance and data throughput"
    ],
    demoLinks: [
      {
        title: "Dashboard Demo",
        url: "https://demo.timeplus.com/dashboard",
        description: "Interactive dashboard with live data streams"
      },
      {
        title: "Redpanda Console",
        url: "https://demo.timeplus.com/redpanda",
        description: "View raw Kafka topics and messages"
      }
    ]
  },
  {
    id: "demo-2",
    title: "Anomaly Detection in IoT Sensor Data",
    subtitle: "Identify unusual patterns in sensor readings automatically",
    category: "IoT",
    keywords: ["anomaly detection", "IoT", "sensors", "machine learning"],
    coverImage: "/anomaly-detection.jpg",
    description: "Detect anomalies in IoT sensor data streams using machine learning algorithms.",
    problemStatement: "IoT deployments generate massive amounts of sensor data, making it difficult to manually identify anomalies or issues that require attention.",
    context: "This demo shows how Timeplus can automatically detect anomalies in streaming sensor data using built-in machine learning capabilities.",
    steps: [
      "Ingest streaming sensor data from IoT devices",
      "Apply anomaly detection algorithms in real-time",
      "Visualize normal vs. anomalous patterns",
      "Configure alerts for detected anomalies"
    ],
    demoLinks: [
      {
        title: "Anomaly Detection Demo",
        url: "https://demo.timeplus.com/anomaly-detection",
        description: "Interactive anomaly detection visualization"
      },
      {
        title: "OpenSearch Dashboard",
        url: "https://demo.timeplus.com/opensearch",
        description: "Detailed logs and analytics"
      }
    ]
  },
  {
    id: "demo-3",
    title: "E-commerce Fraud Prevention",
    subtitle: "Detect and prevent fraudulent transactions in real-time",
    category: "Security",
    keywords: ["fraud detection", "e-commerce", "security", "transactions"],
    coverImage: "/fraud-prevention.jpg",
    description: "Real-time fraud detection system for e-commerce transactions.",
    problemStatement: "E-commerce platforms need to identify and block fraudulent transactions instantly, without disrupting legitimate customer purchases.",
    context: "This demo illustrates how Timeplus can analyze transaction patterns in real-time to identify potentially fraudulent activities.",
    steps: [
      "Process streaming transaction data",
      "Apply fraud detection rules and ML models",
      "Score transactions for fraud probability",
      "Automatically flag or block suspicious activities"
    ],
    demoLinks: [
      {
        title: "Fraud Detection Dashboard",
        url: "https://demo.timeplus.com/fraud-detection",
        description: "Live fraud detection system"
      },
      {
        title: "Transaction Simulator",
        url: "https://demo.timeplus.com/transaction-simulator",
        description: "Generate test transactions to see the system in action"
      }
    ]
  },
  {
    id: "demo-4",
    title: "Log Analytics Pipeline",
    subtitle: "Process and analyze log data from multiple sources",
    category: "DevOps",
    keywords: ["log analytics", "observability", "monitoring", "troubleshooting"],
    coverImage: "/log-analytics.jpg",
    description: "Centralized log processing and analysis platform for DevOps teams.",
    problemStatement: "Modern applications generate massive volumes of logs across distributed systems, making it challenging to troubleshoot issues efficiently.",
    context: "This demo shows how Timeplus can ingest, process, and analyze logs from multiple sources to provide real-time observability.",
    steps: [
      "Collect logs from various sources (applications, servers, containers)",
      "Parse and normalize log formats",
      "Apply real-time filtering and pattern detection",
      "Create dashboards for monitoring and troubleshooting"
    ],
    demoLinks: [
      {
        title: "Log Analytics Dashboard",
        url: "https://demo.timeplus.com/log-analytics",
        description: "Interactive log analysis interface"
      },
      {
        title: "Alert Configuration",
        url: "https://demo.timeplus.com/alert-config",
        description: "Set up automated alerts based on log patterns"
      }
    ]
  },
  {
    id: "demo-5",
    title: "Real-time Customer 360",
    subtitle: "Build comprehensive customer profiles with streaming data",
    category: "Marketing",
    keywords: ["customer 360", "personalization", "user behavior", "marketing"],
    coverImage: "/customer-360.jpg",
    description: "Create and update customer profiles in real-time based on streaming interaction data.",
    problemStatement: "Businesses struggle to maintain up-to-date customer profiles across multiple touchpoints, leading to fragmented experiences.",
    context: "This demo illustrates how Timeplus can aggregate customer data from various sources to create comprehensive, real-time customer profiles.",
    steps: [
      "Ingest customer interaction data from multiple channels",
      "Enrich profiles with historical and contextual data",
      "Apply real-time segmentation and scoring",
      "Trigger personalized experiences based on profile updates"
    ],
    demoLinks: [
      {
        title: "Customer Profile Dashboard",
        url: "https://demo.timeplus.com/customer-profiles",
        description: "Interactive customer profile explorer"
      },
      {
        title: "Segmentation Engine",
        url: "https://demo.timeplus.com/segmentation",
        description: "Real-time customer segmentation tool"
      }
    ]
  },
  {
    id: "demo-6",
    title: "Supply Chain Monitoring",
    subtitle: "Track inventory and logistics in real-time",
    category: "Operations",
    keywords: ["supply chain", "logistics", "inventory", "tracking"],
    coverImage: "/supply-chain.jpg",
    description: "End-to-end visibility into supply chain operations with real-time monitoring.",
    problemStatement: "Supply chain managers lack real-time visibility into inventory levels, shipment status, and potential disruptions.",
    context: "This demo showcases how Timeplus can provide real-time monitoring of supply chain operations, from inventory to logistics.",
    steps: [
      "Integrate data from inventory, logistics, and supplier systems",
      "Track key metrics and KPIs in real-time",
      "Detect potential disruptions and bottlenecks",
      "Optimize inventory levels and logistics routes"
    ],
    demoLinks: [
      {
        title: "Supply Chain Dashboard",
        url: "https://demo.timeplus.com/supply-chain",
        description: "Real-time supply chain monitoring"
      },
      {
        title: "Logistics Tracker",
        url: "https://demo.timeplus.com/logistics",
        description: "Shipment and logistics monitoring tool"
      }
    ]
  }
];

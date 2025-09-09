import { configDotenv } from "dotenv";
configDotenv();
const sdk = require("node-appwrite");

// 1️⃣ Initialize Appwrite client
const client = new sdk.Client();
const projectId = process.env.VITE_APPWRITE_PROJECT_ID;
const endpoint = process.env.VITE_APPWRITE_ENDPOINT;
const databaseId = process.env.VITE_APPWRITE_DATABASE_ID;
const apiKey = process.env.VITE_APPWRITE_API_KEY;

if (!projectId || !endpoint || !databaseId || !apiKey) {
  throw new Error("Missing Appwrite configuration in environment variables.");
}

client.setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const tablesDB = new sdk.TablesDB(client);

// 2️⃣ Table definitions
const tables = [
  {
    id: "projects",
    name: "Projects",
    columns: [
      { key: "name", type: "string", required: true, size: 255 },
      { key: "description", type: "string", required: false, size: 1024 },
      { key: "ownerId", type: "string", required: true },
      { key: "environments", type: "array", required: true, default: [] },
      { key: "collaborators", type: "array", required: false, default: [] },
      { key: "settings", type: "object", required: false, default: {} },
      { key: "isActive", type: "boolean", required: true, default: true },
      {
        key: "createdAt",
        type: "datetime",
        required: true,
        default: new Date().toISOString(),
      },
      {
        key: "updatedAt",
        type: "datetime",
        required: true,
        default: new Date().toISOString(),
      },
    ],
  },
  {
    id: "envVariables",
    name: "EnvVariables",
    columns: [
      { key: "variableId", type: "string", required: true },
      { key: "projectId", type: "string", required: true }, // 🔗 Relation to Projects
      { key: "environment", type: "string", required: true },
      { key: "key", type: "string", required: true },
      { key: "value", type: "string", required: true },
      { key: "isSecret", type: "boolean", required: true, default: false },
      { key: "description", type: "string", required: false },
      { key: "tags", type: "array", required: false, default: [] },
      { key: "lastUpdatedBy", type: "string", required: false },
      { key: "stage", type: "string", required: false },

      {
        key: "createdAt",
        type: "datetime",
        required: true,
        default: new Date().toISOString(),
      },
      {
        key: "updatedAt",
        type: "datetime",
        required: true,
        default: new Date().toISOString(),
      },
    ],
  },
  {
    id: "versions",
    name: "Versions",
    columns: [
      { key: "versionId", type: "string", required: true },
      { key: "envVariableId", type: "string", required: true }, // 🔗 Relation to EnvVariables
      { key: "projectId", type: "string", required: true }, // optional shortcut to project
      { key: "environment", type: "string", required: true },
      { key: "versionNumber", type: "integer", required: true, default: 1 },
      { key: "changes", type: "array", required: true, default: [] },
      { key: "createdBy", type: "string", required: true },
      {
        key: "createdAt",
        type: "datetime",
        required: true,
        default: new Date().toISOString(),
      },
      { key: "message", type: "string", required: false },
    ],
  },
  {
    id: "syncLogs",
    name: "SyncLogs",
    columns: [
      { key: "logId", type: "string", required: true },
      { key: "projectId", type: "string", required: true }, // 🔗 Relation to Projects
      { key: "environment", type: "string", required: true },
      { key: "userId", type: "string", required: true },
      { key: "action", type: "string", required: true },
      { key: "status", type: "string", required: true },
      { key: "details", type: "string", required: false },
      {
        key: "timestamp",
        type: "datetime",
        required: true,
        default: new Date().toISOString(),
      },
    ],
  },
];

// 3️⃣ Function to add column based on type
async function addColumn(databaseId, tableId, column) {
  switch (column.type) {
    case "string":
      return tablesDB.createStringColumn({
        databaseId,
        tableId,
        key: column.key,
        size: column.size || 255,
        required: column.required || false,
        default: column.default || "",
      });
    case "boolean":
      return tablesDB.createBooleanColumn({
        databaseId,
        tableId,
        key: column.key,
        required: column.required || false,
        default: column.default || false,
      });
    case "integer":
      return tablesDB.createIntegerColumn({
        databaseId,
        tableId,
        key: column.key,
        required: column.required || false,
        default: column.default || 0,
      });
    case "float":
      return tablesDB.createFloatColumn({
        databaseId,
        tableId,
        key: column.key,
        required: column.required || false,
        default: column.default || 0.0,
      });
    case "array":
    case "object": // store as JSON string
      return tablesDB.createStringColumn({
        databaseId,
        tableId,
        key: column.key,
        size: 65535, // large enough to store serialized JSON
        required: column.required || false,
        default: JSON.stringify(
          column.default || (column.type === "array" ? [] : {})
        ),
      });
    case "datetime":
      return tablesDB.createDatetimeColumn({
        databaseId,
        tableId,
        key: column.key,
        required: column.required || false,
        default: column.default || new Date().toISOString(),
      });
    default:
      throw new Error(`Unsupported column type: ${column.type}`);
  }
}

// 4️⃣ Migration function
async function migrate() {
  for (const tableDef of tables) {
    try {
      console.log(`Creating/updating table: ${tableDef.name}`);

      // Create table if not exists
      await tablesDB.createTable({
        databaseId,
        tableId: tableDef.id,
        name: tableDef.name,
        permissions: [`read("any")`], // adjust as needed
        rowSecurity: false,
        enabled: true,
      });

      // Add columns
      for (const column of tableDef.columns) {
        try {
          await addColumn(databaseId, tableDef.id, column);
          console.log(`✅ Added column: ${column.key} (${column.type})`);
        } catch (colErr) {
          console.error(
            `⚠️ Column "${column.key}" might already exist or failed:`,
            colErr.message
          );
        }
      }
    } catch (error) {
      console.error(
        `Error creating/updating table ${tableDef.name}:`,
        error.message
      );
    }
  }
}

migrate();

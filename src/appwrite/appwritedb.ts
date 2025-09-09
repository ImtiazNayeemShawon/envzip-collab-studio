import { Client, Databases, ID } from "appwrite";
import authService from "./auth";

const datbaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;



export const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)

const database = new Databases(client)

export default database

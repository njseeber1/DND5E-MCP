#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

const API_BASE_URL = "https://www.dnd5eapi.co/api";

interface APIReference {
  index: string;
  name: string;
  url: string;
}

interface ListResponse {
  count: number;
  results: APIReference[];
}

// Available endpoints
const ENDPOINTS = [
  "ability-scores",
  "alignments",
  "backgrounds",
  "classes",
  "conditions",
  "damage-types",
  "equipment-categories",
  "equipment",
  "feats",
  "features",
  "languages",
  "magic-items",
  "magic-schools",
  "monsters",
  "proficiencies",
  "races",
  "rule-sections",
  "rules",
  "skills",
  "spells",
  "subclasses",
  "subraces",
  "traits",
  "weapon-properties",
];

const server = new Server(
  {
    name: "dnd5e-api-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Helper function to make API requests
async function makeAPIRequest(path: string): Promise<any> {
  try {
    const response = await axios.get(`${API_BASE_URL}${path}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        `API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
      );
    }
    throw new Error(`Request failed: ${error.message}`);
  }
}

// List all available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_endpoints",
        description:
          "Get a list of all available D&D 5e API endpoints and their URLs",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "list_resources",
        description:
          "Get a list of all available resources for a specific endpoint (e.g., all spells, all monsters)",
        inputSchema: {
          type: "object",
          properties: {
            endpoint: {
              type: "string",
              description: `The endpoint to list resources from. Available: ${ENDPOINTS.join(", ")}`,
              enum: ENDPOINTS,
            },
          },
          required: ["endpoint"],
        },
      },
      {
        name: "get_resource",
        description:
          "Get detailed information about a specific resource by its index (e.g., a specific spell, monster, or class)",
        inputSchema: {
          type: "object",
          properties: {
            endpoint: {
              type: "string",
              description: `The endpoint type. Available: ${ENDPOINTS.join(", ")}`,
              enum: ENDPOINTS,
            },
            index: {
              type: "string",
              description:
                "The index/ID of the resource (e.g., 'fireball' for a spell, 'ancient-red-dragon' for a monster)",
            },
          },
          required: ["endpoint", "index"],
        },
      },
      {
        name: "search_spells",
        description:
          "Search for spells with optional filters (level, school, class)",
        inputSchema: {
          type: "object",
          properties: {
            level: {
              type: "number",
              description: "Filter by spell level (0-9)",
              minimum: 0,
              maximum: 9,
            },
            school: {
              type: "string",
              description:
                "Filter by magic school (e.g., evocation, abjuration, conjuration)",
            },
            class: {
              type: "string",
              description: "Filter by class (e.g., wizard, cleric, bard)",
            },
          },
        },
      },
      {
        name: "search_monsters",
        description:
          "Search for monsters with optional filters (challenge rating, type)",
        inputSchema: {
          type: "object",
          properties: {
            challenge_rating: {
              type: "number",
              description: "Filter by challenge rating (CR)",
            },
            type: {
              type: "string",
              description:
                "Filter by monster type (e.g., dragon, undead, humanoid)",
            },
          },
        },
      },
      {
        name: "get_class_levels",
        description:
          "Get level progression details for a specific class",
        inputSchema: {
          type: "object",
          properties: {
            class_index: {
              type: "string",
              description:
                "The class index (e.g., 'wizard', 'fighter', 'cleric')",
            },
            level: {
              type: "number",
              description: "Optional: Get details for a specific level (1-20)",
              minimum: 1,
              maximum: 20,
            },
          },
          required: ["class_index"],
        },
      },
      {
        name: "get_class_spells",
        description:
          "Get all spells available to a specific class",
        inputSchema: {
          type: "object",
          properties: {
            class_index: {
              type: "string",
              description:
                "The class index (e.g., 'wizard', 'cleric', 'bard')",
            },
          },
          required: ["class_index"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "list_endpoints": {
        const data = await makeAPIRequest("/");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case "list_resources": {
        const { endpoint } = args as { endpoint: string };
        const data: ListResponse = await makeAPIRequest(`/${endpoint}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case "get_resource": {
        const { endpoint, index } = args as {
          endpoint: string;
          index: string;
        };
        const data = await makeAPIRequest(`/${endpoint}/${index}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case "search_spells": {
        const { level, school, class: className } = args as {
          level?: number;
          school?: string;
          class?: string;
        };

        const params = new URLSearchParams();
        if (level !== undefined) params.append("level", level.toString());
        if (school) params.append("school", school);
        if (className) params.append("class", className);

        const queryString = params.toString();
        const path = `/spells${queryString ? `?${queryString}` : ""}`;
        const data = await makeAPIRequest(path);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case "search_monsters": {
        const { challenge_rating, type } = args as {
          challenge_rating?: number;
          type?: string;
        };

        const params = new URLSearchParams();
        if (challenge_rating !== undefined)
          params.append("challenge_rating", challenge_rating.toString());
        if (type) params.append("type", type);

        const queryString = params.toString();
        const path = `/monsters${queryString ? `?${queryString}` : ""}`;
        const data = await makeAPIRequest(path);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case "get_class_levels": {
        const { class_index, level } = args as {
          class_index: string;
          level?: number;
        };

        const path = level
          ? `/classes/${class_index}/levels/${level}`
          : `/classes/${class_index}/levels`;

        const data = await makeAPIRequest(path);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case "get_class_spells": {
        const { class_index } = args as { class_index: string };
        const data = await makeAPIRequest(`/classes/${class_index}/spells`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("D&D 5e API MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});